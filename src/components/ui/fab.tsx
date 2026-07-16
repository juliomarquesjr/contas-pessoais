"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botão flutuante de ação, logo acima da dock.
 * Era duplicado em add-transaction-fab e new-list-form.
 */
export function Fab({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed bottom-[100px] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-2xl",
        "bg-linear-to-br from-primary to-primary-strong text-primary-foreground",
        "shadow-[0_16px_32px_-12px_color-mix(in_srgb,var(--primary)_85%,transparent)]",
        "transition active:scale-95",
        className,
      )}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
