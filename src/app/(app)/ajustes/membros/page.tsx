import { requireSession } from "@/lib/session";
import { getMembers } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { MemberManager } from "@/components/member-manager";

export const dynamic = "force-dynamic";

export default async function MembrosPage() {
  const { userId, householdId } = await requireSession();
  const members = await getMembers(householdId);

  return (
    <div>
      <PageHeader
        backHref="/ajustes"
        eyebrow="Casa"
        title="Membros"
        subtitle="Quem tem acesso às finanças da casa"
      />
      <MemberManager members={members} currentUserId={userId} />
    </div>
  );
}
