"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { requireSession } from "@/lib/session";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/mes");
  revalidatePath("/ajustes");
}

/** Confirma que o alvo pertence à mesma casa (para ações entre membros). */
async function assertSameHousehold(householdId: number, targetId: number) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, targetId), eq(users.householdId, householdId)))
    .limit(1);
  return rows.length > 0;
}

const profileSchema = z.object({
  name: z.string().min(2, "Informe seu nome").max(120),
  phone: z.string().max(40).optional(),
  avatarUrl: z.string().max(700000).optional(), // data URL comprimida
});

/** Edita os PRÓPRIOS dados pessoais (nome, telefone, foto). Só o dono. */
export async function updateMyProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { userId } = await requireSession();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone?.trim() || null,
      avatarUrl: parsed.data.avatarUrl ?? null,
    })
    .where(eq(users.id, userId));

  revalidateAll();
  return { ok: true };
}

const appearanceSchema = z.object({
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});

/** Salva a aparência (cor de destaque e tema) do próprio membro. */
export async function updateAppearance(formData: FormData): Promise<void> {
  const { userId } = await requireSession();
  const parsed = appearanceSchema.safeParse({
    accentColor: formData.get("accentColor") || undefined,
    theme: formData.get("theme") || undefined,
  });
  if (!parsed.success) return;

  const patch: { accentColor?: string; theme?: string } = {};
  if (parsed.data.accentColor) patch.accentColor = parsed.data.accentColor;
  if (parsed.data.theme) patch.theme = parsed.data.theme;
  if (Object.keys(patch).length === 0) return;

  await db.update(users).set(patch).where(eq(users.id, userId));
  revalidateAll();
}

const addMemberSchema = z.object({
  name: z.string().min(2, "Informe o nome").max(120),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

/** Adiciona um novo membro à casa (qualquer membro pode). */
export async function addMember(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { householdId } = await requireSession();
  const parsed = addMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Já existe uma conta com esse email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.insert(users).values({
    householdId,
    name: parsed.data.name.trim(),
    email,
    passwordHash,
  });

  revalidateAll();
  return { ok: true };
}

const resetPwSchema = z.object({
  targetId: z.coerce.number().int().positive(),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

/** Redefine a senha de outro membro (ajuda em caso de perda de acesso). */
export async function resetMemberPassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { householdId } = await requireSession();
  const parsed = resetPwSchema.safeParse({
    targetId: formData.get("targetId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  if (!(await assertSameHousehold(householdId, parsed.data.targetId))) {
    return { error: "Membro não encontrado." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, parsed.data.targetId));

  return { ok: true };
}

const emailSchema = z.object({
  targetId: z.coerce.number().int().positive(),
  email: z.string().email("Email inválido"),
});

/** Altera o email de login de um membro (recuperação de acesso). */
export async function updateMemberEmail(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { householdId } = await requireSession();
  const parsed = emailSchema.safeParse({
    targetId: formData.get("targetId"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  if (!(await assertSameHousehold(householdId, parsed.data.targetId))) {
    return { error: "Membro não encontrado." };
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, parsed.data.targetId)))
    .limit(1);
  if (taken.length > 0) {
    return { error: "Esse email já está em uso." };
  }

  await db
    .update(users)
    .set({ email })
    .where(eq(users.id, parsed.data.targetId));

  revalidateAll();
  return { ok: true };
}
