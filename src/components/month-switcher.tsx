import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthCompactLabel, nextMonthKey, prevMonthKey } from "@/lib/dates";

/**
 * Navegação de mês compacta (‹ Jul 2026 ›) — vive no slot direito do
 * cabeçalho nas telas de Mês e Gráficos.
 */
export function MonthSwitcher({
  monthKey,
  basePath = "/",
}: {
  monthKey: string;
  basePath?: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-border bg-card px-1 py-1">
      <Link
        href={`${basePath}?m=${prevMonthKey(monthKey)}`}
        aria-label="Mês anterior"
        className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] text-foreground transition active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="px-0.5 text-[13px] font-semibold text-foreground">
        {monthCompactLabel(monthKey)}
      </span>
      <Link
        href={`${basePath}?m=${nextMonthKey(monthKey)}`}
        aria-label="Próximo mês"
        className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] text-foreground transition active:scale-95"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
