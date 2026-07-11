import { requireSession } from "@/lib/session";
import { getCategories, getMembers } from "@/lib/queries";
import { CategoryManager } from "@/components/category-manager";
import { InstallCard } from "@/components/install-card";
import { PageHeader } from "@/components/ui/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { logout } from "@/app/(app)/actions/auth";
import { LogOut, Users, Palette } from "lucide-react";

export default async function SettingsPage() {
  const { householdId, email } = await requireSession();
  const [categories, members] = await Promise.all([
    getCategories(householdId),
    getMembers(householdId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Conta" title="Ajustes" subtitle={email} />

      {/* Tema */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">Claro ou escuro</p>
            </div>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Instalar como app */}
      <InstallCard />

      {/* Membros */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Membros da casa</h2>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          Para adicionar alguém, peça para a pessoa criar uma conta usando a
          opção &quot;Entrar numa casa&quot; com o seu email.
        </p>
      </div>

      {/* Categorias */}
      <CategoryManager categories={categories} />

      {/* Logout */}
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3.5 font-medium text-expense transition hover:bg-expense-soft"
        >
          <LogOut className="h-5 w-5" />
          Sair da conta
        </button>
      </form>
    </div>
  );
}
