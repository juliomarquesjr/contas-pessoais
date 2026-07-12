"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
} from "date-fns";
import { parseMonthKey, monthLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/**
 * Calendário de seleção de período (de/até) dentro de um mês.
 * Toque num dia para iniciar; toque em outro para fechar o intervalo.
 */
export function DateRangeCalendar({
  monthKey,
  from,
  to,
  onChange,
}: {
  monthKey: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const base = parseMonthKey(monthKey);
  const days = eachDayOfInterval({
    start: startOfMonth(base),
    end: endOfMonth(base),
  });
  const leading = getDay(startOfMonth(base));

  function selectDay(dateStr: string) {
    // Sem início, ou intervalo já completo → começa novo intervalo
    if (!from || (from && to)) {
      onChange(dateStr, "");
      return;
    }
    // Tem início, falta fim
    if (dateStr >= from) {
      onChange(from, dateStr);
    } else {
      onChange(dateStr, "");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="mb-2 text-center text-sm font-medium">
        {monthLabel(monthKey)}
      </p>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="py-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leading }).map((_, i) => (
          <span key={`b-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isStart = dateStr === from;
          const isEnd = dateStr === to;
          const inRange = from && to && dateStr > from && dateStr < to;
          const selected = isStart || isEnd;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => selectDay(dateStr)}
              className={cn(
                "flex h-9 items-center justify-center rounded-lg text-sm transition",
                selected && "bg-primary font-semibold text-primary-foreground",
                inRange && "bg-accent text-primary",
                !selected && !inRange && "hover:bg-muted",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      {(from || to) && (
        <button
          type="button"
          onClick={() => onChange("", "")}
          className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Limpar período
        </button>
      )}
    </div>
  );
}
