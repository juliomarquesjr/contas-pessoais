import { cn } from "@/lib/utils";

/**
 * Cabeçalho padrão das telas — visual moderno e editorial:
 * uma "eyebrow" com traço de destaque, título grande e um subtítulo,
 * com ação opcional alinhada à direita. Distingue claramente o topo do conteúdo.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("relative mb-6 pt-2", className)}>
      {/* brilho decorativo sutil no canto */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 h-24 w-40 rounded-full bg-primary/10 blur-3xl"
      />

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
