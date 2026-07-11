import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, nextMonthKey, prevMonthKey } from "@/lib/dates";

export function MonthSwitcher({
  monthKey,
  basePath = "/",
}: {
  monthKey: string;
  basePath?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={`${basePath}?m=${prevMonthKey(monthKey)}`}
        aria-label="Mês anterior"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition hover:bg-muted"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-lg font-bold">{monthLabel(monthKey)}</h1>
      <Link
        href={`${basePath}?m=${nextMonthKey(monthKey)}`}
        aria-label="Próximo mês"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition hover:bg-muted"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
