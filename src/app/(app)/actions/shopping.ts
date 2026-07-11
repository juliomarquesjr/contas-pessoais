"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/lib/db";
import {
  suppliers,
  shoppingLists,
  shoppingListItems,
  transactions,
} from "@/lib/schema";
import { requireSession } from "@/lib/session";

/** Confirma que a lista pertence à casa do usuário. */
async function assertListOwnership(householdId: number, listId: number) {
  const rows = await db
    .select({ id: shoppingLists.id })
    .from(shoppingLists)
    .where(
      and(
        eq(shoppingLists.id, listId),
        eq(shoppingLists.householdId, householdId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function createSupplier(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(suppliers).values({ householdId, name });
  revalidatePath("/compras");
}

const listSchema = z.object({
  title: z.string().min(1).max(160),
  supplierId: z.coerce.number().int().positive().optional(),
});

export async function createList(formData: FormData): Promise<void> {
  const { householdId, userId } = await requireSession();
  const parsed = listSchema.safeParse({
    title: formData.get("title"),
    supplierId: formData.get("supplierId") || undefined,
  });
  if (!parsed.success) return;

  const created = await db
    .insert(shoppingLists)
    .values({
      householdId,
      createdBy: userId,
      title: parsed.data.title,
      supplierId: parsed.data.supplierId ?? null,
    })
    .returning({ id: shoppingLists.id });

  revalidatePath("/compras");
  redirect(`/compras/${created[0].id}`);
}

export async function deleteList(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  if (!id) return;
  await db
    .delete(shoppingLists)
    .where(
      and(
        eq(shoppingLists.id, id),
        eq(shoppingLists.householdId, householdId),
      ),
    );
  revalidatePath("/compras");
  redirect("/compras");
}

const itemSchema = z.object({
  listId: z.coerce.number().int().positive(),
  name: z.string().min(1).max(160),
  quantity: z.coerce.number().positive().default(1),
  price: z.coerce.number().min(0).optional(),
});

export async function addItem(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const parsed = itemSchema.safeParse({
    listId: formData.get("listId"),
    name: formData.get("name"),
    quantity: formData.get("quantity") || 1,
    price: formData.get("price") || undefined,
  });
  if (!parsed.success) return;
  if (!(await assertListOwnership(householdId, parsed.data.listId))) return;

  await db.insert(shoppingListItems).values({
    listId: parsed.data.listId,
    name: parsed.data.name,
    quantity: String(parsed.data.quantity),
    price: parsed.data.price != null ? parsed.data.price.toFixed(2) : null,
  });
  revalidatePath(`/compras/${parsed.data.listId}`);
}

export async function toggleItem(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  const listId = Number(formData.get("listId"));
  const checked = formData.get("checked") === "true";
  if (!id || !listId) return;
  if (!(await assertListOwnership(householdId, listId))) return;

  await db
    .update(shoppingListItems)
    .set({ checked: !checked })
    .where(eq(shoppingListItems.id, id));
  revalidatePath(`/compras/${listId}`);
}

export async function deleteItem(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  const listId = Number(formData.get("listId"));
  if (!id || !listId) return;
  if (!(await assertListOwnership(householdId, listId))) return;

  await db.delete(shoppingListItems).where(eq(shoppingListItems.id, id));
  revalidatePath(`/compras/${listId}`);
}

/** Cria um gasto no mês com o total da lista e marca a lista como concluída. */
export async function convertListToExpense(formData: FormData): Promise<void> {
  const { householdId, userId } = await requireSession();
  const listId = Number(formData.get("id"));
  if (!listId) return;

  const list = (
    await db
      .select({
        id: shoppingLists.id,
        title: shoppingLists.title,
        supplierId: shoppingLists.supplierId,
      })
      .from(shoppingLists)
      .where(
        and(
          eq(shoppingLists.id, listId),
          eq(shoppingLists.householdId, householdId),
        ),
      )
      .limit(1)
  )[0];
  if (!list) return;

  const items = await db
    .select({
      price: shoppingListItems.price,
      quantity: shoppingListItems.quantity,
    })
    .from(shoppingListItems)
    .where(eq(shoppingListItems.listId, listId));

  const total = items.reduce(
    (acc, it) => acc + Number(it.price ?? 0) * Number(it.quantity ?? 1),
    0,
  );

  let supplierName = "";
  if (list.supplierId) {
    const s = (
      await db
        .select({ name: suppliers.name })
        .from(suppliers)
        .where(eq(suppliers.id, list.supplierId))
        .limit(1)
    )[0];
    supplierName = s?.name ? ` (${s.name})` : "";
  }

  if (total > 0) {
    await db.insert(transactions).values({
      householdId,
      createdBy: userId,
      type: "expense",
      description: `${list.title}${supplierName}`,
      amount: total.toFixed(2),
      date: format(new Date(), "yyyy-MM-dd"),
      categoryId: null,
    });
  }

  await db
    .update(shoppingLists)
    .set({ status: "done" })
    .where(eq(shoppingLists.id, listId));

  revalidatePath(`/compras/${listId}`);
  revalidatePath("/compras");
  revalidatePath("/");
  redirect("/");
}
