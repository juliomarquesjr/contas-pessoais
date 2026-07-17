/**
 * Itens de navegação do app e a dock personalizável.
 *
 * A dock cabe 5 itens em 390px (o sexto encosta nas bordas), mas o app tem
 * mais funcionalidades que isso — então cada membro escolhe quais aparecem.
 * A gaveta do Início lista todas, sempre.
 *
 * "Início" é fixo: a gaveta vive nele. Se desse para tirá-lo da dock, quem
 * tirasse perderia o caminho para tudo que não estivesse lá.
 */

export type NavKey =
  | "inicio"
  | "mes"
  | "graficos"
  | "compras"
  | "veiculos"
  | "ajustes";

export type NavItem = {
  key: NavKey;
  href: string;
  label: string;
  /** Texto da gaveta. */
  description: string;
  /** Nome do ícone em components/nav-icon.tsx */
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    key: "inicio",
    href: "/",
    label: "Início",
    description: "O resumo da casa no mês",
    icon: "home",
  },
  {
    key: "mes",
    href: "/mes",
    label: "Mês",
    description: "Entradas e saídas, mês a mês",
    icon: "calendar",
  },
  {
    key: "graficos",
    href: "/graficos",
    label: "Gráficos",
    description: "Para onde o dinheiro está indo",
    icon: "chart",
  },
  {
    key: "compras",
    href: "/compras",
    label: "Compras",
    description: "Listas por mercado",
    icon: "cart",
  },
  {
    key: "veiculos",
    href: "/veiculos",
    label: "Veículos",
    description: "Manutenção por km e tempo",
    icon: "car",
  },
  {
    key: "ajustes",
    href: "/ajustes",
    label: "Ajustes",
    description: "Conta, casa e preferências",
    icon: "settings",
  },
];

/** Sempre na dock, sempre primeiro. */
export const PINNED: NavKey = "inicio";

/** Quantos itens o usuário escolhe, além do Início. */
export const MAX_CHOICES = 4;

/** Escolháveis (todos menos o fixo). */
export const CHOOSABLE = NAV_ITEMS.filter((i) => i.key !== PINNED);

const DEFAULT_CHOICES: NavKey[] = ["mes", "graficos", "compras", "ajustes"];

export function itemByKey(key: NavKey): NavItem | undefined {
  return NAV_ITEMS.find((i) => i.key === key);
}

/** Lê a preferência (CSV) e devolve as escolhas válidas, sem o fixo. */
export function parseDockChoices(raw: string | null | undefined): NavKey[] {
  if (!raw) return DEFAULT_CHOICES;
  const keys = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is NavKey =>
      CHOOSABLE.some((i) => i.key === s),
    );
  const unique = [...new Set(keys)].slice(0, MAX_CHOICES);
  return unique.length ? unique : DEFAULT_CHOICES;
}

/** A dock final: o fixo na frente, depois as escolhas. */
export function dockItems(raw: string | null | undefined): NavItem[] {
  const keys: NavKey[] = [PINNED, ...parseDockChoices(raw)];
  return keys.map((k) => itemByKey(k)!).filter(Boolean);
}

export function serializeDockChoices(keys: NavKey[]): string {
  return [...new Set(keys)].slice(0, MAX_CHOICES).join(",");
}
