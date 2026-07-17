import { requireSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/queries";
import { BottomNav } from "@/components/bottom-nav";
import { AppearanceSync } from "@/components/appearance-sync";
import { accentTokens, isValidAccent } from "@/lib/accents";

// App autenticado: sempre renderiza por request (lê sessão/cookies).
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await requireSession();
  const me = await getCurrentUser(userId);

  /*
   * Cor de destaque do membro, aplicada no :root.
   *
   * Antes isto era um style inline num <div> daqui — mas sheets e diálogos
   * usam portal para document.body, fora deste elemento, e apareciam sempre
   * no violeta padrão em vez do acento escolhido. No :root vale para a página
   * inteira, portais inclusive.
   *
   * `:root:root` sobe a especificidade para ganhar de `.dark` (globals.css)
   * independentemente da ordem em que os estilos entram.
   */
  const accent = isValidAccent(me?.accentColor) ? me.accentColor : null;
  const t = accent ? accentTokens(accent) : null;
  const css = t
    ? `:root:root{--primary:${t.primary};--primary-strong:${t.primaryStrong};--primary-ink:${t.primaryInk};--primary-foreground:${t.primaryForeground};--ring:${t.primary};--accent:color-mix(in srgb, ${t.primary} 16%, transparent);--accent-foreground:${t.primary};}`
    : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <AppearanceSync theme={me?.theme} />
      {/* pb-28 abre espaço para a dock flutuante; o padding lateral fica em
          cada tela (o cabeçalho é sticky e sangra até a borda). */}
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav dock={me?.dockItems} />
    </div>
  );
}
