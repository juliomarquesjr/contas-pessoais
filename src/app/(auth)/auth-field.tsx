import type { LucideIcon } from "lucide-react";

/**
 * Campo das telas de autenticação: translúcido sobre a tinta escura.
 * Não usa o <Input> padrão porque aquele é feito para as superfícies de papel.
 */
export function AuthField({
  icon: Icon,
  label,
  ...props
}: {
  icon: LucideIcon;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-white/45"
      >
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-[15px] border border-white/13 bg-white/7 px-4 transition focus-within:border-primary-ink/50">
        <Icon className="h-[19px] w-[19px] shrink-0 text-white/50" />
        <input
          {...props}
          className="h-[52px] w-full min-w-0 bg-transparent text-[15px] text-white placeholder:text-white/35 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
