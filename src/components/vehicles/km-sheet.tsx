"use client";

import { useActionState, useMemo, useState } from "react";
import { Delete } from "lucide-react";
import { format } from "date-fns";
import { Sheet } from "@/components/ui/sheet";
import { SubmitButton } from "@/components/submit-button";
import { CategoryIcon } from "@/components/category-icon";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
import { addReading } from "@/app/(app)/actions/vehicles";
import { formatDateBR } from "@/lib/dates";
import {
  evaluateItem,
  reminderSentence,
  STATUS_TEXT,
} from "@/lib/maintenance";
import { cn } from "@/lib/utils";
import type { MaintenanceItem, Vehicle } from "@/lib/schema";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "back"];

/**
 * "Qual a quilometragem?" — teclado próprio (o teclado do sistema atrapalha
 * num campo só de dígitos) e prévia do impacto da leitura antes de salvar.
 */
export function KmSheet({
  open,
  onClose,
  vehicle,
  currentKm,
  lastDate,
  items,
}: {
  open: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  currentKm: number | null;
  lastDate: string | null;
  items: MaintenanceItem[];
}) {
  const [state, formAction] = useActionState(addReading, undefined);
  const [digits, setDigits] = useState("");

  // Reabrir limpa o campo (ajuste durante o render, como no transaction-form).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDigits("");
  }

  useCloseOnSuccess(state, onClose);

  const km = digits ? parseInt(digits, 10) : 0;
  const diff = currentKm !== null && km > 0 ? km - currentKm : null;

  /* O aviso do handoff: recalcula os itens com a leitura sendo digitada,
     para a pessoa ver o efeito antes de salvar. */
  const impacted = useMemo(() => {
    if (!km) return [];
    const today = new Date();
    return items
      .map((item) => ({ item, state: evaluateItem(item, km, today, 0) }))
      .filter((r) => r.state.status !== "ok");
  }, [items, km]);

  function press(k: string) {
    setDigits((d) => {
      if (k === "back") return d.slice(0, -1);
      if (k === "000") return d ? (d + "000").slice(0, 7) : d;
      if (d.length >= 7) return d;
      if (!d && k === "0") return d; // sem zero à esquerda
      return d + k;
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Qual a quilometragem?">
      <form action={formAction}>
        <input type="hidden" name="vehicleId" value={vehicle.id} />
        <input type="hidden" name="km" value={km} />
        <input
          type="hidden"
          name="date"
          value={format(new Date(), "yyyy-MM-dd")}
        />

        <div className="-mt-2 mb-4 flex items-center gap-3">
          <span
            className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[13px]"
            style={{
              backgroundColor: `${vehicle.color}22`,
              color: vehicle.color,
            }}
          >
            <CategoryIcon name={vehicle.icon} className="h-5 w-5" />
          </span>
          <p className="truncate text-[13px] text-muted-foreground">
            {vehicle.name} · {reminderSentence(vehicle.reminderDays)}
          </p>
        </div>

        {/* Cifra */}
        <div className="text-center">
          <div className="snum flex items-center justify-center text-[52px] leading-none">
            <span className={cn(!digits && "text-faint")}>
              {digits ? km.toLocaleString("pt-BR") : "0"}
            </span>
            <span className="ml-0.5 inline-block h-11.5 w-0.75 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="mt-2.5 text-[13px] text-muted-foreground">
            km
            {currentKm !== null && lastDate && (
              <>
                {" · "}última leitura {currentKm.toLocaleString("pt-BR")} em{" "}
                {formatDateBR(lastDate)}
              </>
            )}
            {diff !== null && diff > 0 && (
              <span className="font-semibold text-income">
                {" "}
                (+{diff.toLocaleString("pt-BR")} km)
              </span>
            )}
          </p>
        </div>

        {/* Prévia do impacto */}
        {impacted.length > 0 && (
          <div className="mt-4 rounded-[14px] border border-pending/30 bg-pending-soft p-3.5">
            <p className="text-[13px] font-bold text-pending">
              Com essa leitura, {impacted.length}{" "}
              {impacted.length === 1
                ? "item precisa de atenção"
                : "itens precisam de atenção"}
            </p>
            <div className="mt-2 space-y-1">
              {impacted.slice(0, 4).map(({ item, state: s }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="truncate text-[13.5px] font-semibold">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[12.5px]",
                      STATUS_TEXT[s.status],
                    )}
                  >
                    {s.status === "overdue" ? "vencido" : "vence agora"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {state?.error && (
          <p className="mt-4 rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        {/* Teclado */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={
                k === "back" ? "Apagar" : k === "000" ? "Três zeros" : k
              }
              className={cn(
                "flex h-14 items-center justify-center rounded-[14px] font-display text-[22px] font-semibold transition active:scale-95",
                k === "000" || k === "back"
                  ? "bg-transparent text-faint"
                  : "bg-muted text-foreground",
              )}
            >
              {k === "back" ? (
                <Delete className="h-5 w-5" />
              ) : k === "000" ? (
                <span className="text-[15px]">.000</span>
              ) : (
                k
              )}
            </button>
          ))}
        </div>

        <SubmitButton className="mt-4 w-full" size="lg" disabled={!km}>
          Salvar leitura
        </SubmitButton>
      </form>
    </Sheet>
  );
}
