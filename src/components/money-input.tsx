"use client";

import { useEffect, useRef, useState } from "react";

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Campo de valor com máscara de moeda (BRL). Os dígitos preenchem da direita
 * para a esquerda (centavos) e o cursor fica sempre no fim, para facilitar a
 * edição. Envia o valor numérico em um input oculto `name`.
 */
export function MoneyInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [cents, setCents] = useState<number>(() =>
    defaultValue ? Math.round(Number(defaultValue) * 100) : 0,
  );

  const display = formatCents(cents);

  // Mantém o cursor no fim sempre que o valor muda (enquanto focado).
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement === el) {
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }
  }, [cents]);

  const toEnd = () => {
    const el = ref.current;
    if (el) {
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground">
        R$
      </span>
      <input
        ref={ref}
        id={name}
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
          setCents(digits ? parseInt(digits, 10) : 0);
        }}
        onFocus={toEnd}
        onClick={toEnd}
        className="h-14 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-right text-xl font-semibold tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input type="hidden" name={name} value={(cents / 100).toFixed(2)} />
    </div>
  );
}
