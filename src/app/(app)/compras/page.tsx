import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getShoppingLists, getSuppliers } from "@/lib/queries";
import { formatBRL } from "@/lib/money";
import { NewListButton } from "@/components/new-list-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ScreenBody } from "@/components/ui/page-header";
import { ChevronRight, ShoppingCart, CheckCircle2, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ShoppingPage() {
  const { householdId } = await requireSession();
  const [lists, suppliers] = await Promise.all([
    getShoppingLists(householdId),
    getSuppliers(householdId),
  ]);

  return (
    <>
      <PageHeader eyebrow="Organização" title="Compras" />

      <ScreenBody className="space-y-3">
        {lists.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border-strong bg-card px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-primary">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <p className="font-display font-semibold">Nenhuma lista ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie uma lista para cada mercado. Ao terminar, vire um gasto no mês
              com um toque.
            </p>
          </div>
        ) : (
          lists.map((list) => (
            <Link
              key={list.id}
              href={`/compras/${list.id}`}
              className="animate-fade-up block"
            >
              <Card className="transition active:scale-[0.99]">
                <CardContent className="flex items-center gap-3.5 p-4">
                  <div
                    className={cn(
                      "flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[13px]",
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
                    <p className="truncate text-[15px] font-semibold">
                      {list.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      {list.supplierName && (
                        <>
                          <Store className="h-3 w-3 shrink-0" />
                          {list.supplierName} ·{" "}
                        </>
                      )}
                      {list.itemCount} {list.itemCount === 1 ? "item" : "itens"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[14.5px] font-semibold tnum">
                      {formatBRL(list.total)}
                    </p>
                    {list.status === "done" && (
                      <span className="text-[11.5px] font-semibold text-income">
                        Concluída
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4.75 w-4.75 shrink-0 text-faint" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        <NewListButton suppliers={suppliers} />
      </ScreenBody>
    </>
  );
}
