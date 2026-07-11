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
        d="M120 300 q-24 -6 -20 18 q4 16 20 8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect x="196" y="378" width="34" height="52" rx="16" fill="#ffffff" />
      <rect x="288" y="378" width="34" height="52" rx="16" fill="#ffffff" />
      <path d="M296 232 q10 -46 48 -22 q-8 30 -48 22 Z" fill="#f0e9ff" />
      <ellipse cx="252" cy="300" rx="142" ry="106" fill="#ffffff" />
      <ellipse cx="378" cy="312" rx="30" ry="38" fill="#f0e6ff" />
      <ellipse cx="372" cy="299" rx="5.5" ry="8" fill="#7c3aed" />
      <ellipse cx="372" cy="325" rx="5.5" ry="8" fill="#7c3aed" />
      <ellipse cx="320" cy="322" rx="16" ry="10" fill="#f9a8d4" opacity="0.75" />
      <circle cx="300" cy="286" r="10" fill="#4c1d95" />
      <circle cx="304" cy="282" r="3.2" fill="#ffffff" />
      <rect x="214" y="212" width="78" height="15" rx="7.5" fill="#7c3aed" />
      <circle cx="253" cy="172" r="36" fill="#fbbf24" />
      <circle cx="253" cy="172" r="24" fill="none" stroke="#f59e0b" strokeWidth="5" />
    </svg>
  );
}
