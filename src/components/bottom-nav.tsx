"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/nav-icon";
import { dockItems } from "@/lib/dock";
import { cn } from "@/lib/utils";

/**
 * Dock flutuante do handoff v2: pílula centralizada, translúcida com blur.
 * O item ativo vira pílula preenchida (ícone + rótulo); os demais só ícone.
 *
 * Os itens vêm da preferência do membro (lib/dock.ts) — cabem 5 em 390px.
 */
export function BottomNav({ dock }: { dock?: string | null }) {
  const pathname = usePathname();
  const items = dockItems(dock);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(22px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-0.75 rounded-[21px] border border-border bg-card/88 p-1.75 shadow-dock backdrop-blur-xl">
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.key}
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
              <NavIcon
                name={it.icon}
                className={cn("h-5 w-5", active && "shrink-0")}
              />
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
