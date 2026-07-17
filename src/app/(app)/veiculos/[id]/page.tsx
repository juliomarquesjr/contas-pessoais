import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getVehicle, getMaintenanceItems, getReadings } from "@/lib/queries";
import { PageHeader, ScreenBody, SectionTitle } from "@/components/ui/page-header";
import { KmSection } from "@/components/vehicles/km-section";
import { MaintenanceRow } from "@/components/vehicles/maintenance-row";
import { NewItemButton } from "@/components/vehicles/maintenance-item-form";
import { VehicleActions } from "@/components/vehicles/vehicle-actions";
import { evaluateItem, kmPerDayFrom } from "@/lib/maintenance";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { householdId } = await requireSession();
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isInteger(vehicleId)) notFound();

  const vehicle = await getVehicle(householdId, vehicleId);
  if (!vehicle) notFound();

  const [items, readings] = await Promise.all([
    getMaintenanceItems(vehicleId),
    getReadings(vehicleId),
  ]);

  const currentKm = readings[0]?.km ?? null;
  const kmPerDay = kmPerDayFrom(readings);
  const today = new Date();

  // Pior status primeiro: o que precisa de ação aparece no topo.
  const rank = { overdue: 0, soon: 1, ok: 2 } as const;
  const evaluated = items
    .map((item) => ({ item, state: evaluateItem(item, currentKm, today, kmPerDay) }))
    .sort((a, b) => rank[a.state.status] - rank[b.state.status]);

  const eyebrow = [vehicle.name, vehicle.plate].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader
        backHref="/veiculos"
        eyebrow={eyebrow}
        title="Manutenção"
        action={
          <div className="flex items-center gap-1.5">
            <VehicleActions vehicle={vehicle} />
            <NewItemButton vehicleId={vehicle.id} currentKm={currentKm} />
          </div>
        }
      />

      <ScreenBody className="space-y-4">
        <KmSection
          vehicle={vehicle}
          currentKm={currentKm}
          lastDate={readings[0]?.date ?? null}
          kmPerDay={kmPerDay}
          items={items}
        />

        {evaluated.length === 0 ? (
          <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border-strong bg-card px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <p className="font-display font-semibold">Nenhum item controlado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre o que você acompanha — troca de óleo, filtros, pneus — com
              intervalo em km, em meses, ou nos dois.
            </p>
          </div>
        ) : (
          <div>
            <SectionTitle
              action={
                <span className="text-[13px] text-muted-foreground">
                  {evaluated.length} {evaluated.length === 1 ? "item" : "itens"}
                </span>
              }
            >
              Itens controlados
            </SectionTitle>
            <div className="divide-y divide-border rounded-[18px] border border-border bg-card px-4.5 shadow-card">
              {evaluated.map(({ item, state }) => (
                <MaintenanceRow
                  key={item.id}
                  item={item}
                  state={state}
                  currentKm={currentKm}
                />
              ))}
            </div>
          </div>
        )}
      </ScreenBody>
    </>
  );
}
