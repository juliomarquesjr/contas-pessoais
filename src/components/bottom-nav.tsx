"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  PieChart,
  ShoppingCart,
  Settings,
  Home,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/mes", label: "Mês", icon: CalendarDays },
  { href: "/graficos", label: "Gráficos", icon: PieChart },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

/**
 * Dock flutuante do handoff v2: pílula centralizada, translúcida com blur.
 * O item ativo vira pílula preenchida (ícone + rótulo); os demais só ícone.
 */
export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(22px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-0.75 rounded-[21px] border border-border bg-card/88 p-1.75 shadow-dock backdrop-blur-xl">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11.5 items-center justify-center rounded-[15px] transition active:scale-95",
                active
                  ? "gap-2 bg-primary px-4 text-primary-foreground"
                  : "w-12.5 text-faint",
              )}
            >
              <it.icon className={cn("h-5 w-5", active && "shrink-0")} />
              {active && (
                <span className="text-[13px] font-semibold">{it.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
