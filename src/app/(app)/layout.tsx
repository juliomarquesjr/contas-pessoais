import { requireSession } from "@/lib/session";
import { BottomNav } from "@/components/bottom-nav";

// App autenticado: sempre renderiza por request (lê sessão/cookies).
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Garante sessão para todo o grupo (o proxy já protege, isto reforça)
  await requireSession();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
