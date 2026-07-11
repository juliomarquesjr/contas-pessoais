"use server";

import { z } from "zod";
import { and, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { requireSession } from "@/lib/session";
import { monthRange, parseMonthKey, prevMonthKey } from "@/lib/dates";
import { format, getDaysInMonth, setDate } from "date-fns";

const txSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Informe uma descrição").max(200),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  categoryId: z.coerce.number().int().positive().optional(),
});

export type TxState = { error?: string; ok?: boolean } | undefined;

export async function addTransaction(
  _prev: TxState,
  formData: FormData,
): Promise<TxState> {
  const { householdId, userId } = await requireSession();

  const parsed = txSchema.safeParse({
    type: formData.get("type"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db.insert(transactions).values({
    householdId,
    createdBy: userId,
    type: parsed.data.type,
    description: parsed.data.description,
    amount: parsed.data.amount.toFixed(2),
    date: parsed.data.date,
    categoryId: parsed.data.categoryId ?? null,
  });

  revalidatePath("/");
  revalidatePath("/graficos");
  return { ok: true };
}

export async function updateTransaction(
  _prev: TxState,
  formData: FormData,
): Promise<TxState> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Lançamento inválido" };

  const parsed = txSchema.safeParse({
    type: formData.get("type"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db
    .update(transactions)
    .set({
      type: parsed.data.type,
      description: parsed.data.description,
      amount: parsed.data.amount.toFixed(2),
      date: parsed.data.date,
      categoryId: parsed.data.categoryId ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(transactions.id, id), eq(transactions.householdId, householdId)),
    );

  revalidatePath("/");
  revalidatePath("/graficos");
  return { ok: true };
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  if (!id) return;

  await db
    .delete(transactions)
    .where(
      and(eq(transactions.id, id), eq(transactions.householdId, householdId)),
    );

  revalidatePath("/");
  revalidatePath("/graficos");
}

/** Copia todos os lançamentos do mês anterior para o mês informado. */
export async function copyPreviousMonth(formData: FormData): Promise<void> {
  const { householdId, userId } = await requireSession();
  const targetMonth = String(formData.get("month"));
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) return;

  const sourceMonth = prevMonthKey(targetMonth);
  const { start, end } = monthRange(sourceMonth);

  const source = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.householdId, householdId),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    );

  if (source.length === 0) {
    revalidatePath("/");
    return;
  }

  const targetBase = parseMonthKey(targetMonth);
  const daysInTarget = getDaysInMonth(targetBase);

  const copies = source.map((t) => {
    const day = Math.min(Number(t.date.slice(8, 10)), daysInTarget);
    const newDate = format(setDate(targetBase, day), "yyyy-MM-dd");
    return {
      householdId,
      createdBy: userId,
      type: t.type,
      description: t.description,
      amount: t.amount,
      date: newDate,
      categoryId: t.categoryId,
    };
  });

  await db.insert(transactions).values(copies);

  revalidatePath("/");
  revalidatePath("/graficos");
}
