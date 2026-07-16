/**
 * Cores de destaque do app.
 *
 * O redesign v2 pede três tokens por acento (--primary, --primary-strong,
 * --primary-ink). O banco guarda só um hex por usuário, então:
 *  - os acentos do design têm tripleta fixa (fidelidade ao handoff);
 *  - os demais derivam por color-mix, para nenhuma cor já salva quebrar.
 */

export type Accent = {
  value: string;
  label: string;
  /** Fim do gradiente / estados pressionados. */
  strong?: string;
  /** Acento legível sobre superfícies escuras. */
  ink?: string;
};

/** Os quatro do handoff, com as tripletas exatas. */
const DESIGN_ACCENTS: Accent[] = [
  { value: "#6d4bd8", label: "Violeta", strong: "#5836bf", ink: "#c3aef7" },
  { value: "#4f46e5", label: "Índigo", strong: "#3f37c9", ink: "#b9b4f7" },
  { value: "#0e8f7e", label: "Teal", strong: "#0b6e62", ink: "#6fd8c8" },
  { value: "#7a3e8e", label: "Ameixa", strong: "#5f2e70", ink: "#d9a9e8" },
];

/** Mantidos da paleta anterior — alguém pode ter qualquer um destes salvo. */
const LEGACY_ACCENTS: Accent[] = [
  { value: "#7c3aed", label: "Púrpura" },
  { value: "#6d28d9", label: "Púrpura escuro" },
  { value: "#2563eb", label: "Azul" },
  { value: "#0ea5e9", label: "Celeste" },
  { value: "#0d9488", label: "Verde-azulado" },
  { value: "#16a34a", label: "Verde" },
  { value: "#ca8a04", label: "Âmbar" },
  { value: "#ea580c", label: "Laranja" },
  { value: "#dc2626", label: "Vermelho" },
  { value: "#e11d48", label: "Rosa escuro" },
  { value: "#db2777", label: "Rosa" },
];

export const ACCENTS: Accent[] = [...DESIGN_ACCENTS, ...LEGACY_ACCENTS];

export const DEFAULT_ACCENT = DESIGN_ACCENTS[0].value;

function find(hex: string): Accent | undefined {
  const h = hex.trim().toLowerCase();
  return ACCENTS.find((a) => a.value.toLowerCase() === h);
}

/**
 * O acento vem do banco e é interpolado num bloco <style>, então precisa ser
 * um #rrggbb literal — nada mais entra.
 */
export function isValidAccent(hex: string | null | undefined): hex is string {
  return !!hex && /^#[0-9a-fA-F]{6}$/.test(hex.trim());
}

/** Luminância relativa (sRGB) — usada só para escolher texto claro ou escuro. */
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 0;
  const ch = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
}

export type AccentTokens = {
  primary: string;
  primaryStrong: string;
  primaryInk: string;
  primaryForeground: string;
};

/**
 * Resolve os tokens de um acento. Tripleta fixa quando é um acento do design,
 * derivada por color-mix caso contrário.
 *
 * `primaryForeground` sai da luminância e não do tema: um acento escuro
 * (ex.: #2563eb) precisa de texto branco mesmo no tema escuro, onde o
 * --primary-foreground padrão é tinta escura.
 */
export function accentTokens(hex: string): AccentTokens {
  const preset = find(hex);
  return {
    primary: hex,
    primaryStrong: preset?.strong ?? `color-mix(in oklab, ${hex} 82%, #000)`,
    primaryInk: preset?.ink ?? `color-mix(in oklab, ${hex} 42%, #fff)`,
    primaryForeground: luminance(hex) > 0.45 ? "#1a1233" : "#ffffff",
  };
}
