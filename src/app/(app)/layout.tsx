import type { CSSProperties } from "react";
import { requireSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/queries";
import { BottomNav } from "@/components/bottom-nav";
import { AppearanceSync } from "@/components/appearance-sync";

// App autenticado: sempre renderiza por request (lê sessão/cookies).
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await requireSession();
  const me = await getCurrentUser(userId);

  // Cor de destaque personalizada do membro (sobrescreve os tokens do tema).
  const accent = me?.accentColor;
  const style = accent
    ? ({
        ["--primary"]: accent,
        ["--ring"]: accent,
        ["--accent"]: `color-mix(in srgb, ${accent} 16%, transparent)`,
        ["--accent-foreground"]: accent,
      } as CSSProperties)
    : undefined;

  return (
    <div
      style={style}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col"
    >
      <AppearanceSync theme={me?.theme} />
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
