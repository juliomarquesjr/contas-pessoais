"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { requireSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1, "Informe um nome").max(80),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().min(1).max(40),
});

export type CatState = { error?: string; ok?: boolean } | undefined;

export async function createCategory(
  _prev: CatState,
  formData: FormData,
): Promise<CatState> {
  const { householdId } = await requireSession();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  await db.insert(categories).values({ householdId, ...parsed.data });
  revalidatePath("/ajustes");
  revalidatePath("/ajustes/categorias");
  revalidatePath("/");
  revalidatePath("/mes");
  return { ok: true };
}

export async function updateCategory(
  _prev: CatState,
  formData: FormData,
): Promise<CatState> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Categoria inválida" };
  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    color: formData.get("color"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  await db
    .update(categories)
    .set(parsed.data)
    .where(
      and(eq(categories.id, id), eq(categories.householdId, householdId)),
    );
  revalidatePath("/ajustes");
  revalidatePath("/ajustes/categorias");
  revalidatePath("/");
  revalidatePath("/mes");
  return { ok: true };
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const { householdId } = await requireSession();
  const id = Number(formData.get("id"));
  if (!id) return;
  await db
    .delete(categories)
    .where(
      and(eq(categories.id, id), eq(categories.householdId, householdId)),
    );
  revalidatePath("/ajustes");
  revalidatePath("/ajustes/categorias");
  revalidatePath("/");
  revalidatePath("/mes");
}
