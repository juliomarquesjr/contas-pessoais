"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, MonitorSmartphone, Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { updateAppearance } from "@/app/(app)/actions/profile";

const ACCENTS = [
  "#7c3aed", "#6d28d9", "#4f46e5", "#2563eb", "#0ea5e9",
  "#0d9488", "#16a34a", "#ca8a04", "#ea580c", "#dc2626",
  "#e11d48", "#db2777",
];

const THEMES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: MonitorSmartphone },
] as const;

export function AppearanceEditor({
  open,
  onClose,
  accentColor,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  accentColor: string | null;
  theme: string | null;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [, startTransition] = useTransition();
  const [accent, setAccent] = useState(accentColor ?? "#7c3aed");
  const [themeSel, setThemeSel] = useState(theme ?? "system");

  function persist(next: { accentColor?: string; theme?: string }) {
    const fd = new FormData();
    if (next.accentColor) fd.set("accentColor", next.accentColor);
    if (next.theme) fd.set("theme", next.theme);
    startTransition(async () => {
      await updateAppearance(fd);
      router.refresh();
    });
  }

  function pickAccent(c: string) {
    setAccent(c);
    persist({ accentColor: c });
  }

  function pickTheme(t: string) {
    setThemeSel(t);
    setTheme(t); // aplica na hora no dispositivo
    persist({ theme: t });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Aparência">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">Tema</p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const active = themeSel === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => pickTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-medium transition",
                    active
                      ? "border-primary bg-accent text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Cor de destaque</p>
          <div className="grid grid-cols-6 gap-3">
            {ACCENTS.map((c) => {
              const active = accent.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickAccent(c)}
                  aria-label={`Cor ${c}`}
                  className="flex h-11 items-center justify-center rounded-2xl transition active:scale-95"
                  style={{ backgroundColor: c }}
                >
                  {active && <Check className="h-5 w-5 text-white" />}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            A cor personaliza os destaques do app para o seu perfil.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
