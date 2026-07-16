import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "income"
  | "outline";
type Size = "sm" | "md" | "lg" | "icon";

// v2: CTA é retângulo de raio 15 com gradiente do acento — não mais pílula.
const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-br from-primary to-primary-strong text-primary-foreground shadow-[0_14px_26px_-10px_color-mix(in_srgb,var(--primary)_65%,transparent)] hover:opacity-95",
  secondary: "bg-accent text-accent-foreground hover:bg-accent/80",
  ghost: "hover:bg-muted text-foreground",
  outline: "border border-border bg-card hover:bg-muted text-foreground",
  danger:
    "bg-linear-to-br from-expense to-[color-mix(in_srgb,var(--expense)_78%,#000)] text-white shadow-[0_14px_26px_-10px_color-mix(in_srgb,var(--expense)_55%,transparent)] hover:opacity-95",
  income:
    "bg-linear-to-br from-income to-[color-mix(in_srgb,var(--income)_75%,#000)] text-white shadow-[0_14px_26px_-10px_color-mix(in_srgb,var(--income)_55%,transparent)] hover:opacity-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-[13px] px-4 text-sm",
  lg: "h-[52px] rounded-[15px] px-6 text-base",
  icon: "h-11 w-11 rounded-xl",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
