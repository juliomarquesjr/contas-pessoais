"use client";

import { useState } from "react";
import { Plus, Store, Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createList, createSupplier } from "@/app/(app)/actions/shopping";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/lib/schema";

export function NewListButton({ suppliers }: { suppliers: Supplier[] }) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [addingSupplier, setAddingSupplier] = useState(false);

  function close() {
    setOpen(false);
    setSupplierId(null);
    setAddingSupplier(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Nova lista"
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </button>

      <Sheet open={open} onClose={close} title="Nova lista de compras">
        <form action={createList} className="space-y-5">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="Ex: Compra do mês" required />
          </div>

          <div>
            <Label>Fornecedor / local</Label>
            <input type="hidden" name="supplierId" value={supplierId ?? ""} />
            <div className="flex flex-wrap gap-2">
              <SupplierChip
                selected={supplierId === null}
                onClick={() => setSupplierId(null)}
                label="Nenhum"
              />
              {suppliers.map((s) => (
                <SupplierChip
                  key={s.id}
                  selected={supplierId === s.id}
                  onClick={() => setSupplierId(s.id)}
                  label={s.name}
                  icon
                />
              ))}
              <button
                type="button"
                onClick={() => setAddingSupplier((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-dashed px-3 py-2 text-sm font-medium transition",
                  addingSupplier
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <Plus className="h-4 w-4" /> Novo
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Criar lista
          </Button>
        </form>

        {addingSupplier && (
          <form
            action={createSupplier}
            className="mt-4 border-t border-border pt-4"
            onSubmit={() => setAddingSupplier(false)}
          >
            <Label htmlFor="supplier-name">Novo fornecedor / local</Label>
            <div className="flex gap-2">
              <Input
                id="supplier-name"
                name="name"
                placeholder="Ex: Supermercado"
                required
              />
              <Button type="submit" variant="secondary">
                Salvar
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Depois de salvar, toque nele acima para selecionar.
            </p>
          </form>
        )}
      </Sheet>
    </>
  );
}

function SupplierChip({
  selected,
  onClick,
  label,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition",
        selected
          ? "border-primary bg-accent text-primary"
          : "border-border text-muted-foreground",
      )}
    >
      {selected ? (
        <Check className="h-4 w-4" />
      ) : icon ? (
        <Store className="h-4 w-4" />
      ) : null}
      {label}
    </button>
  );
}
