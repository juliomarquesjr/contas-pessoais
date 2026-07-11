import { requireSession } from "@/lib/session";
import { getCategories } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryManager } from "@/components/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const { householdId } = await requireSession();
  const categories = await getCategories(householdId);

  return (
    <div>
      <PageHeader
        backHref="/ajustes"
        eyebrow="Personalização"
        title="Categorias"
        subtitle="Organize suas entradas e saídas"
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
