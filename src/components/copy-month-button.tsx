"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { copyPreviousMonth } from "@/app/(app)/actions/transactions";

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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-accent/40 px-4 py-3 text-sm font-medium text-primary transition hover:bg-accent"
      >
        <Copy className="h-4 w-4" />
        Copiar lançamentos do mês anterior
      </button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        tone="primary"
        icon={<Copy className="h-6 w-6" />}
        title="Copiar mês anterior?"
        description="Todos os lançamentos do mês anterior serão duplicados aqui, como pendentes. Você pode ajustar depois."
        confirmLabel="Copiar"
      />
    </>
  );
}
