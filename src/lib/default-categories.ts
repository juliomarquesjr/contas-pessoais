export type DefaultCategory = {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Entradas
  { name: "Salário", type: "income", color: "#22c55e", icon: "wallet" },
  { name: "Extra", type: "income", color: "#14b8a6", icon: "plus" },
  { name: "Investimentos", type: "income", color: "#0ea5e9", icon: "trending-up" },
  // Saídas
  { name: "Moradia", type: "expense", color: "#8b5cf6", icon: "home" },
  { name: "Mercado", type: "expense", color: "#f97316", icon: "shopping-cart" },
  { name: "Transporte", type: "expense", color: "#3b82f6", icon: "car" },
  { name: "Saúde", type: "expense", color: "#ef4444", icon: "heart" },
  { name: "Lazer", type: "expense", color: "#ec4899", icon: "smile" },
  { name: "Educação", type: "expense", color: "#a855f7", icon: "book" },
  { name: "Contas", type: "expense", color: "#eab308", icon: "file-text" },
  { name: "Outros", type: "expense", color: "#64748b", icon: "tag" },
];
