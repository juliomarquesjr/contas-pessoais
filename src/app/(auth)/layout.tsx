/**
 * Shell das telas 01/02 do handoff: tinta escura com brilhos radiais do
 * acento. São as únicas telas com fundo escuro nos dois temas — por isso
 * usam --ink e não --background.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-16 h-70 w-70 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_55%,transparent),transparent_68%)] opacity-55" />
        <div className="absolute -bottom-20 -right-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_35%,transparent),transparent_70%)] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-sm flex-col px-7 pb-9 pt-9">
        {children}
      </div>
    </div>
  );
}
