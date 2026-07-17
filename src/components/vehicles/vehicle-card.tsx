import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/category-icon";
import { formatDateBR } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/schema";

/** "2021 · Flex · 1.0" — só as partes preenchidas. */
function specLine(v: Vehicle): string | null {
  const parts = [v.year, v.fuel, v.engine].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function VehicleCard({
  vehicle,
  currentKm,
  lastDate,
  counts,
}: {
  vehicle: Vehicle;
  currentKm: number | null;
  lastDate: string | null;
  counts: { soon: number; overdue: number };
}) {
  // O pior status manda na pílula.
  const badge =
    counts.overdue > 0
      ? {
          text: `${counts.overdue} ${counts.overdue === 1 ? "vencido" : "vencidos"}`,
          cls: "bg-expense-soft text-expense",
        }
      : counts.soon > 0
        ? {
            text: `${counts.soon} vence logo`,
            cls: "bg-pending-soft text-pending",
          }
        : { text: "Em dia", cls: "bg-income-soft text-income" };

  const spec = specLine(vehicle);

  return (
    <Card className="transition active:scale-[0.99]">
      <CardContent className="p-4">
        <div className="flex items-start gap-3.5">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
            style={{
              backgroundColor: `${vehicle.color}22`,
              color: vehicle.color,
            }}
          >
            <CategoryIcon name={vehicle.icon} className="h-6 w-6" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
                {vehicle.name}
              </span>
              {vehicle.plate && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground tnum">
                  {vehicle.plate}
                </span>
              )}
            </div>
            {spec && (
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {spec}
              </p>
            )}
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
              badge.cls,
            )}
          >
            {badge.text}
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5 border-t border-border pt-3">
          {currentKm === null ? (
            <span className="text-[13px] text-muted-foreground">
              Sem leitura de quilometragem
            </span>
          ) : (
            <>
              <span className="font-mono text-[15px] font-semibold tnum">
                {currentKm.toLocaleString("pt-BR")}
              </span>
              <span className="text-[13px] text-muted-foreground">km</span>
              {lastDate && (
                <span className="truncate text-[13px] text-faint">
                  · atualizado {formatDateBR(lastDate)}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
