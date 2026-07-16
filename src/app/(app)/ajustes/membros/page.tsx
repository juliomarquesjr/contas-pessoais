import { requireSession } from "@/lib/session";
import { getMembers } from "@/lib/queries";
import { PageHeader, ScreenBody } from "@/components/ui/page-header";
import { MemberManager } from "@/components/member-manager";

export const dynamic = "force-dynamic";

export default async function MembrosPage() {
  const { userId, householdId } = await requireSession();
  const members = await getMembers(householdId);

  return (
    <>
      <PageHeader backHref="/ajustes" eyebrow="A Casa" title="Membros" />
      <ScreenBody>
        <MemberManager members={members} currentUserId={userId} />
      </ScreenBody>
    </>
  );
}
