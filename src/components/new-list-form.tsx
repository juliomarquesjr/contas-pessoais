"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createList, createSupplier } from "@/app/(app)/actions/shopping";
import type { Supplier } from "@/lib/schema";

export function NewListButton({ suppliers }: { suppliers: Supplier[] }) {
  const [open, setOpen] = useState(false);
  const [addingSupplier, setAddingSupplier] = useState(false);

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

      <Sheet open={open} onClose={() => setOpen(false)} title="Nova lista de compras">
        <form action={createList} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Compra do mês"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="supplierId">Fornecedor / local</Label>
            <Select id="supplierId" name="supplierId" defaultValue="">
              <option value="">Nenhum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Criar lista
          </Button>
        </form>

        <div className="mt-4 border-t border-border pt-4">
          {addingSupplier ? (
            <form
              action={createSupplier}
              className="flex items-end gap-2"
              onSubmit={() => setAddingSupplier(false)}
            >
              <div className="flex-1">
                <Label htmlFor="name">Novo fornecedor/local</Label>
                <Input id="name" name="name" placeholder="Ex: Supermercado" required />
              </div>
              <Button type="submit" variant="secondary" size="md">
                Salvar
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingSupplier(true)}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Store className="h-4 w-4" />
              Cadastrar fornecedor/local
            </button>
          )}
        </div>
      </Sheet>
    </>
  );
}
