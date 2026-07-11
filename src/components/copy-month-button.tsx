"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { copyPreviousMonth } from "@/app/(app)/actions/transactions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      Confirmar
    </button>
  );
}

export function CopyMonthButton({ monthKey }: { monthKey: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Copiar tudo do mês anterior?
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            Cancelar
          </button>
          <form action={copyPreviousMonth}>
            <input type="hidden" name="month" value={monthKey} />
            <ConfirmButton />
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-accent/40 px-4 py-3 text-sm font-medium text-primary transition hover:bg-accent"
    >
      <Copy className="h-4 w-4" />
      Copiar lançamentos do mês anterior
    </button>
  );
}
