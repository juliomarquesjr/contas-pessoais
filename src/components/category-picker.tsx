"use client";

import { CategorySwatch } from "@/components/ui/category-swatch";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/schema";

export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <Chip
        selected={value === null}
        onClick={() => onChange(null)}
        color="#94a3b8"
        icon="tag"
        label="Nenhuma"
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          selected={value === c.id}
          onClick={() => onChange(c.id)}
          color={c.color}
          icon={c.icon}
          label={c.name}
        />
      ))}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  color,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  color: string;
  icon: string | null;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-20 shrink-0 flex-col items-center gap-1.75 rounded-[14px] border px-1.5 py-3 transition active:scale-95",
        selected ? "border-primary/40 bg-accent" : "border-border bg-muted",
      )}
    >
      <CategorySwatch
        color={color}
        icon={icon ?? "tag"}
        size="sm"
        className="h-8.5 w-8.5 rounded-[10px]"
      />
      <span
        className={cn(
          "w-full truncate text-center text-[11.5px] font-semibold leading-tight",
          selected ? "text-primary" : "text-foreground-soft",
        )}
      >
        {label}
      </span>
    </button>
  );
}
