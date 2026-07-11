"use client";

import { useActionState, useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { CategoryIcon, ICON_OPTIONS } from "@/components/category-icon";
import { cn } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  type CatState,
} from "@/app/(app)/actions/categories";
import type { Category } from "@/lib/schema";

const COLORS = [
  "#8b5cf6", "#7c3aed", "#a855f7", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9",
  "#3b82f6", "#64748b",
];

export function CategoryForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Category;
}) {
  const action = editing ? updateCategory : createCategory;
  const [state, formAction] = useActionState<CatState, FormData>(
    action,
    undefined,
  );
  const [type, setType] = useState<"income" | "expense">(
    editing?.type ?? "expense",
  );
  const [color, setColor] = useState(editing?.color ?? COLORS[0]);
  const [icon, setIcon] = useState(editing?.icon ?? "tag");

  // Reseta os campos ao (re)abrir — ajuste de estado durante o render.
  const openKey = `${editing?.id ?? "new"}-${open}`;
  const [lastOpenKey, setLastOpenKey] = useState(openKey);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    setType(editing?.type ?? "expense");
    setColor(editing?.color ?? COLORS[0]);
    setIcon(editing?.icon ?? "tag");
  }

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? "Editar categoria" : "Nova categoria"}
    >
      <form action={formAction} className="space-y-4">
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="color" value={color} />
        <input type="hidden" name="icon" value={icon} />

        <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-full py-2 text-sm font-semibold transition",
                type === t
                  ? t === "income"
                    ? "bg-income text-white"
                    : "bg-expense text-white"
                  : "text-muted-foreground",
              )}
            >
              {t === "income" ? "Entrada" : "Saída"}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Streaming"
            defaultValue={editing?.name ?? ""}
            required
            autoFocus
          />
        </div>

        <div>
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Cor ${c}`}
                className={cn(
                  "h-8 w-8 rounded-full transition",
                  color === c && "ring-2 ring-offset-2 ring-offset-card",
                )}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Ícone</Label>
          <div className="grid grid-cols-6 gap-2">
            {ICON_OPTIONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                aria-label={`Ícone ${name}`}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl border transition",
                  icon === name
                    ? "border-primary bg-accent text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <CategoryIcon name={name} className="h-5 w-5" />
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
          {editing ? "Salvar" : "Criar categoria"}
        </SubmitButton>
      </form>
    </Sheet>
  );
}
