"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { VehicleSheet } from "@/components/vehicles/new-vehicle-form";
import { deleteVehicle } from "@/app/(app)/actions/vehicles";
import type { Vehicle } from "@/lib/schema";

/**
 * Editar/excluir o veículo. Fica atrás de um "⋯" porque o slot de ação do
 * cabeçalho já é do "+" (novo item), e são ações raras perto dessa.
 */
export function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    const fd = new FormData();
    fd.set("id", String(vehicle.id));
    await deleteVehicle(fd);
    router.push("/veiculos");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMenu(true)}
        aria-label="Ações do veículo"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition active:scale-95"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      <Sheet open={menu} onClose={() => setMenu(false)} title={vehicle.name}>
        <div className="divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-card">
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              setEditing(true);
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-primary">
              <Pencil className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[16px] font-semibold">
              Editar veículo
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              setConfirming(true);
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-expense-soft"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-expense-soft text-expense">
              <Trash2 className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[16px] font-semibold text-expense">
              Excluir veículo
            </span>
          </button>
        </div>
      </Sheet>

      <VehicleSheet
        open={editing}
        onClose={() => setEditing(false)}
        editing={vehicle}
      />

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={remove}
        tone="danger"
        icon={<Trash2 className="h-6 w-6 text-expense" />}
        title="Excluir veículo?"
        description={`${vehicle.name}, seus itens de manutenção e todo o histórico de quilometragem serão removidos. Não dá para desfazer.`}
        confirmLabel="Excluir"
      />
    </>
  );
}
