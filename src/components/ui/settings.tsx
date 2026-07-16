import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

/** Grupo de configurações: título de seção + card com linhas divididas. */
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
      {title && <SectionTitle className="mt-0">{title}</SectionTitle>}
      <div className="divide-y divide-border overflow-hidden rounded-[18px] border border-border bg-card shadow-card">
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
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-accent text-primary",
            iconClassName,
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold">{label}</p>
        {description && (
          <p className="mt-px truncate text-[12.5px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
      {href && !right && (
        <ChevronRight className="h-4.5 w-4.5 shrink-0 text-faint" />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-muted/50"
      >
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 px-4 py-3.5">{inner}</div>;
}
