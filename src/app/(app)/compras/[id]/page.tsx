import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getShoppingList } from "@/lib/queries";
import { formatBRL } from "@/lib/money";
import { AddItemForm } from "@/components/add-item-form";
import { ConvertListButton, DeleteListButton } from "@/components/list-actions";
import { Card, CardContent } from "@/components/ui/card";
import { toggleItem, deleteItem } from "@/app/(app)/actions/shopping";
import {
  ChevronLeft,
  Check,
  Trash2,
  Store,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ShoppingListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { householdId } = await requireSession();
  const { id } = await params;
  const listId = Number(id);
  if (!Number.isInteger(listId)) notFound();

  const list = await getShoppingList(householdId, listId);
  if (!list) notFound();

  const total = list.items.reduce(
    (acc, it) => acc + Number(it.price ?? 0) * Number(it.quantity ?? 1),
    0,
  );
  const checkedCount = list.items.filter((i) => i.checked).length;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link
          href="/compras"
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{list.title}</h1>
          {list.supplierName && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Store className="h-3 w-3" />
              {list.supplierName}
            </p>
          )}
        </div>
        {list.status === "done" && (
          <span className="flex items-center gap-1 rounded-full bg-income-soft px-3 py-1 text-xs font-medium text-income">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Concluída
          </span>
        )}
      </header>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total estimado</p>
            <p className="text-2xl font-bold tabular-nums">{formatBRL(total)}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {checkedCount}/{list.items.length} comprados
          </p>
        </CardContent>
      </Card>

      <AddItemForm listId={list.id} />

      {list.items.length > 0 ? (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card px-3">
          {list.items.map((item) => {
            const lineTotal =
              Number(item.price ?? 0) * Number(item.quantity ?? 1);
            return (
              <div key={item.id} className="flex items-center gap-3 py-2.5">
                <form action={toggleItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="listId" value={list.id} />
                  <input
                    type="hidden"
                    name="checked"
                    value={String(item.checked)}
                  />
                  <button
                    type="submit"
                    aria-label={item.checked ? "Desmarcar" : "Marcar comprado"}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition",
                      item.checked
                        ? "border-income bg-income text-white"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </form>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate font-medium",
                      item.checked && "text-muted-foreground line-through",
                    )}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Number(item.quantity)}x
                    {item.price
                      ? ` · ${formatBRL(item.price)} un.`
                      : " · sem preço"}
                  </p>
                </div>

                <span className="shrink-0 font-medium tabular-nums">
                  {lineTotal > 0 ? formatBRL(lineTotal) : "—"}
                </span>

                <form action={deleteItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="listId" value={list.id} />
                  <button
                    type="submit"
                    aria-label="Remover item"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-expense-soft hover:text-expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Adicione itens usando o campo acima.
        </p>
      )}

      {list.items.length > 0 && list.status !== "done" && (
        <ConvertListButton listId={list.id} total={total} />
      )}

      <div className="pt-2">
        <DeleteListButton listId={list.id} />
      </div>
    </div>
  );
}
