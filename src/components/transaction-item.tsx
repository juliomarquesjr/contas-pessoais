"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { TransactionForm } from "@/components/transaction-form";
import { deleteTransaction } from "@/app/(app)/actions/transactions";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/schema";
import type { TransactionWithCategory } from "@/lib/queries";

export function TransactionItem({
  tx,
  categories,
}: {
  tx: TransactionWithCategory;
  categories: Category[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const isIncome = tx.type === "income";

  return (
    <>
      <div className="flex items-center gap-3 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: (tx.categoryColor ?? "#8b5cf6") + "22",
            color: tx.categoryColor ?? "#8b5cf6",
          }}
        >
          <CategoryIcon name={tx.categoryIcon} className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{tx.description}</p>
          <p className="text-xs text-muted-foreground">
            {tx.categoryName ?? "Sem categoria"} · {formatDateBR(tx.date)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <span
            className={cn(
              "shrink-0 font-semibold tabular-nums",
              isIncome ? "text-income" : "text-expense",
            )}
          >
            {isIncome ? "+" : "−"}
            {formatBRL(tx.amount)}
          </span>
          <button
            type="button"
            aria-label="Editar"
            onClick={() => setEditOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Excluir"
            onClick={() => setConfirming(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-expense-soft hover:text-expense"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {confirming && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-expense-soft px-3 py-2 text-sm">
          <span className="text-expense">Excluir este lançamento?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full px-3 py-1 font-medium text-muted-foreground"
            >
              Não
            </button>
            <form action={deleteTransaction}>
              <input type="hidden" name="id" value={tx.id} />
              <button
                type="submit"
                className="rounded-full bg-expense px-3 py-1 font-medium text-white"
              >
                Excluir
              </button>
            </form>
          </div>
        </div>
      )}

      <TransactionForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        categories={categories}
        defaultDate={tx.date}
        editing={{
          id: tx.id,
          type: tx.type,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          categoryId: tx.categoryId,
        }}
      />
    </>
  );
}
