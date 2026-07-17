"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Clock,
  Gauge,
  Wrench,
  Coins,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";

const ICONS: Record<Notification["icon"], LucideIcon> = {
  clock: Clock,
  gauge: Gauge,
  wrench: Wrench,
  coins: Coins,
};

const TONE = {
  expense: "border-expense/30 bg-expense-soft text-expense",
  pending: "border-pending/30 bg-pending-soft text-pending",
  receive: "border-receive/30 bg-receive-soft text-receive",
} as const;

/**
 * Sino do Início: tudo que pede ação, num lugar só.
 *
 * O badge conta apenas o que é acionável (ver lib/notifications) — sino que
 * sempre tem número vira ruído e ninguém abre.
 */
export function NotificationsBell({ items }: { items: Notification[] }) {
  const [open, setOpen] = useState(false);
  const count = items.length;
  const urgent = items.some((i) => i.tone === "expense");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          count ? `Notificações: ${count} pendente(s)` : "Notificações"
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition active:scale-95"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
              urgent ? "bg-expense" : "bg-pending",
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Notificações">
        {count === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-income-soft text-income">
              <BellOff className="h-6 w-6" />
            </div>
            <p className="font-display font-semibold">Nada por aqui</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sem contas a pagar e sem manutenção pendente. Tudo em dia.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((n) => {
              const Icon = ICONS[n.icon];
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-[16px] border p-3.5",
                    TONE[n.tone],
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-current/20">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-bold">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] opacity-80">
                      {n.text}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </Sheet>
    </>
  );
}
