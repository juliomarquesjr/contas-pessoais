import { requireSession } from "@/lib/session";
import { getMonthTransactions, getCategories } from "@/lib/queries";
import { currentMonthKey, defaultDateForMonth } from "@/lib/dates";
import { sumAmounts, formatBRL } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { AddTransactionFab } from "@/components/add-transaction-fab";
import { TransactionItem } from "@/components/transaction-item";
import { CopyMonthButton } from "@/components/copy-month-button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowDownRight, ArrowUpRight, Inbox, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MonthPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { householdId } = await requireSession();
  const sp = await searchParams;
  const monthKey =
    sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : currentMonthKey();

  const [txs, categories] = await Promise.all([
    getMonthTransactions(householdId, monthKey),
    getCategories(householdId),
  ]);

  const incomeTx = txs.filter((t) => t.type === "income");
  const expenseTx = txs.filter((t) => t.type === "expense");
  const totalIncome = sumAmounts(incomeTx.map((t) => t.amount));
  const totalExpense = sumAmounts(expenseTx.map((t) => t.amount));
  const balance = totalIncome - totalExpense;
  const pendingExpense = sumAmounts(
    expenseTx.filter((t) => !t.paid).map((t) => t.amount),
  );
  const pendingIncome = sumAmounts(
    incomeTx.filter((t) => !t.paid).map((t) => t.amount),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Financeiro"
        title="Lançamentos"
        subtitle="Entradas e saídas do mês"
      />

      <div className="space-y-5">
        <MonthSwitcher monthKey={monthKey} basePath="/mes" />

        {/* Saldo destaque */}
        <div className="app-gradient rounded-3xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Saldo do mês</p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tabular-nums",
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

          {(pendingExpense > 0 || pendingIncome > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {pendingExpense > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  <Clock className="h-3 w-3" />A pagar {formatBRL(pendingExpense)}
                </span>
              )}
              {pendingIncome > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-medium text-primary">
                  <Clock className="h-3 w-3" />A receber{" "}
                  {formatBRL(pendingIncome)}
                </span>
              )}
            </div>
          )}
        </div>

        {txs.length === 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="font-medium">Nenhum lançamento neste mês</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Toque no + para adicionar ou copie o mês anterior.
              </p>
            </div>
            <CopyMonthButton monthKey={monthKey} />
          </div>
        ) : (
          <div className="space-y-6">
            {expenseTx.length > 0 && (
              <Section title="Saídas">
                {expenseTx.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} categories={categories} />
                ))}
              </Section>
            )}
            {incomeTx.length > 0 && (
              <Section title="Entradas">
                {incomeTx.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} categories={categories} />
                ))}
              </Section>
            )}
            <CopyMonthButton monthKey={monthKey} />
          </div>
        )}

        <AddTransactionFab
          categories={categories}
          defaultDate={defaultDateForMonth(monthKey)}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 px-1 text-sm font-semibold text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
        {children}
      </div>
    </section>
  );
}
