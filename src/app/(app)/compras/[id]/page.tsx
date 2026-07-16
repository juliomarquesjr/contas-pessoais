import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getShoppingList } from "@/lib/queries";
import { formatBRL } from "@/lib/money";
import { AddItemForm } from "@/components/add-item-form";
import { ConvertListButton, DeleteListButton } from "@/components/list-actions";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ScreenBody, SectionTitle } from "@/components/ui/page-header";
import { toggleItem, deleteItem } from "@/app/(app)/actions/shopping";
import { Check, Trash2, CheckCircle2 } from "lucide-react";
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
  const pct = list.items.length
    ? Math.round((checkedCount / list.items.length) * 100)
    : 0;

  return (
    <>
      <PageHeader
        backHref="/compras"
        eyebrow={list.supplierName ?? "Lista"}
        title={list.title}
        action={<DeleteListButton listId={list.id} />}
      />

      <ScreenBody className="space-y-4">
        {/* Hero: anel de progresso + total */}
        <Card className="animate-fade-up">
          <CardContent className="flex items-center gap-3.5 p-4">
            <div
              className="flex h-15.5 w-15.5 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--primary) 0 ${pct}%, color-mix(in srgb, var(--foreground) 10%, transparent) ${pct}% 100%)`,
              }}
            >
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-card font-mono text-[12.5px] font-semibold text-primary tnum">
                {checkedCount}/{list.items.length}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] text-muted-foreground">
                Total estimado
              </p>
              <p className="snum my-px text-[34px] leading-none">
                {formatBRL(total)}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                {checkedCount} de {list.items.length}{" "}
                {list.items.length === 1 ? "item comprado" : "itens comprados"}
              </p>
            </div>
            {list.status === "done" && (
              <span className="flex shrink-0 items-center gap-1 self-start rounded-full bg-income-soft px-2.5 py-1 text-[11.5px] font-semibold text-income">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Concluída
              </span>
            )}
          </CardContent>
        </Card>

        <AddItemForm listId={list.id} />

        {list.items.length > 0 ? (
          <div>
            <SectionTitle>Itens · {list.items.length}</SectionTitle>
            <div className="divide-y divide-border rounded-[18px] border border-border bg-card px-3.5 shadow-card">
              {list.items.map((item) => {
                const lineTotal =
                  Number(item.price ?? 0) * Number(item.quantity ?? 1);
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <form action={toggleItem} className="flex">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="listId" value={list.id} />
                      <input
                        type="hidden"
                        name="checked"
                        value={String(item.checked)}
                      />
                      <button
                        type="submit"
                        aria-label={
                          item.checked ? "Desmarcar" : "Marcar comprado"
                        }
                        className={cn(
                          "flex h-5.5 w-5.5 items-center justify-center rounded-[7px] border-2 transition",
                          item.checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border-strong text-transparent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </button>
                    </form>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[15px] font-semibold",
                          item.checked && "text-faint line-through",
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="mt-px truncate font-mono text-[11.5px] text-muted-foreground tnum">
                        {Number(item.quantity)} un
                        {item.price
                          ? ` · ${formatBRL(item.price)}/un`
                          : " · sem preço"}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 font-mono text-[14.5px] font-semibold tnum",
                        item.checked && "text-faint line-through",
                      )}
                    >
                      {lineTotal > 0 ? formatBRL(lineTotal) : "—"}
                    </span>

                    <form action={deleteItem} className="flex">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="listId" value={list.id} />
                      <button
                        type="submit"
                        aria-label={`Remover ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-expense-soft hover:text-expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Adicione itens usando o campo acima.
          </p>
        )}

        {list.items.length > 0 && list.status !== "done" && (
          <ConvertListButton listId={list.id} total={total} />
        )}
      </ScreenBody>
    </>
  );
}
