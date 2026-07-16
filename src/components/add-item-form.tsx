"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { addItem } from "@/app/(app)/actions/shopping";

export function AddItemForm({ listId }: { listId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await addItem(fd);
        formRef.current?.reset();
      }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-card"
    >
      <input type="hidden" name="listId" value={listId} />
      <input
        name="name"
        placeholder="Adicionar item..."
        required
        className="h-10 min-w-0 flex-1 rounded-[11px] border border-input bg-muted px-3 text-sm placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        name="quantity"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue="1"
        aria-label="Quantidade"
        className="h-10 w-12 shrink-0 rounded-[11px] border border-input bg-muted px-1 text-center font-mono text-sm tnum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        name="price"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="R$"
        aria-label="Preço unitário"
        className="h-10 w-16 shrink-0 rounded-[11px] border border-input bg-muted px-2 font-mono text-sm tnum placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        aria-label="Adicionar item"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-linear-to-br from-primary to-primary-strong text-primary-foreground transition active:scale-95"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  );
}
