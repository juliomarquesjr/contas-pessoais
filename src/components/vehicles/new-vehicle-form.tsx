"use client";

import { useActionState, useId, useState } from "react";
import { Plus, Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { CategoryIcon } from "@/components/category-icon";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
import { saveVehicle } from "@/app/(app)/actions/vehicles";
import { REMINDER_OPTIONS, DEFAULT_REMINDER_DAYS } from "@/lib/maintenance";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/schema";

const COLORS = [
  "#6d4bd8", "#2563eb", "#0e8f7e", "#159a5f",
  "#c98a12", "#e0730f", "#d23b53", "#7a3e8e",
];

const ICONS = ["car", "truck", "motorcycle", "bike", "bus"];

export function NewVehicleButton({
  variant = "icon",
  editing,
}: {
  variant?: "icon" | "dashed";
  editing?: Vehicle;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Adicionar veículo"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-strong text-primary-foreground transition active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[15px] border border-dashed border-border-strong py-4 text-[15px] font-semibold text-primary transition active:scale-[0.99]"
        >
          <Plus className="h-4.5 w-4.5" />
          {editing ? "Editar veículo" : "Adicionar veículo"}
        </button>
      )}

      <VehicleSheet
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </>
  );
}

export function VehicleSheet({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Vehicle;
}) {
  /* A tela de Veículos monta dois destes (o "+" e o botão tracejado), então
     id fixo daria elementos duplicados no DOM. */
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;
  const [state, formAction] = useActionState(saveVehicle, undefined);
  const [color, setColor] = useState(editing?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(editing?.icon ?? "car");
  const [reminder, setReminder] = useState(editing?.reminderDays ?? DEFAULT_REMINDER_DAYS);

  useCloseOnSuccess(state, onClose);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? "Editar veículo" : "Novo veículo"}
    >
      <form action={formAction} className="space-y-4">
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <input type="hidden" name="color" value={color} />
        <input type="hidden" name="icon" value={icon} />
        <input type="hidden" name="reminderDays" value={reminder} />

        <div>
          <Label htmlFor={fid("name")}>Nome</Label>
          <Input
            id={fid("name")}
            name="name"
            placeholder="Ex: Fiat Argo"
            defaultValue={editing?.name ?? ""}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={fid("plate")}>Placa</Label>
            <Input
              id={fid("plate")}
              name="plate"
              placeholder="ABC-1D23"
              defaultValue={editing?.plate ?? ""}
              className="font-mono uppercase tnum"
            />
          </div>
          <div>
            <Label htmlFor={fid("year")}>Ano</Label>
            <Input
              id={fid("year")}
              name="year"
              type="number"
              inputMode="numeric"
              placeholder="2021"
              defaultValue={editing?.year ?? ""}
              className="font-mono tnum"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={fid("fuel")}>Combustível</Label>
            <Input
              id={fid("fuel")}
              name="fuel"
              placeholder="Flex"
              defaultValue={editing?.fuel ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={fid("engine")}>Motor</Label>
            <Input
              id={fid("engine")}
              name="engine"
              placeholder="1.0"
              defaultValue={editing?.engine ?? ""}
            />
          </div>
        </div>

        <div>
          <Label>Ícone e cor</Label>
          <div className="mb-2.5 flex gap-2">
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
          <div className="grid grid-cols-8 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                aria-pressed={color === c}
                className="flex h-9 items-center justify-center rounded-[10px] transition active:scale-95"
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Pedir a quilometragem</Label>
          {/* 3 colunas: com 5 opções, 5 colunas espremem "2 meses" a 390px. */}
          <div className="grid grid-cols-3 gap-2">
            {REMINDER_OPTIONS.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setReminder(r.days)}
                aria-pressed={reminder === r.days}
                className={cn(
                  "rounded-[11px] border py-2.5 text-[13px] font-semibold transition active:scale-95",
                  reminder === r.days
                    ? "border-primary/40 bg-accent text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {r.label}
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
          {editing ? "Salvar" : "Adicionar veículo"}
        </SubmitButton>
      </form>
    </Sheet>
  );
}
