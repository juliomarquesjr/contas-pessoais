import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Retorna a sessão autenticada com householdId, ou redireciona para /login.
 * Use em Server Components e Server Actions.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.householdId) {
    redirect("/login");
  }
  return {
    userId: Number(session.user.id),
    householdId: session.user.householdId,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}
