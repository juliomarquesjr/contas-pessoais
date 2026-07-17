import Link from "next/link";
import { requireSession } from "@/lib/session";
import {
  getMonthTransactions,
  getCurrentUser,
  getVehiclesWithState,
} from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import { AppsDrawer } from "@/components/apps-drawer";
import { NotificationsBell } from "@/components/notifications-bell";
import { buildNotifications } from "@/lib/notifications";
import { currentMonthKey, prevMonthKey, monthLabel } from "@/lib/dates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sumAmounts, formatBRL } from "@/lib/money";
import { PageHeader, ScreenBody, SectionTitle } from "@/components/ui/page-header";
import { CategorySwatch } from "@/components/ui/category-swatch";
import {
  ArrowUpRight,
  ArrowDownRight,
  PartyPopper,
  AlertTriangle,
  Clock,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId, householdId, name } = await requireSession();
  const monthKey = currentMonthKey();

  const [txs, prevTxs, me, fleet] = await Promise.all([
    getMonthTransactions(householdId, monthKey),
    getMonthTransactions(householdId, prevMonthKey(monthKey)),
    getCurrentUser(userId),
    getVehiclesWithState(householdId),
  ]);

  const incomeTx = txs.filter((t) => t.type === "income");
  const expenseTx = txs.filter((t) => t.type === "expense");
  const totalIncome = sumAmounts(incomeTx.map((t) => t.amount));
  const totalExpense = sumAmounts(expenseTx.map((t) => t.amount));
  const balance = totalIncome - totalExpense;

  const pendingExpense =
    totalExpense - sumAmounts(expenseTx.filter((t) => t.paid).map((t) => t.amount));
  const pendingBillsCount = expenseTx.filter((t) => !t.paid).length;

  const prevExpense = sumAmounts(
    prevTxs.filter((t) => t.type === "expense").map((t) => t.amount),
  );
  const expenseChange =
    prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : null;

  // Top 3 categorias de saída
  const byCat = new Map<
    string,
    { name: string; color: string; icon: string | null; value: number }
  >();
  for (const t of expenseTx) {
    const key = t.categoryName ?? "Sem categoria";
    const prev = byCat.get(key);
    byCat.set(key, {
      name: key,
      color: t.categoryColor ?? "#94a3b8",
      icon: t.categoryIcon,
      value: (prev?.value ?? 0) + Number(t.amount),
    });
  }
  const topCats = Array.from(byCat.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const isEmpty = txs.length === 0;

  /* O handoff desenha só o aviso "a pagar". Mantemos os outros estados de
     saúde da casa no mesmo slot, trocando a cor semântica. */
  const alert = isEmpty
    ? {
        tone: "muted" as const,
        icon: Wallet,
        title: "Vamos começar?",
        text: "Adicione as entradas e contas do mês.",
        money: false,
        href: "/mes",
      }
    : balance < 0
      ? {
          tone: "expense" as const,
          icon: AlertTriangle,
          title: "Saídas acima das entradas",
          text: `${formatBRL(Math.abs(balance))} no vermelho este mês`,
          money: true,
          href: "/mes",
        }
      : pendingExpense > 0
        ? {
            tone: "pending" as const,
            icon: Clock,
            title: `${pendingBillsCount} ${pendingBillsCount === 1 ? "conta a pagar" : "contas a pagar"} este mês`,
            text: `${formatBRL(pendingExpense)} · vence em breve`,
            money: true,
            href: "/mes",
          }
        : {
            tone: "income" as const,
            icon: PartyPopper,
            title: "Tudo em dia!",
            text: "As contas do mês estão pagas.",
            money: false,
            href: "/mes",
          };

  const toneClass = {
    pending: "bg-pending-soft border-pending/30 text-pending",
    expense: "bg-expense-soft border-expense/30 text-expense",
    income: "bg-income-soft border-income/30 text-income",
    muted: "bg-accent border-primary/30 text-primary",
  }[alert.tone];

  // O sino junta finanças + manutenção; o aviso acima segue sendo o da casa.
  const notifications = buildNotifications({ txs, fleet });

  return (
    <>
      <PageHeader
        eyebrow={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        title={`Olá, ${name}`}
        leading={
          <Link href="/ajustes" aria-label="Abrir ajustes">
            <Avatar
              src={me?.avatarUrl}
              name={name}
              className="h-10.5 w-10.5 shrink-0 rounded-[13px] text-[17px]"
            />
          </Link>
        }
        action={
          <div className="flex items-center gap-1.5">
            <NotificationsBell items={notifications} />
            <AppsDrawer dock={me?.dockItems} />
          </div>
        }
      />

      <ScreenBody className="space-y-4">
        {/* Hero do saldo */}
        <div className="animate-fade-up relative overflow-hidden rounded-[22px] bg-linear-to-br from-primary to-primary-strong p-4.5 text-primary-foreground shadow-[0_20px_40px_-22px_color-mix(in_srgb,var(--primary)_85%,transparent)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-12 h-42.5 w-42.5 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_68%)]"
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-medium opacity-75">
              Saldo de {monthLabel(monthKey)}
            </span>
            {expenseChange !== null && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/16 px-2.5 py-1 font-mono text-xs font-semibold tnum">
                {expenseChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {expenseChange > 0 ? "+" : "−"}
                {Math.abs(Math.round(expenseChange))}%
              </span>
            )}
          </div>

          <p className="snum relative mb-4 mt-1 text-[40px] leading-[0.95]">
            {formatBRL(balance)}
          </p>

          <div className="relative flex border-t border-current/20 pt-3.5 opacity-100">
            <div className="flex-1 pr-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-widest opacity-70">
                Entradas
              </div>
              <div className="snum mt-1 text-[21px] leading-none">
                {formatBRL(totalIncome)}
              </div>
            </div>
            <div className="flex-1 border-l border-current/20 pl-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-widest opacity-70">
                Saídas
              </div>
              <div className="snum mt-1 text-[21px] leading-none">
                {formatBRL(totalExpense)}
              </div>
            </div>
          </div>
        </div>

        {/* Aviso da casa */}
        <Link
          href={alert.href}
          className={cn(
            "animate-fade-up flex items-center gap-3.5 rounded-[18px] border p-4 [animation-delay:60ms]",
            toneClass,
          )}
        >
          <span className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-xl bg-current/20">
            <alert.icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15.5px] font-bold">{alert.title}</span>
            {/* mono só quando a linha é dinheiro — texto corrido em mono fica ruim */}
            <span
              className={cn(
                "mt-0.5 block text-[13px] opacity-80",
                alert.money && "font-mono tnum",
              )}
            >
              {alert.text}
            </span>
          </span>
          <ChevronRight className="h-4.75 w-4.75 shrink-0" />
        </Link>

        {/* Onde vai o dinheiro */}
        {topCats.length > 0 && (
          <div className="animate-fade-up [animation-delay:120ms]">
            <SectionTitle
              action={
                <Link
                  href="/graficos"
                  className="text-[13px] font-semibold text-primary"
                >
                  Ver tudo
                </Link>
              }
            >
              Onde vai o dinheiro
            </SectionTitle>

            <div className="flex flex-col gap-4.25 rounded-[20px] border border-border bg-card p-4.5 shadow-card">
              {topCats.map((c) => {
                const pct = totalExpense > 0 ? (c.value / totalExpense) * 100 : 0;
                return (
                  <div key={c.name}>
                    <div className="mb-2.5 flex items-center gap-3">
                      <CategorySwatch
                        color={c.color}
                        icon={c.icon ?? "tag"}
                        size="sm"
                      />
                      <span className="flex-1 truncate text-[15px] font-semibold">
                        {c.name}
                      </span>
                      <span className="font-mono text-[14.5px] font-semibold tnum">
                        {formatBRL(c.value)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-foreground/8">
                      <div
                        className="animate-grow-x h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScreenBody>
    </>
  );
}
