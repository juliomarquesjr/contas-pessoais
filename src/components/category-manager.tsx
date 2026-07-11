"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCategory } from "@/app/(app)/actions/categories";
import type { Category } from "@/lib/schema";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [deleting, setDeleting] = useState<Category | undefined>();

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
      <div className="flex justify-end px-1">
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
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
                  <button
                    type="button"
                    aria-label="Excluir categoria"
                    onClick={() => setDeleting(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-expense-soft hover:text-expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(undefined)}
        onConfirm={async () => {
          if (!deleting) return;
          const fd = new FormData();
          fd.set("id", String(deleting.id));
          await deleteCategory(fd);
          router.refresh();
        }}
        tone="danger"
        icon={<Trash2 className="h-6 w-6 text-expense" />}
        title="Excluir categoria?"
        description={
          <>
            {deleting?.name} será removida. Os lançamentos existentes ficam sem
            categoria.
          </>
        }
        confirmLabel="Excluir"
      />
    </div>
  );
}
