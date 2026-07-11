import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  format,
  parse,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/** "2026-07" -> Date do primeiro dia do mês (local) */
export function parseMonthKey(key: string): Date {
  return parse(key + "-01", "yyyy-MM-dd", new Date());
}

/** Date -> "2026-07" */
export function toMonthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export function currentMonthKey(): string {
  return toMonthKey(new Date());
}

/** Intervalo [primeiro, ultimo] dia do mês em formato yyyy-MM-dd (para coluna DATE) */
export function monthRange(key: string): { start: string; end: string } {
  const base = parseMonthKey(key);
  return {
    start: format(startOfMonth(base), "yyyy-MM-dd"),
    end: format(endOfMonth(base), "yyyy-MM-dd"),
  };
}

export function nextMonthKey(key: string): string {
  return toMonthKey(addMonths(parseMonthKey(key), 1));
}

export function prevMonthKey(key: string): string {
  return toMonthKey(subMonths(parseMonthKey(key), 1));
}

/** "2026-07" -> "Julho 2026" */
export function monthLabel(key: string): string {
  const label = format(parseMonthKey(key), "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "2026-07" -> "jul/26" (rótulo curto para gráficos) */
export function monthShortLabel(key: string): string {
  return format(parseMonthKey(key), "MMM/yy", { locale: ptBR });
}

/** Data padrão (hoje) dentro de um mês, ou dia 1 se o mês não for o atual */
export function defaultDateForMonth(key: string): string {
  const today = new Date();
  if (toMonthKey(today) === key) return format(today, "yyyy-MM-dd");
  return monthRange(key).start;
}

/** Últimos N meses (chaves) terminando em `key`, do mais antigo ao mais recente */
export function lastMonthKeys(key: string, count: number): string[] {
  const keys: string[] = [];
  let cur = key;
  for (let i = 0; i < count; i++) {
    keys.unshift(cur);
    cur = prevMonthKey(cur);
  }
  return keys;
}

export function formatDateBR(iso: string): string {
  return format(parse(iso, "yyyy-MM-dd", new Date()), "dd/MM", { locale: ptBR });
}
