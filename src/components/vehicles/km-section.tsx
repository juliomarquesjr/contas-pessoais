"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { formatDateBR } from "@/lib/dates";
import { KmSheet } from "@/components/vehicles/km-sheet";
import type { MaintenanceItem, Vehicle } from "@/lib/schema";

/**
 * Hero de quilometragem + FAB "Atualizar KM", com **um** sheet para os dois.
 *
 * Antes cada gatilho trazia o seu próprio KmSheet, o que colocava dois
 * teclados e dois dialogs no DOM ao mesmo tempo — desperdício, e leitores de
 * tela viam tudo em duplicidade. O estado mora aqui e o sheet é único.
 *
 * O FAB é `fixed`, então renderizar daqui não muda onde ele aparece.
 */
export function KmSection({
  vehicle,
  currentKm,
  lastDate,
  kmPerDay,
  items,
}: {
  vehicle: Vehicle;
  currentKm: number | null;
  lastDate: string | null;
  kmPerDay: number;
  items: MaintenanceItem[];
}) {
  const [open, setOpen] = useState(false);
  const kmPerMonth = Math.round(kmPerDay * 30);

  return (
    <>
      <div className="animate-fade-up relative overflow-hidden rounded-[22px] bg-linear-to-br from-primary to-primary-strong p-4.5 text-primary-foreground shadow-[0_20px_40px_-22px_color-mix(in_srgb,var(--primary)_85%,transparent)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-[170px] w-[170px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_68%)]"
        />
        <p className="relative text-[12.5px] font-medium opacity-75">
          Quilometragem atual
        </p>
        <p className="snum relative mt-0.5 flex items-baseline gap-1.5 text-[40px] leading-[0.95]">
          {currentKm === null ? "—" : currentKm.toLocaleString("pt-BR")}
          <span className="text-[16px] font-semibold opacity-70">km</span>
        </p>

        <div className="relative mt-4 flex items-center gap-3">
          <p className="min-w-0 flex-1 text-[12.5px] opacity-75">
            {lastDate ? (
              <>
                Última leitura {formatDateBR(lastDate)}
                {kmPerMonth > 0 &&
                  ` · +${kmPerMonth.toLocaleString("pt-BR")} km/mês`}
              </>
            ) : (
              "Registre a primeira leitura"
            )}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-[13.5px] font-semibold backdrop-blur transition active:scale-95"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* FAB estendido: leva rótulo porque é a ação que o app pede sempre. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-25 right-5 z-30 flex h-14 items-center gap-2 rounded-2xl bg-linear-to-br from-primary to-primary-strong px-5 text-[15px] font-semibold text-primary-foreground shadow-[0_16px_32px_-12px_color-mix(in_srgb,var(--primary)_85%,transparent)] transition active:scale-95"
      >
        <Gauge className="h-5 w-5" />
        Atualizar KM
      </button>

      <KmSheet
        open={open}
        onClose={() => setOpen(false)}
        vehicle={vehicle}
        currentKm={currentKm}
        lastDate={lastDate}
        items={items}
      />
    </>
  );
}
