"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { users, households, categories } from "@/lib/schema";
import { signIn } from "@/auth";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

export type AuthState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export async function authenticate(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email ou senha incorretos." };
    }
    throw error; // redirects sobem como erro e devem ser repropagados
  }
  return undefined;
}

const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    householdName: z.string().optional(),
    inviteEmail: z.string().optional(),
  });

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    householdName: formData.get("householdName"),
    inviteEmail: formData.get("inviteEmail"),
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

  // Se o email de convite pertence a alguém, entra na mesma casa.
  let householdId: number | undefined;
  const invite = parsed.data.inviteEmail?.trim().toLowerCase();
  if (invite) {
    const inviter = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.email, invite))
      .limit(1);
    if (inviter.length === 0) {
      return { error: "Não encontramos ninguém com o email de convite." };
    }
    householdId = inviter[0].householdId;
  }

  if (!householdId) {
    const created = await db
      .insert(households)
      .values({ name: parsed.data.householdName?.trim() || "Nossa Casa" })
      .returning({ id: households.id });
    householdId = created[0].id;
    // Categorias padrão só para uma casa nova
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((c) => ({
        householdId: householdId!,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        isDefault: true,
      })),
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.insert(users).values({
    householdId,
    name: parsed.data.name.trim(),
    email,
    passwordHash,
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas o login falhou. Tente entrar." };
    }
    throw error;
  }
  return undefined;
}
