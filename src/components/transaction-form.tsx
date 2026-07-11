"use client";

import { useActionState, useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import {
  addTransaction,
  updateTransaction,
  type TxState,
} from "@/app/(app)/actions/transactions";
import type { Category } from "@/lib/schema";

export type EditingTransaction = {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: string;
  date: string;
  categoryId: number | null;
};

export function TransactionForm({
  open,
  onClose,
  categories,
  defaultDate,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  defaultDate: string;
  editing?: EditingTransaction;
}) {
  const action = editing ? updateTransaction : addTransaction;
  const [state, formAction] = useActionState<TxState, FormData>(
    action,
    undefined,
  );
  const [type, setType] = useState<"income" | "expense">(
    editing?.type ?? "expense",
  );

  // Reseta o tipo ao (re)abrir a sheet — ajuste de estado durante o render,
  // padrão recomendado em vez de useEffect.
  const openKey = `${editing?.id ?? "new"}-${open}`;
  const [lastOpenKey, setLastOpenKey] = useState(openKey);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    setType(editing?.type ?? "expense");
  }

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  const filtered = categories.filter((c) => c.type === type);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? "Editar lançamento" : "Novo lançamento"}
    >
      <form
        key={`${editing?.id ?? "new"}-${open}`}
        action={formAction}
        className="space-y-4"
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <input type="hidden" name="type" value={type} />

        {/* Toggle entrada/saída */}
        <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={cn(
              "rounded-full py-2.5 text-sm font-semibold transition",
              type === "expense"
                ? "bg-expense text-white shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Saída
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={cn(
              "rounded-full py-2.5 text-sm font-semibold transition",
              type === "income"
                ? "bg-income text-white shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Entrada
          </button>
        </div>

        <div>
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0,00"
            defaultValue={editing?.amount ?? ""}
            required
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            placeholder="Ex: Conta de luz"
            defaultValue={editing?.description ?? ""}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <Select
              id="categoryId"
              name="categoryId"
              defaultValue={editing?.categoryId ?? ""}
            >
              <option value="">Sem categoria</option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={editing?.date ?? defaultDate}
              required
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        <SubmitButton className="w-full" size="lg">
          {editing ? "Salvar" : "Adicionar"}
        </SubmitButton>
      </form>
    </Sheet>
  );
}
