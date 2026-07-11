import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getShoppingLists, getSuppliers } from "@/lib/queries";
import { formatBRL } from "@/lib/money";
import { NewListButton } from "@/components/new-list-form";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ShoppingCart, CheckCircle2, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ShoppingPage() {
  const { householdId } = await requireSession();
  const [lists, suppliers] = await Promise.all([
    getShoppingLists(householdId),
    getSuppliers(householdId),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Compras</h1>
        <p className="text-sm text-muted-foreground">
          Suas listas por fornecedor ou local.
        </p>
      </header>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className="font-medium">Nenhuma lista ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque no + para criar sua primeira lista de compras.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <Link key={list.id} href={`/compras/${list.id}`}>
              <Card className="transition active:scale-[0.99]">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                      list.status === "done"
                        ? "bg-income-soft text-income"
                        : "bg-accent text-primary",
                    )}
                  >
                    {list.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <ShoppingCart className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{list.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      {list.supplierName && (
                        <>
                          <Store className="h-3 w-3" />
                          {list.supplierName} ·{" "}
                        </>
                      )}
                      {list.itemCount}{" "}
                      {list.itemCount === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatBRL(list.total)}
                    </p>
                    {list.status === "done" && (
                      <span className="text-xs text-income">Concluída</span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NewListButton suppliers={suppliers} />
    </div>
  );
}
