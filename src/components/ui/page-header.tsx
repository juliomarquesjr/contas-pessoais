import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Padding lateral das telas (22px no handoff). */
export const SCREEN_X = "px-[22px]";

/**
 * Marca da casa: telhado + linha de crescimento. Vai no slot esquerdo das
 * telas raiz.
 */
export function LogoTile({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[13px] bg-linear-to-br from-primary to-primary-strong text-primary-foreground shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--primary)_80%,transparent)]",
        className,
      )}
    >
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 10.5 12 3.5l9 7" />
        <path d="M5 10v10h14V10" />
        <path d="m8.5 15 2.5-2.5 2 2 3-3.5" />
      </svg>
    </span>
  );
}

/**
 * Cabeçalho das telas (handoff v2): uma linha só —
 * slot esquerdo (logo nas telas raiz, voltar nas internas),
 * centro com sobrelinha + título, e um slot de ação à direita.
 *
 * Fica sticky porque a dock é flutuante e as listas são longas: sem isso a
 * navegação de mês some ao rolar.
 */
export function PageHeader({
  eyebrow,
  title,
  action,
  backHref,
  leading,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  /** Substitui o slot esquerdo (ex.: avatar do membro no Início). */
  leading?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 bg-background pb-3 pt-[max(0.5rem,env(safe-area-inset-top))]",
        SCREEN_X,
        className,
      )}
    >
      {leading ??
        (backHref ? (
          <Link
            href={backHref}
            aria-label="Voltar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <LogoTile />
        ))}

      <div className="min-w-0 flex-1">
        {eyebrow && <div className="eyebrow truncate">{eyebrow}</div>}
        <h1 className="mt-px truncate font-display text-[20px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground">
          {title}
        </h1>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/**
 * Título de seção do v2 — display 18px. É o mesmo token em "Onde vai o
 * dinheiro", "Saídas · 15", "A Casa", "Itens · 2"...
 */
export function SectionTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  /** Slot à direita, ex.: o link "Ver tudo". */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mb-2.5 mt-6 flex items-center justify-between gap-2 px-0.5", className)}
    >
      <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Corpo da tela: mesmo padding lateral do cabeçalho. */
export function ScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(SCREEN_X, "pt-1.5", className)}>{children}</div>;
}
