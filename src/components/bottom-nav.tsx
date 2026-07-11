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

// Vão em "gota" ao redor do botão central (semicírculo no topo da barra).
const NOTCH =
  "radial-gradient(circle 42px at 50% 0, transparent 0 41px, #000 42px)";

const sideItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/mes", label: "Mês", icon: CalendarDays },
  { href: "/graficos", label: "Gráficos", icon: PieChart },
  // (centro = Início)
  { href: "/compras", label: "Compras", icon: ShoppingCart },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const left = sideItems.slice(0, 2);
  const right = sideItems.slice(2);
  const homeActive = isActive("/");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="relative mx-auto max-w-md pb-[env(safe-area-inset-bottom)]">
        {/* Barra com o recorte em gota */}
        <div
          aria-hidden
          className="absolute inset-0 border-t border-border/60 bg-card/95 backdrop-blur-lg shadow-[0_-8px_28px_-10px_rgba(80,40,160,0.25)]"
          style={{ WebkitMaskImage: NOTCH, maskImage: NOTCH }}
        />

        {/* Halo fosco preenchendo o vão da gota (evita o fundo nítido por baixo) */}
        <span
          aria-hidden
          className="absolute left-1/2 top-0 z-0 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/90 backdrop-blur-lg"
        />

        {/* Botão central (Início) saindo pela gota */}
        <Link
          href="/"
          aria-label="Início"
          className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
          <span
            className={cn(
              "flex h-[58px] w-[58px] items-center justify-center rounded-full border-4 border-card text-primary-foreground transition active:scale-95",
              "bg-gradient-to-br from-primary to-[#a855f7]",
              homeActive
                ? "shadow-[0_8px_20px_-4px_rgba(124,58,237,0.55)]"
                : "shadow-[0_6px_16px_-6px_rgba(124,58,237,0.45)]",
            )}
          >
            <Home className="h-6 w-6" />
          </span>
        </Link>

        {/* Conteúdo */}
        <div className="relative flex h-[66px] items-stretch">
          <div className="flex flex-1">
            {left.map((it) => (
              <NavItem key={it.href} {...it} active={isActive(it.href)} />
            ))}
          </div>

          {/* espaço reservado ao botão central + rótulo */}
          <div className="relative w-16 shrink-0">
            <span
              className={cn(
                "absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-medium",
                homeActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              Início
            </span>
          </div>

          <div className="flex flex-1">
            {right.map((it) => (
              <NavItem key={it.href} {...it} active={isActive(it.href)} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-12 items-center justify-center rounded-full transition",
          active && "bg-accent",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      {label}
    </Link>
  );
}
