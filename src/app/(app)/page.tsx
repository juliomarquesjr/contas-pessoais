import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getMonthTransactions, getCurrentUser } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import {
  currentMonthKey,
  prevMonthKey,
  monthLabel,
} from "@/lib/dates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sumAmounts, formatBRL } from "@/lib/money";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryIcon } from "@/components/category-icon";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  PartyPopper,
  AlertTriangle,
  Clock,
  Wallet,
  PieChart,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId, householdId, name } = await requireSession();
  const monthKey = currentMonthKey();

  const [txs, prevTxs, me] = await Promise.all([
    getMonthTransactions(householdId, monthKey),
    getMonthTransactions(householdId, prevMonthKey(monthKey)),
    getCurrentUser(userId),
  ]);

  const incomeTx = txs.filter((t) => t.type === "income");
  const expenseTx = txs.filter((t) => t.type === "expense");
  const totalIncome = sumAmounts(incomeTx.map((t) => t.amount));
  const totalExpense = sumAmounts(expenseTx.map((t) => t.amount));
  const balance = totalIncome - totalExpense;

  const paidExpense = sumAmounts(
    expenseTx.filter((t) => t.paid).map((t) => t.amount),
  );
  const pendingExpense = totalExpense - paidExpense;
  const pendingBillsCount = expenseTx.filter((t) => !t.paid).length;
  const paidRatio = totalExpense > 0 ? paidExpense / totalExpense : 1;

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

  // Status de saúde financeira
  const health = isEmpty
    ? {
        tone: "muted" as const,
        icon: Wallet,
        title: "Vamos começar?",
        text: "Adicione suas entradas e contas do mês para acompanhar tudo aqui.",
      }
    : balance < 0
      ? {
          tone: "danger" as const,
          icon: AlertTriangle,
          title: "Atenção às despesas",
          text: "Suas saídas passaram das entradas neste mês. Que tal revisar os gastos?",
        }
      : pendingExpense > 0
        ? {
            tone: "warning" as const,
            icon: Clock,
            title: "Você tem contas a pagar",
            text: `Ainda faltam ${formatBRL(pendingExpense)} em ${pendingBillsCount} ${
              pendingBillsCount === 1 ? "conta" : "contas"
            } este mês.`,
          }
        : {
            tone: "success" as const,
            icon: PartyPopper,
            title: "Tudo em dia! 🎉",
            text: "As contas do mês estão pagas e o saldo está positivo. Mandou bem!",
          };

  const healthStyles = {
    success: "from-income/15 to-transparent text-income",
    warning: "from-amber-400/20 to-transparent text-amber-600 dark:text-amber-400",
    danger: "from-expense/15 to-transparent text-expense",
    muted: "from-accent to-transparent text-primary",
  }[health.tone];

  return (
    <div>
      <PageHeader
        eyebrow={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        title={
          <span className="flex items-center gap-1.5">
            Olá, {name} <span className="animate-wave inline-block">👋</span>
          </span>
        }
        subtitle="A saúde financeira da casa"
        action={
          <Link href="/ajustes" aria-label="Abrir ajustes">
            <Avatar
              src={me?.avatarUrl}
              name={name}
              className="h-11 w-11 rounded-full text-base shadow-sm"
            />
          </Link>
        }
      />

      <div className="space-y-4">
        {/* Card de saúde financeira */}
        <div
          className={cn(
            "animate-fade-up rounded-3xl border border-border bg-gradient-to-br bg-card p-5",
            healthStyles,
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm">
              <health.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{health.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {health.text}
              </p>
            </div>
          </div>

          {!isEmpty && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Contas pagas</span>
                <span className="font-medium text-foreground">
                  {Math.round(paidRatio * 100)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="animate-grow-x h-full rounded-full bg-income"
                  style={{ width: `${Math.round(paidRatio * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Saldo do mês */}
        <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 [animation-delay:60ms]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Saldo de {monthLabel(monthKey)}
            </p>
            {expenseChange !== null && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  expenseChange > 0
                    ? "bg-expense-soft text-expense"
                    : "bg-income-soft text-income",
                )}
              >
                {expenseChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(Math.round(expenseChange))}% vs mês passado
              </span>
            )}
          </div>
          <p
            className={cn(
              "mt-1 text-4xl font-bold tabular-nums",
              balance >= 0 ? "text-foreground" : "text-expense",
            )}
          >
            {formatBRL(balance)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-income-soft/60 p-3">
              <div className="flex items-center gap-1.5 text-income">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-medium">Entradas</span>
              </div>
              <p className="mt-1 font-semibold tabular-nums text-income">
                {formatBRL(totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl bg-expense-soft/60 p-3">
              <div className="flex items-center gap-1.5 text-expense">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-xs font-medium">Saídas</span>
              </div>
              <p className="mt-1 font-semibold tabular-nums text-expense">
                {formatBRL(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas a pagar */}
        {pendingExpense > 0 && (
          <Link
            href="/mes"
            className="animate-fade-up flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10 [animation-delay:120ms]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                A pagar este mês
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                {formatBRL(pendingExpense)} em {pendingBillsCount}{" "}
                {pendingBillsCount === 1 ? "conta" : "contas"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </Link>
        )}

        {/* Onde vai o dinheiro */}
        {topCats.length > 0 && (
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 [animation-delay:180ms]">
            <h2 className="mb-3 font-semibold">Onde vai o dinheiro</h2>
            <div className="space-y-3">
              {topCats.map((c) => {
                const pct = totalExpense > 0 ? (c.value / totalExpense) * 100 : 0;
                return (
                  <div key={c.name}>
                    <div className="mb-1 flex items-center gap-2 text-sm">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: c.color + "22", color: c.color }}
                      >
                        <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="font-medium tabular-nums">
                        {formatBRL(c.value)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="animate-grow-x h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/graficos"
              className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary"
            >
              Ver todos os gráficos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Atalhos */}
        <div className="grid grid-cols-3 gap-3">
          <QuickLink href="/mes" icon={Wallet} label="Lançamentos" />
          <QuickLink href="/graficos" icon={PieChart} label="Gráficos" />
          <QuickLink href="/compras" icon={ShoppingCart} label="Compras" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition active:scale-[0.97]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
