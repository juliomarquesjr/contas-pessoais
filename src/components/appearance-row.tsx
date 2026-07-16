"use client";

import { useState } from "react";
import { Palette, ChevronRight } from "lucide-react";
import { AppearanceEditor } from "@/components/appearance-editor";
import { ACCENTS, DEFAULT_ACCENT } from "@/lib/accents";

const THEME_LABEL: Record<string, string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};

export function AppearanceRow({
  accentColor,
  theme,
}: {
  accentColor: string | null;
  theme: string | null;
}) {
  const [open, setOpen] = useState(false);
  const accent = accentColor ?? DEFAULT_ACCENT;
  // "Claro · Violeta" — o handoff mostra o nome do acento, não só o disco.
  const accentLabel = ACCENTS.find(
    (a) => a.value.toLowerCase() === accent.toLowerCase(),
  )?.label;
  const summary = [THEME_LABEL[theme ?? "system"], accentLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-primary">
          <Palette className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">Aparência</p>
          <p className="mt-px truncate text-[12.5px] text-muted-foreground">
            Tema e cor de acento
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-[12.5px] text-muted-foreground">{summary}</span>
          <span
            className="h-4 w-4 rounded-full border-2 border-card shadow"
            style={{ backgroundColor: accent }}
          />
          <ChevronRight className="h-4.5 w-4.5 text-faint" />
        </span>
      </button>

      <AppearanceEditor
        open={open}
        onClose={() => setOpen(false)}
        accentColor={accentColor}
        theme={theme}
      />
    </>
  );
}
