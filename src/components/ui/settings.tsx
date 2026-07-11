import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Grupo de configurações: título curto em maiúsculas + card com linhas divididas. */
export function SettingsGroup({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title && (
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </h2>
      )}
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

/**
 * Linha de configuração: chip de ícone + rótulo/descrição + controle à direita.
 * Se `href` for informado, vira um link navegável com chevron.
 */
export function SettingsRow({
  icon,
  iconClassName,
  label,
  description,
  right,
  href,
}: {
  icon?: React.ReactNode;
  iconClassName?: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      {icon && (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary",
            iconClassName,
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{label}</p>
        {description && (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
      {href && !right && (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/50"
      >
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 px-4 py-3">{inner}</div>;
}
