"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ChevronRight, Check, Lock } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { NavIcon } from "@/components/nav-icon";
import {
  CHOOSABLE,
  MAX_CHOICES,
  itemByKey,
  parseDockChoices,
  serializeDockChoices,
  type NavKey,
} from "@/lib/dock";
import { updateDock } from "@/app/(app)/actions/profile";
import { cn } from "@/lib/utils";

export function DockRow({ dock }: { dock: string | null }) {
  const [open, setOpen] = useState(false);
  const choices = parseDockChoices(dock);
  const summary = choices
    .map((k) => itemByKey(k)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-primary">
          <LayoutGrid className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold">Barra de navegação</p>
          <p className="mt-px truncate text-[12.5px] text-muted-foreground">
            {summary || "Padrão"}
          </p>
        </div>
        <ChevronRight className="h-4.5 w-4.5 shrink-0 text-faint" />
      </button>

      <DockSheet open={open} onClose={() => setOpen(false)} dock={dock} />
    </>
  );
}

function DockSheet({
  open,
  onClose,
  dock,
}: {
  open: boolean;
  onClose: () => void;
  dock: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [choices, setChoices] = useState<NavKey[]>(() => parseDockChoices(dock));

  /* O cálculo fica fora do updater: função de setState precisa ser pura, e
     o React chama a dela duas vezes em dev — persistir lá dentro gravava
     duas vezes e embaralhava a ordem das escritas. */
  function toggle(key: NavKey) {
    const next = choices.includes(key)
      ? choices.filter((k) => k !== key)
      : choices.length >= MAX_CHOICES
        ? choices // cheio: precisa tirar um antes
        : [...choices, key];

    if (next === choices) return;

    setChoices(next);
    const fd = new FormData();
    fd.set("dockItems", serializeDockChoices(next));
    startTransition(async () => {
      await updateDock(fd);
      router.refresh();
    });
  }

  const full = choices.length >= MAX_CHOICES;

  return (
    <Sheet open={open} onClose={onClose} title="Barra de navegação">
      <div className="mb-4 flex items-center gap-3 rounded-[14px] border border-border bg-muted px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
          <NavIcon name="home" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">Início</p>
          <p className="text-[12px] text-muted-foreground">
            Sempre na barra — é onde fica a gaveta com tudo.
          </p>
        </div>
        <Lock className="h-4 w-4 shrink-0 text-faint" />
      </div>

      <p className="mb-2 text-[11.5px] font-bold uppercase tracking-widest text-muted-foreground">
        Escolha até {MAX_CHOICES} ({choices.length}/{MAX_CHOICES})
      </p>

      <div className="space-y-2">
        {CHOOSABLE.map((it) => {
          const on = choices.includes(it.key);
          const blocked = !on && full;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => toggle(it.key)}
              disabled={blocked}
              aria-pressed={on}
              className={cn(
                "flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition active:scale-[0.99]",
                on
                  ? "border-primary/40 bg-accent"
                  : "border-border bg-card",
                blocked && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]",
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-faint",
                )}
              >
                <NavIcon name={it.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">
                  {it.label}
                </span>
                <span className="block truncate text-[12px] text-muted-foreground">
                  {it.description}
                </span>
              </span>
              {on && <Check className="h-4.5 w-4.5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {full
          ? "A barra está cheia. Tire um item para colocar outro."
          : "O que ficar de fora continua na gaveta do Início."}
      </p>
    </Sheet>
  );
}
