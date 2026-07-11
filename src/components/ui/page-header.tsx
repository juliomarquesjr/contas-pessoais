import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho padrão das telas — visual moderno e editorial:
 * uma "eyebrow" com traço de destaque, título grande e um subtítulo,
 * com ação opcional à direita e botão "voltar" opcional (backHref).
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  backHref,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
  className?: string;
}) {
  return (
    <header className={cn("relative mb-6 pt-2", className)}>
      {/* brilho decorativo sutil no canto */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 h-24 w-40 rounded-full bg-primary/10 blur-3xl"
      />

      {backHref && (
        <Link
          href={backHref}
          aria-label="Voltar"
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 flex items-center gap-2">
              <span className="h-[3px] w-6 rounded-full bg-gradient-to-r from-primary to-primary/20" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-[26px] font-bold leading-[1.1] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
    </header>
  );
}
