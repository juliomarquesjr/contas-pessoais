"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { NavIcon } from "@/components/nav-icon";
import { NAV_ITEMS, dockItems } from "@/lib/dock";

/**
 * Gaveta do Início: lista tudo que o app faz.
 *
 * A dock só cabe 5 itens e é personalizável, então ela nunca é o índice
 * completo — a gaveta é. Recurso novo aparece aqui sem depender de a pessoa
 * ter escolhido colocá-lo na dock.
 */
export function AppsDrawer({ dock }: { dock?: string | null }) {
  const [open, setOpen] = useState(false);
  const inDock = new Set(dockItems(dock).map((i) => i.key));
  const items = NAV_ITEMS.filter((i) => i.key !== "inicio");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir funcionalidades"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition active:scale-95"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Tudo do app">
        <div className="divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-card">
          {items.map((it) => (
            <Link
              key={it.key}
              href={it.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-primary">
                <NavIcon name={it.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-semibold">
                    {it.label}
                  </span>
                  {inDock.has(it.key) && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-faint">
                      na barra
                    </span>
                  )}
                </span>
                <span className="mt-px block truncate text-[12.5px] text-muted-foreground">
                  {it.description}
                </span>
              </span>
              <ChevronRight className="h-4.5 w-4.5 shrink-0 text-faint" />
            </Link>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Escolha quais aparecem na barra em Ajustes › Barra de navegação.
        </p>
      </Sheet>
    </>
  );
}
