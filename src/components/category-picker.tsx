"use client";

import { CategoryIcon } from "@/components/category-icon";
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
    <div className="grid grid-cols-4 gap-2">
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
      className={cn(
        "flex w-full flex-col items-center gap-1.5 rounded-2xl border p-2 transition active:scale-95",
        selected
          ? "border-primary bg-accent"
          : "border-border bg-card",
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: color + "22", color }}
      >
        <CategoryIcon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <span
        className={cn(
          "w-full truncate text-center text-[11px] leading-tight",
          selected ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  );
}
