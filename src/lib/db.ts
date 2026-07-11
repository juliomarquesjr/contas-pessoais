import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida. Configure o .env.local");
  }
  return drizzle(neon(connectionString), { schema });
}

type DB = ReturnType<typeof createDb>;

// Conexão preguiçosa: só é criada no primeiro uso (em runtime), nunca no import.
// Assim o build (que importa este módulo sem a env var) não quebra.
let cached: DB | undefined;

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    if (!cached) cached = createDb();
    return Reflect.get(cached, prop, receiver);
  },
});
