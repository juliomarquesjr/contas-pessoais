import { requireSession } from "@/lib/session";
import { getCategories } from "@/lib/queries";
import { CategoryManager } from "@/components/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const { householdId } = await requireSession();
  const categories = await getCategories(householdId);

  // O CategoryManager traz o próprio cabeçalho: o botão "+ Nova" fica no
  // slot de ação e depende do estado do sheet.
  return <CategoryManager categories={categories} />;
}
