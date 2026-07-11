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
      className="flex items-end gap-2 rounded-2xl border border-border bg-card p-3"
    >
      <input type="hidden" name="listId" value={listId} />
      <div className="flex-1">
        <input
          name="name"
          placeholder="Adicionar item"
          required
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <input
        name="quantity"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        defaultValue="1"
        aria-label="Quantidade"
        className="h-10 w-14 rounded-lg border border-input bg-card px-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        name="price"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        placeholder="R$"
        aria-label="Preço unitário"
        className="h-10 w-20 rounded-lg border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        aria-label="Adicionar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  );
}
