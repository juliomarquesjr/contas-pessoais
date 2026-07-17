"use client";

import { useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { CategoryIcon } from "@/components/category-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
import {
  saveMaintenanceItem,
  deleteMaintenanceItem,
} from "@/app/(app)/actions/vehicles";
import { cn } from "@/lib/utils";
import type { MaintenanceItem } from "@/lib/schema";

const ICONS = ["wrench", "droplet", "hammer", "fuel", "car", "plug", "activity"];

/** Sugestões comuns — evita digitar do zero o que todo carro tem. */
const PRESETS = [
  { name: "Troca de óleo", intervalKm: 10000, intervalMonths: 12, icon: "droplet" },
  { name: "Filtro de ar", intervalKm: 20000, intervalMonths: 0, icon: "wrench" },
  { name: "Alinhamento e balanceamento", intervalKm: 0, intervalMonths: 6, icon: "hammer" },
  { name: "Pastilhas de freio", intervalKm: 30000, intervalMonths: 0, icon: "activity" },
  { name: "Revisão", intervalKm: 10000, intervalMonths: 12, icon: "wrench" },
];

export function NewItemButton({
  vehicleId,
  currentKm,
}: {
  vehicleId: number;
  currentKm: number | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Adicionar item de manutenção"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-strong text-primary-foreground transition active:scale-95"
      >
        <Plus className="h-5 w-5" />
      </button>
      <MaintenanceItemSheet
        open={open}
        onClose={() => setOpen(false)}
        vehicleId={vehicleId}
        currentKm={currentKm}
      />
    </>
  );
}

export function MaintenanceItemSheet({
  open,
  onClose,
  vehicleId,
  currentKm,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  vehicleId: number;
  currentKm: number | null;
  editing?: MaintenanceItem;
}) {
  const router = useRouter();
  /* Cada linha da lista monta o seu sheet, então há vários deste form no DOM
     ao mesmo tempo — id fixo daria elementos duplicados e quebraria o
     htmlFor do label. useId dá um por instância. */
  const nameId = useId();
  const [state, formAction] = useActionState(saveMaintenanceItem, undefined);
  const [icon, setIcon] = useState(editing?.icon ?? "wrench");
  const [name, setName] = useState(editing?.name ?? "");
  const [km, setKm] = useState(String(editing?.intervalKm ?? ""));
  const [months, setMonths] = useState(String(editing?.intervalMonths ?? ""));
  const [confirming, setConfirming] = useState(false);

  useCloseOnSuccess(state, onClose);

  function applyPreset(p: (typeof PRESETS)[number]) {
    setName(p.name);
    setKm(p.intervalKm ? String(p.intervalKm) : "");
    setMonths(p.intervalMonths ? String(p.intervalMonths) : "");
    setIcon(p.icon);
  }

  async function remove() {
    if (!editing) return;
    const fd = new FormData();
    fd.set("id", String(editing.id));
    await deleteMaintenanceItem(fd);
    onClose();
    router.refresh();
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={editing ? "Editar item" : "Novo item"}
      >
        <form action={formAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input type="hidden" name="icon" value={icon} />

          {!editing && (
            <div>
              <Label>Sugestões</Label>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="shrink-0 rounded-full border border-border bg-muted px-3 py-1.5 text-[12.5px] font-semibold text-muted-foreground transition active:scale-95"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor={nameId}>Nome</Label>
            <Input
              id={nameId}
              name="name"
              placeholder="Ex: Troca de óleo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Intervalo</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  name="intervalKm"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="10000"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="pr-10 font-mono tnum"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-faint">
                  km
                </span>
              </div>
              <div className="relative">
                <Input
                  name="intervalMonths"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="12"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="pr-16 font-mono tnum"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-faint">
                  meses
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Preencha um dos dois ou os dois — com os dois, vence o que vier
              primeiro.
            </p>
          </div>

          <div>
            <Label>Última vez que foi feito</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  name="lastDoneKm"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={currentKm ? String(currentKm) : "km"}
                  defaultValue={editing?.lastDoneKm ?? ""}
                  className="pr-10 font-mono tnum"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-faint">
                  km
                </span>
              </div>
              <Input
                name="lastDoneDate"
                type="date"
                defaultValue={
                  editing?.lastDoneDate ?? format(new Date(), "yyyy-MM-dd")
                }
                className="font-mono tnum"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              É a partir daqui que o próximo vencimento é contado.
            </p>
          </div>

          <div>
            <Label>Ícone</Label>
            <div className="flex gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  aria-label={ic}
                  aria-pressed={icon === ic}
                  className={cn(
                    "flex h-11 flex-1 items-center justify-center rounded-xl border transition active:scale-95",
                    icon === ic
                      ? "border-primary/40 bg-accent text-primary"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  <CategoryIcon name={ic} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
              {state.error}
            </p>
          )}

          <SubmitButton className="w-full" size="lg">
            {editing ? "Salvar" : "Adicionar item"}
          </SubmitButton>

          {editing && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-border py-3 text-[13.5px] font-semibold text-expense transition hover:bg-expense-soft"
            >
              <Trash2 className="h-4 w-4" />
              Excluir item
            </button>
          )}
        </form>
      </Sheet>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={remove}
        tone="danger"
        icon={<Trash2 className="h-6 w-6 text-expense" />}
        title="Excluir item?"
        description={`${editing?.name} deixa de ser controlado. O histórico de leituras do veículo não muda.`}
        confirmLabel="Excluir"
      />
    </>
  );
}
