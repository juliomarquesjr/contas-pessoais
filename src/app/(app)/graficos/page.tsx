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
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Gráficos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe para onde o dinheiro está indo.
        </p>
      </header>

      <MonthSwitcher monthKey={monthKey} basePath="/graficos" />

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 font-semibold">Entradas x Saídas (6 meses)</h2>
          <MonthlyBars data={monthly} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 font-semibold">Evolução do saldo</h2>
          <BalanceTrend data={monthly} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-1 font-semibold">Saídas por categoria</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Total de saídas no mês: {formatBRL(totalExpense)}
          </p>
          {categorySlices.length > 0 ? (
            <CategoryDonut data={categorySlices} />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                <PieChart className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Sem saídas neste mês para exibir.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
