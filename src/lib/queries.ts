import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  transactions,
  categories,
  suppliers,
  shoppingLists,
  shoppingListItems,
  users,
} from "@/lib/schema";
import { monthRange } from "@/lib/dates";

export type TransactionWithCategory = {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: string;
  date: string;
  paid: boolean;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  categoryIcon: string | null;
};

export async function getMonthTransactions(
  householdId: number,
  monthKey: string,
): Promise<TransactionWithCategory[]> {
  const { start, end } = monthRange(monthKey);
  return db
    .select({
      id: transactions.id,
      type: transactions.type,
      description: transactions.description,
      amount: transactions.amount,
      date: transactions.date,
      paid: transactions.paid,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.householdId, householdId),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    )
    .orderBy(desc(transactions.date), desc(transactions.id));
}

export async function getCategories(householdId: number) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.householdId, householdId))
    .orderBy(asc(categories.type), asc(categories.name));
}

export async function getSuppliers(householdId: number) {
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.householdId, householdId))
    .orderBy(asc(suppliers.name));
}

export type ShoppingListSummary = {
  id: number;
  title: string;
  status: "open" | "done";
  supplierName: string | null;
  itemCount: number;
  total: number;
};

export async function getShoppingLists(
  householdId: number,
): Promise<ShoppingListSummary[]> {
  const lists = await db
    .select({
      id: shoppingLists.id,
      title: shoppingLists.title,
      status: shoppingLists.status,
      supplierName: suppliers.name,
    })
    .from(shoppingLists)
    .leftJoin(suppliers, eq(shoppingLists.supplierId, suppliers.id))
    .where(eq(shoppingLists.householdId, householdId))
    .orderBy(desc(shoppingLists.createdAt));

  const result: ShoppingListSummary[] = [];
  for (const list of lists) {
    const items = await db
      .select({
        price: shoppingListItems.price,
        quantity: shoppingListItems.quantity,
      })
      .from(shoppingListItems)
      .where(eq(shoppingListItems.listId, list.id));
    const total = items.reduce(
      (acc, it) => acc + Number(it.price ?? 0) * Number(it.quantity ?? 1),
      0,
    );
    result.push({ ...list, itemCount: items.length, total });
  }
  return result;
}

export async function getShoppingList(householdId: number, listId: number) {
  const list = (
    await db
      .select({
        id: shoppingLists.id,
        title: shoppingLists.title,
        status: shoppingLists.status,
        supplierId: shoppingLists.supplierId,
        supplierName: suppliers.name,
      })
      .from(shoppingLists)
      .leftJoin(suppliers, eq(shoppingLists.supplierId, suppliers.id))
      .where(
        and(
          eq(shoppingLists.id, listId),
          eq(shoppingLists.householdId, householdId),
        ),
      )
      .limit(1)
  )[0];

  if (!list) return null;

  const items = await db
    .select()
    .from(shoppingListItems)
    .where(eq(shoppingListItems.listId, listId))
    .orderBy(asc(shoppingListItems.checked), asc(shoppingListItems.id));

  return { ...list, items };
}

export async function getMembers(householdId: number) {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.householdId, householdId))
    .orderBy(asc(users.name));
}
