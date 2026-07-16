import { requireSession } from "@/lib/session";
import { getMonthTransactions } from "@/lib/queries";
import {
  currentMonthKey,
  lastMonthKeys,
  monthShortLabel,
} from "@/lib/dates";
import { sumAmounts, formatBRL } from "@/lib/money";
import { MonthSwitcher } from "@/components/month-switcher";
import { CategoryDonut, type CategorySlice } from "@/components/charts/category-donut";
import { MonthlyBars } from "@/components/charts/monthly-bars";
import { BalanceTrend } from "@/components/charts/balance-trend";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ScreenBody } from "@/components/ui/page-header";
import { PieChart } from "lucide-react";

export default async function ChartsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { householdId } = await requireSession();
  const sp = await searchParams;
  const monthKey =
    sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : currentMonthKey();

  const monthKeys = lastMonthKeys(monthKey, 6);
  const perMonth = await Promise.all(
    monthKeys.map((k) => getMonthTransactions(householdId, k)),
  );

  // Barras e tendência dos últimos 6 meses
  const monthly = monthKeys.map((k, i) => {
    const txs = perMonth[i];
    const entradas = sumAmounts(
      txs.filter((t) => t.type === "income").map((t) => t.amount),
    );
    const saidas = sumAmounts(
      txs.filter((t) => t.type === "expense").map((t) => t.amount),
    );
    return { month: monthShortLabel(k), entradas, saidas, saldo: entradas - saidas };
  });

  // Distribuição por categoria (mês selecionado = último da lista)
  const currentTxs = perMonth[perMonth.length - 1];
  const byCategory = new Map<string, CategorySlice>();
  for (const t of currentTxs) {
    if (t.type !== "expense") continue;
    const key = t.categoryName ?? "Sem categoria";
    const color = t.categoryColor ?? "#94a3b8";
    const prev = byCategory.get(key);
    byCategory.set(key, {
      name: key,
      color,
      value: (prev?.value ?? 0) + Number(t.amount),
    });
  }
  const categorySlices = Array.from(byCategory.values()).sort(
    (a, b) => b.value - a.value,
  );
  const totalExpense = categorySlices.reduce((a, d) => a + d.value, 0);

  return (
    <>
      <PageHeader
        eyebrow="Relatórios"
        title="Gráficos"
        action={<MonthSwitcher monthKey={monthKey} basePath="/graficos" />}
      />

      <ScreenBody className="space-y-4">
        <Card className="animate-fade-up">
          <CardContent className="p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em]">
                Entradas × Saídas
              </h2>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                6 meses
              </span>
            </div>
            <MonthlyBars data={monthly} />
          </CardContent>
        </Card>

        <Card className="animate-fade-up [animation-delay:60ms]">
          <CardContent className="p-5">
            <h2 className="mb-3 font-display text-[17px] font-semibold tracking-[-0.02em]">
              Evolução do saldo
            </h2>
            <BalanceTrend data={monthly} />
          </CardContent>
        </Card>

        <Card className="animate-fade-up [animation-delay:120ms]">
          <CardContent className="p-5">
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em]">
              Saídas por categoria
            </h2>
            <p className="mb-4 mt-0.5 font-mono text-[12.5px] text-muted-foreground tnum">
              Total: {formatBRL(totalExpense)}
            </p>
            {categorySlices.length > 0 ? (
              <CategoryDonut data={categorySlices} />
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-primary">
                  <PieChart className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Sem saídas neste mês para exibir.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </ScreenBody>
    </>
  );
}
