"use client";

import { useState } from "react";
import { Fab } from "@/components/ui/fab";
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
      <Fab onClick={() => setOpen(true)} label="Adicionar lançamento" />
      <TransactionForm
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        defaultDate={defaultDate}
      />
    </>
  );
}
