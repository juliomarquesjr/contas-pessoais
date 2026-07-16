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
        className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-linear-to-br from-primary to-primary-strong px-4 py-4 text-base font-semibold text-primary-foreground shadow-[0_14px_26px_-10px_color-mix(in_srgb,var(--primary)_60%,transparent)] transition active:scale-[0.99]"
      >
        <Receipt className="h-5 w-5" />
        Lançar {formatBRL(total)} como gasto
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
      {/* Ícone no slot de ação do cabeçalho (tela 41 do handoff). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Excluir lista"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-faint transition hover:text-expense active:scale-95"
      >
        <Trash2 className="h-4.5 w-4.5" />
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
