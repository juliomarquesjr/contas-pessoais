import { differenceInCalendarDays } from "date-fns";
import { evaluateItem, kmPerDayFrom } from "@/lib/maintenance";
import { parseISODate } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import type { VehicleWithState } from "@/lib/queries";
import type { TransactionWithCategory } from "@/lib/queries";

/**
 * O que a casa precisa saber agora, num lugar só.
 *
 * A regra é: só entra o que **pede uma ação**. "Está tudo bem" não é
 * notificação — um sino que sempre tem algo deixa de ser lido.
 */

export type NotifTone = "expense" | "pending" | "receive";

export type Notification = {
  id: string;
  tone: NotifTone;
  /** Nome do ícone (components/nav-icon ou lucide direto pelo componente). */
  icon: "clock" | "gauge" | "wrench" | "coins";
  title: string;
  text: string;
  href: string;
};

export function buildNotifications({
  txs,
  fleet,
  today = new Date(),
}: {
  txs: TransactionWithCategory[];
  fleet: VehicleWithState[];
  today?: Date;
}): Notification[] {
  const out: Notification[] = [];

  // --- Finanças ---
  const expense = txs.filter((t) => t.type === "expense");
  const unpaid = expense.filter((t) => !t.paid);
  if (unpaid.length) {
    const total = unpaid.reduce((a, t) => a + Number(t.amount), 0);
    out.push({
      id: "bills",
      tone: "pending",
      icon: "clock",
      title: `${unpaid.length} ${unpaid.length === 1 ? "conta a pagar" : "contas a pagar"}`,
      text: `${formatBRL(total)} este mês`,
      href: "/mes",
    });
  }

  const toReceive = txs.filter((t) => t.type === "income" && !t.paid);
  if (toReceive.length) {
    const total = toReceive.reduce((a, t) => a + Number(t.amount), 0);
    out.push({
      id: "receivables",
      tone: "receive",
      icon: "coins",
      title: `${toReceive.length} ${toReceive.length === 1 ? "entrada a receber" : "entradas a receber"}`,
      text: `${formatBRL(total)} este mês`,
      href: "/mes",
    });
  }

  // --- Manutenção ---
  for (const { vehicle, items, readings } of fleet) {
    const last = readings[0];

    // Leitura vencida: é isso que faz o app "pedir a km periodicamente".
    if (vehicle.reminderDays > 0) {
      const daysSince = last
        ? differenceInCalendarDays(today, parseISODate(last.date))
        : Infinity;
      if (daysSince >= vehicle.reminderDays) {
        /* O nome do veículo vai na 2ª linha: no título, "Qual a
           quilometragem do Fiat Argo?" trunca já em telas de 390px. */
        out.push({
          id: `km-${vehicle.id}`,
          tone: "pending",
          icon: "gauge",
          title: "Atualizar a quilometragem",
          text: last
            ? `${vehicle.name} · última leitura há ${daysSince} dias`
            : `${vehicle.name} · ainda sem leitura`,
          href: `/veiculos/${vehicle.id}`,
        });
      }
    }

    const kmPerDay = kmPerDayFrom(readings);
    const states = items.map((it) =>
      evaluateItem(it, last?.km ?? null, today, kmPerDay),
    );
    const overdue = states.filter((s) => s.status === "overdue").length;
    const soon = states.filter((s) => s.status === "soon").length;

    if (overdue > 0) {
      out.push({
        id: `overdue-${vehicle.id}`,
        tone: "expense",
        icon: "wrench",
        title: `${overdue} ${overdue === 1 ? "item vencido" : "itens vencidos"}`,
        text: `${vehicle.name} · manutenção atrasada`,
        href: `/veiculos/${vehicle.id}`,
      });
    } else if (soon > 0) {
      out.push({
        id: `soon-${vehicle.id}`,
        tone: "pending",
        icon: "wrench",
        title: `${soon} ${soon === 1 ? "item vence logo" : "itens vencem logo"}`,
        text: `${vehicle.name} · manutenção chegando`,
        href: `/veiculos/${vehicle.id}`,
      });
    }
  }

  // Atrasado antes de "chegando".
  const rank: Record<NotifTone, number> = { expense: 0, pending: 1, receive: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
}
