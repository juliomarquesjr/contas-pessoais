import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getVehiclesWithState } from "@/lib/queries";
import { PageHeader, ScreenBody, SectionTitle } from "@/components/ui/page-header";
import { NewVehicleButton } from "@/components/vehicles/new-vehicle-form";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { evaluateItem, kmPerDayFrom } from "@/lib/maintenance";
import { Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const { householdId } = await requireSession();
  const list = await getVehiclesWithState(householdId);
  const today = new Date();

  // Resumo de todos os itens de todos os veículos.
  let ok = 0;
  let soon = 0;
  let overdue = 0;

  const cards = list.map(({ vehicle, items, readings }) => {
    const currentKm = readings[0]?.km ?? null;
    const kmPerDay = kmPerDayFrom(readings);
    const states = items.map((it) =>
      evaluateItem(it, currentKm, today, kmPerDay),
    );
    for (const s of states) {
      if (s.status === "overdue") overdue++;
      else if (s.status === "soon") soon++;
      else ok++;
    }
    return {
      vehicle,
      currentKm,
      lastDate: readings[0]?.date ?? null,
      counts: {
        soon: states.filter((s) => s.status === "soon").length,
        overdue: states.filter((s) => s.status === "overdue").length,
      },
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Manutenção"
        title="Veículos"
        action={<NewVehicleButton />}
      />

      <ScreenBody>
        {list.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            <StatTile label="Em dia" value={ok} sub="itens ok" tone="income" />
            <StatTile
              label="Atenção"
              value={soon}
              sub="vence logo"
              tone="pending"
            />
            <StatTile
              label="Vencido"
              value={overdue}
              sub="atrasado"
              tone="expense"
            />
          </div>
        )}

        {cards.length === 0 ? (
          <div className="mt-2 flex flex-col items-center rounded-[20px] border border-dashed border-border-strong bg-card px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent text-primary">
              <Car className="h-6 w-6" />
            </div>
            <p className="font-display font-semibold">Nenhum veículo ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre um veículo para controlar as manutenções por
              quilometragem e por tempo.
            </p>
          </div>
        ) : (
          <>
            <SectionTitle>Meus veículos</SectionTitle>
            <div className="space-y-3">
              {cards.map((c) => (
                <Link
                  key={c.vehicle.id}
                  href={`/veiculos/${c.vehicle.id}`}
                  className="animate-fade-up block"
                >
                  <VehicleCard {...c} />
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-3">
          <NewVehicleButton variant="dashed" />
        </div>
      </ScreenBody>
    </>
  );
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  tone: "income" | "pending" | "expense";
}) {
  const color = {
    income: "text-income",
    pending: "text-pending",
    expense: "text-expense",
  }[tone];

  return (
    <div className="rounded-[16px] border border-border bg-card p-3 shadow-card">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className={`snum mt-0.5 text-[28px] leading-none ${color}`}>
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-faint">{sub}</div>
    </div>
  );
}
