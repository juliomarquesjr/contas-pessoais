import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      {/* Fundo decorativo animado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-background"
      >
        <div className="animate-blob absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div
          className="animate-blob absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl"
          style={{ animationDelay: "-4s" }}
        />
        <div
          className="animate-blob absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Logo com anel pulsante e flutuação */}
          <div className="animate-fade-up relative mb-4">
            <span className="absolute inset-0 -z-10 rounded-[28px] bg-primary/30 blur-md" />
            <span className="animate-pulse-ring absolute inset-0 -z-10 rounded-[28px] bg-primary/40" />
            <Logo className="animate-float h-20 w-20 drop-shadow-xl" />
          </div>
          <h1
            className="animate-fade-up text-2xl font-bold tracking-tight"
            style={{ animationDelay: "80ms" }}
          >
            Finanças da Casa
          </h1>
          <p
            className="animate-fade-up mt-1.5 text-sm text-muted-foreground"
            style={{ animationDelay: "140ms" }}
          >
            O controle financeiro da família, mês a mês.
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          {children}
        </div>
      </div>

      <p
        className="animate-fade-up mt-8 text-center text-xs text-muted-foreground"
        style={{ animationDelay: "300ms" }}
      >
        Feito com 💜 para a sua casa
      </p>
    </div>
  );
}
