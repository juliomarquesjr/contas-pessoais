"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, MonitorSmartphone, Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ACCENTS, DEFAULT_ACCENT } from "@/lib/accents";
import { updateAppearance } from "@/app/(app)/actions/profile";

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
  const [accent, setAccent] = useState(accentColor ?? DEFAULT_ACCENT);
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
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
            Tema
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {THEMES.map((t) => {
              const active = themeSel === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => pickTheme(t.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-[14px] border-2 py-3.5 text-xs font-semibold transition active:scale-95",
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
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
            Cor de acento
          </p>
          {/* Os 4 primeiros são os do handoff; os demais vieram da paleta
              anterior e seguem selecionáveis para não quebrar quem já os usa. */}
          <div className="grid grid-cols-5 gap-2.5">
            {ACCENTS.map((c) => {
              const active = accent.toLowerCase() === c.value.toLowerCase();
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => pickAccent(c.value)}
                  aria-label={c.label}
                  aria-pressed={active}
                  title={c.label}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-[13px] transition active:scale-95",
                    active && "ring-2 ring-foreground/30 ring-offset-2 ring-offset-card",
                  )}
                  style={{ backgroundColor: c.value }}
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
