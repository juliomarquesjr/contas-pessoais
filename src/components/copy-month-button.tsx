"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { copyPreviousMonth } from "@/app/(app)/actions/transactions";

/**
 * Copia os lançamentos do mês anterior.
 *
 * Ficava como ícone sem rótulo no cabeçalho — mas o slot direito do v2 é da
 * navegação de mês, e um ícone mudo tinha descoberta ruim (o estado vazio
 * precisava explicar o que ele fazia). Agora é um botão com texto.
 */
export function CopyMonthButton({ monthKey }: { monthKey: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function confirm() {
    const fd = new FormData();
    fd.set("month", monthKey);
    await copyPreviousMonth(fd);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-border-strong py-3 text-[13.5px] font-semibold text-muted-foreground transition active:scale-[0.99]"
      >
        <CopyPlus className="h-4 w-4" />
        Copiar lançamentos do mês anterior
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        tone="primary"
        icon={<CopyPlus className="h-6 w-6" />}
        title="Copiar mês anterior?"
        description="Todos os lançamentos do mês anterior serão duplicados aqui, como pendentes. Você pode ajustar depois."
        confirmLabel="Copiar"
      />
    </>
  );
}
