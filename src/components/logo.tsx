import { cn } from "@/lib/utils";

/**
 * Logo do app — casa com moeda e seta de crescimento.
 * `variant="badge"` inclui o fundo em gradiente roxo (padrão);
 * `variant="mark"` desenha só a marca (herda a cor via currentColor no fundo).
 */
export function Logo({
  className,
  variant = "badge",
}: {
  className?: string;
  variant?: "badge" | "mark";
}) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn(className)}
      role="img"
      aria-label="Finanças da Casa"
    >
      {variant === "badge" && (
        <>
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="112" fill="url(#logoGrad)" />
        </>
      )}
      <path
        d="M256 108 L420 248 a16 16 0 0 1 6 12 v140 a16 16 0 0 1 -16 16 H102 a16 16 0 0 1 -16 -16 V260 a16 16 0 0 1 6 -12 Z"
        fill="#ffffff"
      />
      <circle cx="256" cy="304" r="60" fill="#ede9fe" />
      <path
        d="M226 322 L250 300 L268 314 L294 282"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M278 280 L296 280 L296 298"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
