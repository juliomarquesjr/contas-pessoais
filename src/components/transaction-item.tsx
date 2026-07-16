"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check } from "lucide-react";
import { CategorySwatch } from "@/components/ui/category-swatch";
import { TransactionForm } from "@/components/transaction-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteTransaction,
  toggleTransactionPaid,
} from "@/app/(app)/actions/transactions";
import { formatBRL } from "@/lib/money";
import { formatDateBR } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/schema";
import type { TransactionWithCategory } from "@/lib/queries";

const ACTIONS_WIDTH = 132; // largura do painel Editar+Excluir (esquerda ←)
const PAY_TRIGGER = 72; // quanto arrastar p/ direita → marca pago
const MAX_RIGHT = 108;

export function TransactionItem({
  tx,
  categories,
}: {
  tx: TransactionWithCategory;
  categories: Category[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [payConfirm, setPayConfirm] = useState(false);
  const [dx, setDx] = useState(0); // deslocamento atual da linha
  const [dragging, setDragging] = useState(false);
  const isIncome = tx.type === "income";

  const drag = useRef({
    startX: 0,
    startY: 0,
    baseDx: 0,
    decided: false,
    horizontal: false,
  });

  async function togglePaid() {
    const fd = new FormData();
    fd.set("id", String(tx.id));
    fd.set("paid", String(tx.paid));
    await toggleTransactionPaid(fd);
    router.refresh();
  }

  async function doDelete() {
    const fd = new FormData();
    fd.set("id", String(tx.id));
    await deleteTransaction(fd);
    router.refresh();
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseDx: dx,
      decided: false,
      horizontal: false,
    };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const d = drag.current;
    const deltaX = e.clientX - d.startX;
    const deltaY = e.clientY - d.startY;

    if (!d.decided) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      d.decided = true;
      d.horizontal = Math.abs(deltaX) > Math.abs(deltaY);
      if (d.horizontal) e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.horizontal) return;

    let next = d.baseDx + deltaX;
    next = Math.max(-ACTIONS_WIDTH, Math.min(MAX_RIGHT, next));
    setDx(next);
  }

  function onPointerUp() {
    setDragging(false);
    const d = drag.current;
    if (!d.horizontal) return;

    if (dx >= PAY_TRIGGER) {
      setDx(0);
      setPayConfirm(true); // pede confirmação antes de marcar
    } else if (dx <= -ACTIONS_WIDTH / 2) {
      setDx(-ACTIONS_WIDTH); // abre ações
    } else {
      setDx(0);
    }
  }

  // Texto da confirmação de pago/recebido conforme o estado atual
  const markingSettled = !tx.paid; // vai marcar como pago/recebido?
  const payTitle = markingSettled
    ? isIncome
      ? "Confirmar recebimento?"
      : "Confirmar pagamento?"
    : isIncome
      ? "Marcar como a receber?"
      : "Marcar como a pagar?";
  const payConfirmLabel = markingSettled
    ? isIncome
      ? "Sim, recebi"
      : "Sim, paguei"
    : "Marcar pendente";

  const payRevealed = dx > 0;

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Fundo esquerdo: marcar pago (aparece ao arrastar → direita) */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center gap-2 pl-4 text-sm font-semibold text-income transition-opacity",
            payRevealed ? "opacity-100" : "opacity-0",
          )}
        >
          <Check className="h-5 w-5" />
          {tx.paid
            ? isIncome
              ? "Marcar a receber"
              : "Marcar a pagar"
            : isIncome
              ? "Recebido"
              : "Pago"}
        </div>

        {/* Ações à direita: Editar / Excluir (aparecem ao arrastar ← esquerda) */}
        <div className="absolute inset-y-0 right-0 flex">
          <button
            type="button"
            aria-label="Editar"
            onClick={() => {
              setEditOpen(true);
              setDx(0);
            }}
            className="flex w-[66px] flex-col items-center justify-center gap-0.5 bg-accent text-primary"
          >
            <Pencil className="h-4 w-4" />
            <span className="text-[11px] font-medium">Editar</span>
          </button>
          <button
            type="button"
            aria-label="Excluir"
            onClick={() => {
              setConfirming(true);
              setDx(0);
            }}
            className="flex w-[66px] flex-col items-center justify-center gap-0.5 bg-expense text-white"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[11px] font-medium">Excluir</span>
          </button>
        </div>

        {/* Linha (primeiro plano, arrastável) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            transform: `translateX(${dx}px)`,
            transition: dragging ? "none" : "transform 0.22s ease",
            touchAction: "pan-y",
          }}
          className="relative flex select-none items-center gap-3.25 bg-card py-3"
        >
          <CategorySwatch
            color={tx.categoryColor ?? "#8b5cf6"}
            icon={tx.categoryIcon ?? "tag"}
            size="md"
            className="rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">
              {tx.description}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {tx.categoryName ?? "Sem categoria"} · {formatDateBR(tx.date)}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div
              className={cn(
                "font-mono text-[14.5px] font-semibold tnum",
                isIncome ? "text-income" : "text-expense",
              )}
            >
              {isIncome ? "+" : "−"}
              {formatBRL(tx.amount)}
            </div>
            {/* "A pagar" e "A receber" são estados diferentes no v2:
               pendente (âmbar) x a receber (azul). */}
            <div
              className={cn(
                "mt-0.5 text-[11.5px] font-semibold",
                tx.paid
                  ? "text-income"
                  : isIncome
                    ? "text-receive"
                    : "text-pending",
              )}
            >
              {tx.paid
                ? isIncome
                  ? "Recebido"
                  : "Pago"
                : isIncome
                  ? "A receber"
                  : "A pagar"}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={payConfirm}
        onClose={() => setPayConfirm(false)}
        onConfirm={togglePaid}
        tone={markingSettled ? "success" : "primary"}
        icon={<Check className="h-6 w-6" />}
        title={payTitle}
        description={
          <>
            {tx.description} — <strong>{formatBRL(tx.amount)}</strong>
          </>
        }
        confirmLabel={payConfirmLabel}
      />

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={doDelete}
        tone="danger"
        icon={<Trash2 className="h-6 w-6 text-expense" />}
        title="Excluir lançamento?"
        description={
          <>
            {tx.description} — <strong>{formatBRL(tx.amount)}</strong>. Esta ação
            não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
      />

      <TransactionForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        categories={categories}
        defaultDate={tx.date}
        editing={{
          id: tx.id,
          type: tx.type,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          categoryId: tx.categoryId,
          paid: tx.paid,
        }}
      />
    </>
  );
}
