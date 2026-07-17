"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MaintenanceItemSheet } from "@/components/vehicles/maintenance-item-form";
import { markItemDone } from "@/app/(app)/actions/vehicles";
import { formatDayMonth } from "@/lib/dates";
import {
  intervalLabel,
  STATUS_LABEL,
  STATUS_TEXT,
  STATUS_BAR,
  STATUS_TINT,
  type MaintenanceState,
} from "@/lib/maintenance";
import { cn } from "@/lib/utils";
import type { MaintenanceItem } from "@/lib/schema";

/** "Faltam 320 km · previsto 12 ago" / "Vencido há 22 dias · era 23 jun" */
function footerText(state: MaintenanceState): string {
  const parts: string[] = [];

  if (state.status === "overdue") {
    if (state.daysLeft !== null && state.daysLeft < 0) {
      const d = Math.abs(state.daysLeft);
      parts.push(`Vencido há ${d} ${d === 1 ? "dia" : "dias"}`);
      if (state.dueDate) parts.push(`era ${formatDayMonth(state.dueDate)}`);
    }
    if (state.kmLeft !== null && state.kmLeft < 0) {
      parts.push(`${Math.abs(state.kmLeft).toLocaleString("pt-BR")} km além`);
    }
    return parts.join(" · ") || "Vencido";
  }

  if (state.kmLeft !== null && state.kmLeft >= 0) {
    parts.push(`Faltam ${state.kmLeft.toLocaleString("pt-BR")} km`);
    if (state.forecastDate) parts.push(`previsto ${formatDayMonth(state.forecastDate)}`);
  }
  if (state.daysLeft !== null && state.daysLeft >= 0 && state.driver === "time") {
    parts.push(`Faltam ${state.daysLeft} ${state.daysLeft === 1 ? "dia" : "dias"}`);
    if (state.dueDate) parts.push(`vence ${formatDayMonth(state.dueDate)}`);
  }
  return parts.join(" · ") || "Sem previsão";
}

export function MaintenanceRow({
  item,
  state,
  currentKm,
}: {
  item: MaintenanceItem;
  state: MaintenanceState;
  currentKm: number | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function done() {
    const fd = new FormData();
    fd.set("id", String(item.id));
    if (currentKm !== null) fd.set("km", String(currentKm));
    await markItemDone(fd);
    router.refresh();
  }

  return (
    <>
      <div className="py-3.5">
        {/* A linha inteira abre o item (editar/excluir), com chevron para
            dizer isso — antes só o texto do nome abria, e ninguém achava.
            O status fica na linha do nome; o intervalo ocupa a largura toda
            abaixo, senão "A cada 10.000 km ou 12 meses" trunca. */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Editar ${item.name}`}
          className="flex w-full items-start gap-3 text-left"
        >
          <span
            className={cn(
              "flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[13px]",
              STATUS_TINT[state.status],
            )}
          >
            <CategoryIcon name={item.icon} className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-start gap-2">
              <span className="min-w-0 flex-1 font-display text-[16px] font-semibold leading-tight tracking-[-0.02em]">
                {item.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-[13px] font-semibold",
                  STATUS_TEXT[state.status],
                )}
              >
                {STATUS_LABEL[state.status]}
              </span>
            </span>
            <span className="mt-1 block truncate text-[13px] text-muted-foreground">
              {intervalLabel(item)}
            </span>
          </span>

          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
        </button>

        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/8">
          <div
            className={cn(
              "animate-grow-x h-full rounded-full",
              STATUS_BAR[state.status],
            )}
            style={{ width: `${Math.round(state.progress * 100)}%` }}
          />
        </div>

        {/* 11.5px e botão enxuto: a 390px, "Vencido há 23 dias · era 23 jun"
            mais o botão não cabem em corpo maior. */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-mono text-[11.5px] tnum",
              state.status === "ok" ? "text-muted-foreground" : STATUS_TEXT[state.status],
            )}
          >
            {footerText(state)}
          </span>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground transition active:scale-95"
          >
            <Check className="h-3 w-3" />
            Fiz isso
          </button>
        </div>
      </div>

      <MaintenanceItemSheet
        open={editing}
        onClose={() => setEditing(false)}
        vehicleId={item.vehicleId}
        currentKm={currentKm}
        editing={item}
      />

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={done}
        tone="success"
        icon={<Check className="h-6 w-6" />}
        title="Marcar como feito?"
        description={
          <>
            {item.name} passa a contar a partir de hoje
            {currentKm !== null && (
              <> e de {currentKm.toLocaleString("pt-BR")} km</>
            )}
            .
          </>
        }
        confirmLabel="Sim, fiz"
      />
    </>
  );
}
