"use client";

import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const CLOSE_THRESHOLD = 110; // px arrastados para fechar

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const activeRef = useRef(false);

  /* Portal só após montar, senão dá hydration mismatch — ver useMounted. */
  const mounted = useMounted();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    activeRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!activeRef.current) return;
    const dy = e.clientY - startY.current;
    setDragY(dy > 0 ? dy : 0);
  }
  function onPointerUp() {
    if (!activeRef.current) return;
    activeRef.current = false;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) onClose();
    setDragY(0);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragging
            ? "none"
            : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        {/* Área de arrastar para fechar */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: "none" }}
          className="-mt-2 mb-2 flex cursor-grab justify-center py-2 active:cursor-grabbing"
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
