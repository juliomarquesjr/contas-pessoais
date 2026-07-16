"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "danger" | "success";

const toneBtn: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  danger: "bg-expense text-white",
  success: "bg-income text-white",
};

const toneIcon: Record<Tone, string> = {
  primary: "bg-accent text-primary",
  danger: "bg-expense-soft text-expense",
  success: "bg-income-soft text-income",
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "primary",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  /* O portal só existe depois de montar. `typeof document` como guarda dava
     hydration mismatch: o servidor não renderiza portal, o cliente renderiza
     já no primeiro passe — e o React encontrava um nó a mais na árvore. */
  const mounted = useMounted();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleConfirm() {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-60 flex items-center justify-center p-6 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={loading ? undefined : onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-w-xs rounded-3xl border border-border bg-card p-6 text-center shadow-2xl transition-all duration-200",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {icon && (
          <div
            className={cn(
              "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full",
              toneIcon[tone],
            )}
          >
            {icon}
          </div>
        )}
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <div className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-60",
              toneBtn[tone],
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-12 items-center justify-center rounded-full font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
