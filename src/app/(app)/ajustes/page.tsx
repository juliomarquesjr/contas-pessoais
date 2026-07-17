import { requireSession } from "@/lib/session";
import {
  getCategories,
  getMembers,
  getHouseholdName,
  getCurrentUser,
} from "@/lib/queries";
import { InstallCard } from "@/components/install-card";
import { ProfileCard } from "@/components/profile-card";
import { AppearanceRow } from "@/components/appearance-row";
import { DockRow } from "@/components/dock-editor";
import { PageHeader, ScreenBody } from "@/components/ui/page-header";
import { SettingsGroup, SettingsRow } from "@/components/ui/settings";
import { logout } from "@/app/(app)/actions/auth";
import { LogOut, Users, Tags } from "lucide-react";

export default async function SettingsPage() {
  const { userId, householdId } = await requireSession();
  const [me, categories, members, householdName] = await Promise.all([
    getCurrentUser(userId),
    getCategories(householdId),
    getMembers(householdId),
    getHouseholdName(householdId),
  ]);

  if (!me) return null;

  return (
    <>
      <PageHeader eyebrow="Conta" title="Ajustes" />

      <ScreenBody className="space-y-6">
        <ProfileCard me={me} householdName={householdName} />

        <SettingsGroup title="A Casa">
          <SettingsRow
            href="/ajustes/membros"
            icon={<Users className="h-4 w-4" />}
            label="Membros da casa"
            description={`${members.length} ${
              members.length === 1 ? "pessoa" : "pessoas"
            }`}
          />
          <SettingsRow
            href="/ajustes/categorias"
            icon={<Tags className="h-4 w-4" />}
            label="Categorias"
            description={`${categories.length} categorias`}
          />
        </SettingsGroup>

        <SettingsGroup title="Preferências">
          <AppearanceRow accentColor={me.accentColor} theme={me.theme} />
          <DockRow dock={me.dockItems} />
        </SettingsGroup>

        <SettingsGroup title="Aplicativo">
          <InstallCard />
        </SettingsGroup>

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-[15px] border border-border bg-card px-4 py-3.5 font-semibold text-expense transition hover:bg-expense-soft active:scale-[0.99]"
          >
            <LogOut className="h-5 w-5" />
            Sair da conta
          </button>
        </form>

        <p className="text-center text-xs text-faint">
          Finanças da Casa · versão 1.0.0
        </p>
      </ScreenBody>
    </>
  );
}
