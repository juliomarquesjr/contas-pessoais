"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryForm } from "@/components/category-form";
import { deleteCategory } from "@/app/(app)/actions/categories";
import type { Category } from "@/lib/schema";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  function openNew() {
    setEditing(undefined);
    setOpen(true);
  }
  function openEdit(cat: Category) {
    setEditing(cat);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Categorias</h2>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-primary"
        >
          <Plus className="h-4 w-4" />
          Nova
        </button>
      </div>

      {[
        { label: "Saídas", items: expense },
        { label: "Entradas", items: income },
      ].map((group) =>
        group.items.length === 0 ? null : (
          <div key={group.label}>
            <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card px-3">
              {group.items.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: cat.color + "22",
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} className="h-4 w-4" />
                  </div>
                  <span className="flex-1 truncate font-medium">
                    {cat.name}
                  </span>
                  <button
                    type="button"
                    aria-label="Editar categoria"
                    onClick={() => openEdit(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={cat.id} />
                    <button
                      type="submit"
                      aria-label="Excluir categoria"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        ),
      )}

      <CategoryForm
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </div>
  );
}
