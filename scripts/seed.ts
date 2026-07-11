import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { households, users, categories } from "../src/lib/schema";
import { DEFAULT_CATEGORIES } from "../src/lib/default-categories";

const SEED_USERS = [
  { name: "Julio", email: "julio@casa.com", password: "mudar123" },
  { name: "Parceiro(a)", email: "parceiro@casa.com", password: "mudar123" },
];

async function main() {
  console.log("→ Seed iniciando...");

  // Household
  let household = (
    await db.select().from(households).where(eq(households.name, "Nossa Casa")).limit(1)
  )[0];

  if (!household) {
    household = (
      await db.insert(households).values({ name: "Nossa Casa" }).returning()
    )[0];
    console.log(`✓ Household criada: ${household.name} (id ${household.id})`);
  } else {
    console.log(`• Household já existe (id ${household.id})`);
  }

  // Usuários
  for (const u of SEED_USERS) {
    const exists = (
      await db.select().from(users).where(eq(users.email, u.email)).limit(1)
    )[0];
    if (exists) {
      console.log(`• Usuário já existe: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db.insert(users).values({
      householdId: household.id,
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash,
    });
    console.log(`✓ Usuário criado: ${u.email} (senha: ${u.password})`);
  }

  // Categorias padrão
  const existingCats = await db
    .select()
    .from(categories)
    .where(eq(categories.householdId, household.id));

  if (existingCats.length === 0) {
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((c) => ({
        householdId: household.id,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        isDefault: true,
      })),
    );
    console.log(`✓ ${DEFAULT_CATEGORIES.length} categorias padrão criadas`);
  } else {
    console.log(`• Categorias já existem (${existingCats.length})`);
  }

  console.log("→ Seed concluído.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
  });
