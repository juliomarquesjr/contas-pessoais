"use client";

import { useActionState, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { MoneyInput } from "@/components/money-input";
import { CategoryPicker } from "@/components/category-picker";
import { useCloseOnSuccess } from "@/lib/use-close-on-success";
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
  paid: boolean;
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
  const [paid, setPaid] = useState<boolean>(editing?.paid ?? false);
  const [categoryId, setCategoryId] = useState<number | null>(
    editing?.categoryId ?? null,
  );

  // Reseta os campos ao (re)abrir a sheet — ajuste de estado durante o render,
  // padrão recomendado em vez de useEffect.
  const openKey = `${editing?.id ?? "new"}-${open}`;
  const [lastOpenKey, setLastOpenKey] = useState(openKey);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    setType(editing?.type ?? "expense");
    setPaid(editing?.paid ?? false);
    setCategoryId(editing?.categoryId ?? null);
  }

  useCloseOnSuccess(state, onClose);

  const filtered = categories.filter((c) => c.type === type);

  function changeType(t: "income" | "expense") {
    setType(t);
    // Se a categoria escolhida não pertence ao novo tipo, limpa.
    if (categoryId && !categories.some((c) => c.id === categoryId && c.type === t)) {
      setCategoryId(null);
    }
  }

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
        <input type="hidden" name="paid" value={String(paid)} />
        <input type="hidden" name="categoryId" value={categoryId ?? ""} />

        {/* Toggle entrada/saída */}
        <div className="grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-muted p-1.25">
          <button
            type="button"
            onClick={() => changeType("expense")}
            aria-pressed={type === "expense"}
            className={cn(
              "rounded-[11px] py-2.5 text-[15px] font-semibold transition",
              type === "expense"
                ? "bg-linear-to-br from-expense to-[color-mix(in_srgb,var(--expense)_78%,#000)] text-white"
                : "text-muted-foreground",
            )}
          >
            Saída
          </button>
          <button
            type="button"
            onClick={() => changeType("income")}
            aria-pressed={type === "income"}
            className={cn(
              "rounded-[11px] py-2.5 text-[15px] font-semibold transition",
              type === "income"
                ? "bg-linear-to-br from-income to-[color-mix(in_srgb,var(--income)_75%,#000)] text-white"
                : "text-muted-foreground",
            )}
          >
            Entrada
          </button>
        </div>

        <div>
          <Label htmlFor="amount">Valor</Label>
          <MoneyInput name="amount" defaultValue={editing?.amount} tone={type} />
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

        <div>
          <Label>Categoria</Label>
          <CategoryPicker
            categories={filtered}
            value={categoryId}
            onChange={setCategoryId}
          />
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

        {/* Já foi paga / recebida? */}
        <button
          type="button"
          onClick={() => setPaid((p) => !p)}
          aria-pressed={paid}
          className="flex w-full items-center justify-between rounded-[14px] border border-border bg-muted px-4 py-3.5 text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold">
              {type === "income" ? "Já recebido?" : "Já pago?"}
            </span>
            <span
              className={cn(
                "mt-px block text-xs font-semibold",
                paid
                  ? "text-income"
                  : type === "income"
                    ? "text-receive"
                    : "text-pending",
              )}
            >
              {paid
                ? type === "income"
                  ? "Marcado como recebido"
                  : "Marcado como pago"
                : "Ainda pendente"}
            </span>
          </span>
          <span
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition",
              paid ? "bg-income" : "bg-border-strong",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
                paid ? "left-[1.375rem]" : "left-0.5",
              )}
            />
          </span>
        </button>

        {state?.error && (
          <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        {/* O CTA do v2 carrega o tipo, na cor do tipo. */}
        <SubmitButton
          className="w-full"
          size="lg"
          variant={type === "income" ? "income" : "danger"}
        >
          {editing
            ? "Salvar"
            : type === "income"
              ? "Adicionar entrada"
              : "Adicionar saída"}
        </SubmitButton>
      </form>
    </Sheet>
  );
}
