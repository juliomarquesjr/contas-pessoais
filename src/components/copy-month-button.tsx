"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { copyPreviousMonth } from "@/app/(app)/actions/transactions";

/** Ícone no cabeçalho para copiar os lançamentos do mês anterior. */
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
        aria-label="Copiar lançamentos do mês anterior"
        title="Copiar mês anterior"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
      >
        <CopyPlus className="h-5 w-5" />
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
