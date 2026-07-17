import { addMonths, differenceInCalendarDays, addDays } from "date-fns";
import { parseISODate } from "@/lib/dates";
import type { MaintenanceItem } from "@/lib/schema";

/**
 * Regras de vencimento dos itens de manutenção.
 *
 * Um item pode ser controlado por km, por tempo, ou pelos dois — e quando há
 * os dois, vale **o que vencer primeiro** (é assim que uma troca de óleo
 * "a cada 10.000 km ou 12 meses" funciona na vida real).
 */

export type MaintenanceStatus = "ok" | "soon" | "overdue";

/**
 * De quanto em quanto tempo o app pede a quilometragem.
 *
 * Fonte única: o seletor do cadastro e a frase do sheet saem daqui. Estavam
 * duplicados e podiam divergir — uma opção nova aparecia no seletor mas caía
 * no texto genérico "lembrete a cada N dias".
 */
export const REMINDER_OPTIONS = [
  { days: 7, label: "Semanal", sentence: "lembrete semanal" },
  { days: 15, label: "15 dias", sentence: "lembrete quinzenal" },
  { days: 30, label: "Mensal", sentence: "lembrete mensal" },
  { days: 60, label: "2 meses", sentence: "lembrete a cada 2 meses" },
  { days: 0, label: "Nunca", sentence: "sem lembrete" },
] as const;

export const DEFAULT_REMINDER_DAYS = 30;

/** "lembrete semanal" — para a linha "Fiat Argo · lembrete semanal". */
export function reminderSentence(days: number): string {
  return (
    REMINDER_OPTIONS.find((o) => o.days === days)?.sentence ??
    `lembrete a cada ${days} dias`
  );
}

/** Quanto antes do vencimento o item começa a avisar. */
const SOON_RATIO = 0.1; // 10% do intervalo de km
const SOON_KM_CAP = 1000; // ...mas nunca mais que 1.000 km de antecedência
const SOON_DAYS = 30; // 30 dias de antecedência no tempo

export type MaintenanceState = {
  status: MaintenanceStatus;
  /** 0..1 — quanto do intervalo já foi consumido (o maior entre km e tempo). */
  progress: number;
  /** Km faltando até vencer; null se o item não controla km. */
  kmLeft: number | null;
  /** Dias até vencer (negativo = vencido); null se não controla tempo. */
  daysLeft: number | null;
  /** Data de vencimento por tempo. */
  dueDate: Date | null;
  /** Km de vencimento. */
  dueKm: number | null;
  /** Data prevista de vencimento por km, estimada pela média de uso. */
  forecastDate: Date | null;
  /** Qual dos dois eixos está mandando no status. */
  driver: "km" | "time" | null;
};

/** Descreve o intervalo: "A cada 10.000 km ou 12 meses". */
export function intervalLabel(item: MaintenanceItem): string {
  const parts: string[] = [];
  if (item.intervalKm) parts.push(`${item.intervalKm.toLocaleString("pt-BR")} km`);
  if (item.intervalMonths) {
    parts.push(
      item.intervalMonths === 1 ? "1 mês" : `${item.intervalMonths} meses`,
    );
  }
  if (!parts.length) return "Sem intervalo definido";
  return `A cada ${parts.join(" ou ")}`;
}

function ratio(elapsed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, elapsed / total));
}

/**
 * Avalia um item contra a quilometragem atual e a data de hoje.
 *
 * @param kmPerDay média de uso, para prever quando o km vai bater o limite.
 *                 Sem histórico suficiente vem 0 e não há previsão.
 */
export function evaluateItem(
  item: MaintenanceItem,
  currentKm: number | null,
  today: Date,
  kmPerDay: number,
): MaintenanceState {
  let kmLeft: number | null = null;
  let dueKm: number | null = null;
  let kmProgress = 0;
  let forecastDate: Date | null = null;

  if (item.intervalKm && currentKm !== null) {
    // Sem baseline, conta a partir do km atual: o item passa a valer de agora.
    const base = item.lastDoneKm ?? currentKm;
    dueKm = base + item.intervalKm;
    kmLeft = dueKm - currentKm;
    kmProgress = ratio(currentKm - base, item.intervalKm);
    if (kmLeft > 0 && kmPerDay > 0) {
      forecastDate = addDays(today, Math.round(kmLeft / kmPerDay));
    }
  }

  let daysLeft: number | null = null;
  let dueDate: Date | null = null;
  let timeProgress = 0;

  if (item.intervalMonths) {
    const base = item.lastDoneDate ? parseISODate(item.lastDoneDate) : null;
    if (base) {
      dueDate = addMonths(base, item.intervalMonths);
      daysLeft = differenceInCalendarDays(dueDate, today);
      const total = differenceInCalendarDays(dueDate, base);
      timeProgress = ratio(differenceInCalendarDays(today, base), total);
    }
  }

  // Vence o que vier primeiro: o eixo mais adiantado manda no status.
  const soonKm = Math.min(SOON_KM_CAP, (item.intervalKm ?? 0) * SOON_RATIO);
  const kmStatus: MaintenanceStatus | null =
    kmLeft === null ? null : kmLeft < 0 ? "overdue" : kmLeft <= soonKm ? "soon" : "ok";
  const timeStatus: MaintenanceStatus | null =
    daysLeft === null
      ? null
      : daysLeft < 0
        ? "overdue"
        : daysLeft <= SOON_DAYS
          ? "soon"
          : "ok";

  const rank = { ok: 0, soon: 1, overdue: 2 } as const;
  const candidates: { s: MaintenanceStatus; d: "km" | "time" }[] = [];
  if (kmStatus) candidates.push({ s: kmStatus, d: "km" });
  if (timeStatus) candidates.push({ s: timeStatus, d: "time" });

  const worst = candidates.sort((a, b) => rank[b.s] - rank[a.s])[0];

  return {
    status: worst?.s ?? "ok",
    progress: Math.max(kmProgress, timeProgress),
    kmLeft,
    daysLeft,
    dueDate,
    dueKm,
    forecastDate,
    driver: worst?.d ?? null,
  };
}

/**
 * Média de km por dia a partir do histórico. Usa a primeira e a última
 * leitura: o intervalo longo suaviza viagens e semanas paradas.
 * Retorna 0 quando não dá para estimar.
 */
export function kmPerDayFrom(
  readings: { km: number; date: string }[],
): number {
  if (readings.length < 2) return 0;
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const days = differenceInCalendarDays(
    parseISODate(last.date),
    parseISODate(first.date),
  );
  if (days <= 0) return 0;
  const km = last.km - first.km;
  if (km <= 0) return 0;
  return km / days;
}

export const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  ok: "Em dia",
  soon: "Vence logo",
  overdue: "Vencido",
};

/** Classes por status — mesma escala semântica do resto do app. */
export const STATUS_TEXT: Record<MaintenanceStatus, string> = {
  ok: "text-income",
  soon: "text-pending",
  overdue: "text-expense",
};

export const STATUS_BAR: Record<MaintenanceStatus, string> = {
  ok: "bg-income",
  soon: "bg-pending",
  overdue: "bg-expense",
};

export const STATUS_TINT: Record<MaintenanceStatus, string> = {
  ok: "bg-income-soft text-income",
  soon: "bg-pending-soft text-pending",
  overdue: "bg-expense-soft text-expense",
};
