"use client";

import { useState } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  convertListToExpense,
  deleteList,
} from "@/app/(app)/actions/shopping";
import { formatBRL } from "@/lib/money";

export function ConvertListButton({
  listId,
  total,
}: {
  listId: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-medium text-primary-foreground shadow-sm shadow-primary/30 transition active:scale-[0.99]"
      >
        <Receipt className="h-5 w-5" />
        Lançar {formatBRL(total)} como gasto do mês
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          const fd = new FormData();
          fd.set("id", String(listId));
          await convertListToExpense(fd);
        }}
        tone="primary"
        icon={<Receipt className="h-6 w-6" />}
        title="Lançar como gasto?"
        description={
          <>
            Um gasto de <strong>{formatBRL(total)}</strong> será criado no mês
            atual e a lista será concluída.
          </>
        }
        confirmLabel="Lançar gasto"
      />
    </>
  );
}

export function DeleteListButton({ listId }: { listId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-expense transition hover:bg-expense-soft"
      >
        <Trash2 className="h-4 w-4" />
        Excluir lista
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          const fd = new FormData();
          fd.set("id", String(listId));
          await deleteList(fd);
        }}
        tone="danger"
        icon={<Trash2 className="h-6 w-6 text-expense" />}
        title="Excluir lista?"
        description="A lista e todos os seus itens serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </>
  );
}
