"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CategorySwatch } from "@/components/ui/category-swatch";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PageHeader,
  ScreenBody,
  SectionTitle,
} from "@/components/ui/page-header";
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
    <>
      {/* O cabeçalho vive aqui (e não na page) porque o botão "+ Nova" do
          handoff fica no slot de ação e precisa abrir o sheet deste estado. */}
      <PageHeader
        backHref="/ajustes"
        eyebrow="Personalização"
        title="Categorias"
        action={
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-[13px] font-semibold text-primary transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nova
          </button>
        }
      />

      <ScreenBody>
        {[
          { label: "Saídas", items: expense },
          { label: "Entradas", items: income },
        ].map((group) =>
          group.items.length === 0 ? null : (
            <div key={group.label}>
              <SectionTitle className="first:mt-0">
                {group.label} · {group.items.length}
              </SectionTitle>
              <div className="divide-y divide-border rounded-[18px] border border-border bg-card px-3.5 shadow-card">
                {group.items.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 py-2.5">
                    <CategorySwatch
                      color={cat.color}
                      icon={cat.icon}
                      size="sm"
                      className="h-9 w-9 rounded-[10px]"
                    />
                    <span className="flex-1 truncate text-[15px] font-semibold">
                      {cat.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Editar ${cat.name}`}
                      onClick={() => openEdit(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${cat.name}`}
                      onClick={() => setDeleting(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition hover:bg-expense-soft hover:text-expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ),
        )}
      </ScreenBody>

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
    </>
  );
}
