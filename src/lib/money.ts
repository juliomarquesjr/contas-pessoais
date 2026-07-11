const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um número ou string numérica como R$ 1.234,56 */
export function formatBRL(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return brl.format(Number.isFinite(n) ? n : 0);
}

/** Soma uma lista de strings numéricas (amount vem como string do Postgres) */
export function sumAmounts(values: (string | number | null | undefined)[]): number {
  return values.reduce<number>((acc, v) => acc + (v ? Number(v) : 0), 0);
}
