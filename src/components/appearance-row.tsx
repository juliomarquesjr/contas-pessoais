"use client";

import { useState } from "react";
import { Palette, ChevronRight } from "lucide-react";
import { AppearanceEditor } from "@/components/appearance-editor";

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
  const accent = accentColor ?? "#7c3aed";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
          <Palette className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Aparência</p>
          <p className="truncate text-xs text-muted-foreground">
            Tema e cor de destaque
          </p>
        </div>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {THEME_LABEL[theme ?? "system"]}
          </span>
          <span
            className="h-5 w-5 rounded-full border-2 border-card shadow"
            style={{ backgroundColor: accent }}
          />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
