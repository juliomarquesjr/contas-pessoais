import { requireSession } from "@/lib/session";
import {
  getCategories,
  getMembers,
  getHouseholdName,
  getCurrentUser,
} from "@/lib/queries";
import { CategoryManager } from "@/components/category-manager";
import { InstallCard } from "@/components/install-card";
import { ProfileCard } from "@/components/profile-card";
import { AppearanceRow } from "@/components/appearance-row";
import { MemberManager } from "@/components/member-manager";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsGroup } from "@/components/ui/settings";
import { logout } from "@/app/(app)/actions/auth";
import { LogOut } from "lucide-react";

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
    <div className="space-y-6 pb-2">
      <PageHeader
        eyebrow="Conta"
        title="Ajustes"
        subtitle="Gerencie sua conta e preferências"
      />

      <ProfileCard me={me} householdName={householdName} />

      <SettingsGroup title="Preferências">
        <AppearanceRow accentColor={me.accentColor} theme={me.theme} />
      </SettingsGroup>

      <MemberManager members={members} currentUserId={userId} />

      <CategoryManager categories={categories} />

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Aplicativo
        </h2>
        <InstallCard />
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 font-medium text-expense transition hover:bg-expense-soft"
        >
          <LogOut className="h-5 w-5" />
          Sair da conta
        </button>
      </form>

      <p className="pt-1 text-center text-xs text-muted-foreground">
        Finanças da Casa · versão 1.0.0
      </p>
    </div>
  );
}
