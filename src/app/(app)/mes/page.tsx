import { requireSession } from "@/lib/session";
import { getMonthTransactions, getCategories } from "@/lib/queries";
import { currentMonthKey, defaultDateForMonth } from "@/lib/dates";
import { sumAmounts, formatBRL } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { AddTransactionFab } from "@/components/add-transaction-fab";
import { MonthTransactions } from "@/components/month-transactions";
import { CopyMonthButton } from "@/components/copy-month-button";
import { PageHeader, ScreenBody } from "@/components/ui/page-header";
import { Inbox, Clock } from "lucide-react";
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
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Lançamentos"
        action={<MonthSwitcher monthKey={monthKey} basePath="/mes" />}
      />

      <ScreenBody className="space-y-4">
        {/* Saldo do mês */}
        <div className="animate-fade-up rounded-[22px] border border-border bg-card p-5 shadow-card">
          <span className="text-[13.5px] font-medium text-muted-foreground">
            Saldo do mês
          </span>
          <p
            className={cn(
              "snum mb-4 text-[44px] leading-[0.95]",
              balance >= 0 ? "text-foreground" : "text-expense",
            )}
          >
            {formatBRL(balance)}
          </p>

          <div className="mb-3.5 flex border-t border-border pt-3.5">
            <div className="flex-1 pr-3.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Entradas
              </div>
              <div className="snum mt-1 text-[23px] leading-none text-income">
                {formatBRL(totalIncome)}
              </div>
            </div>
            <div className="flex-1 border-l border-border pl-3.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Saídas
              </div>
              <div className="snum mt-1 text-[23px] leading-none text-expense">
                {formatBRL(totalExpense)}
              </div>
            </div>
          </div>

          {(pendingExpense > 0 || pendingIncome > 0) && (
            <div className="flex gap-2">
              {pendingExpense > 0 && (
                <span className="flex flex-1 items-center gap-1.5 rounded-full bg-pending-soft px-2.5 py-1.5 font-mono text-xs font-semibold text-pending tnum">
                  <Clock className="h-3.5 w-3.5 shrink-0" />A pagar{" "}
                  {formatBRL(pendingExpense)}
                </span>
              )}
              {pendingIncome > 0 && (
                <span className="flex flex-1 items-center gap-1.5 rounded-full bg-receive-soft px-2.5 py-1.5 font-mono text-xs font-semibold text-receive tnum">
                  <Clock className="h-3.5 w-3.5 shrink-0" />A receber{" "}
                  {formatBRL(pendingIncome)}
                </span>
              )}
            </div>
          )}
        </div>

        <CopyMonthButton monthKey={monthKey} />

        {txs.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border-strong bg-card px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-primary">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="font-display font-semibold">
              Nenhum lançamento neste mês
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Toque no + para adicionar, ou copie o mês anterior no botão acima.
            </p>
          </div>
        ) : (
          <MonthTransactions
            transactions={txs}
            categories={categories}
            monthKey={monthKey}
          />
        )}

        <AddTransactionFab
          categories={categories}
          defaultDate={defaultDateForMonth(monthKey)}
        />
      </ScreenBody>
    </>
  );
}
