"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/lib/schema";

export function AddTransactionFab({
  categories,
  defaultDate,
}: {
  categories: Category[];
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Adicionar lançamento"
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </button>
      <TransactionForm
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        defaultDate={defaultDate}
      />
    </>
  );
}
