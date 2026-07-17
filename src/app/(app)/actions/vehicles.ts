"use server";

import { z } from "zod";
import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { db } from "@/lib/db";
import {
  vehicles,
  odometerReadings,
  maintenanceItems,
} from "@/lib/schema";
import { requireSession } from "@/lib/session";

export type VehicleState = { error?: string; ok?: boolean } | undefined;

/** Confirma que o veículo é da casa do usuário. */
async function assertVehicleOwnership(householdId: number, vehicleId: number) {
  const rows = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.householdId, householdId)))
    .limit(1);
  return rows.length > 0;
}

/** Item -> veículo -> casa. Usado antes de mexer num item. */
async function assertItemOwnership(householdId: number, itemId: number) {
  const rows = await db
    .select({ vehicleId: maintenanceItems.vehicleId })
    .from(maintenanceItems)
    .innerJoin(vehicles, eq(maintenanceItems.vehicleId, vehicles.id))
    .where(
      and(eq(maintenanceItems.id, itemId), eq(vehicles.householdId, householdId)),
    )
    .limit(1);
  return rows[0]?.vehicleId ?? null;
}

const vehicleSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao veículo").max(80),
  plate: z.string().trim().max(10).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(2100).optional().or(z.nan()),
  fuel: z.string().trim().max(20).optional().or(z.literal("")),
  engine: z.string().trim().max(10).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().trim().max(40),
  reminderDays: z.coerce.number().int().min(0).max(365),
});

export async function saveVehicle(
  _prev: VehicleState,
  fd: FormData,
): Promise<VehicleState> {
  const { householdId } = await requireSession();
  const parsed = vehicleSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;
  const values = {
    name: d.name,
    plate: d.plate ? d.plate.toUpperCase() : null,
    year: Number.isNaN(d.year) || !d.year ? null : d.year,
    fuel: d.fuel || null,
    engine: d.engine || null,
    color: d.color,
    icon: d.icon,
    reminderDays: d.reminderDays,
  };

  const idRaw = fd.get("id");
  if (idRaw) {
    const id = Number(idRaw);
    if (!(await assertVehicleOwnership(householdId, id))) {
      return { error: "Veículo não encontrado" };
    }
    await db.update(vehicles).set(values).where(eq(vehicles.id, id));
    revalidatePath("/veiculos");
    revalidatePath(`/veiculos/${id}`);
    return { ok: true };
  }

  await db.insert(vehicles).values({ householdId, ...values });
  revalidatePath("/veiculos");
  return { ok: true };
}

export async function deleteVehicle(fd: FormData) {
  const { householdId } = await requireSession();
  const id = Number(fd.get("id"));
  if (!(await assertVehicleOwnership(householdId, id))) return;
  // Leituras e itens caem por cascade.
  await db.delete(vehicles).where(eq(vehicles.id, id));
  revalidatePath("/veiculos");
}

const readingSchema = z.object({
  vehicleId: z.coerce.number().int(),
  km: z.coerce.number().int().min(0).max(9_999_999),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function addReading(
  _prev: VehicleState,
  fd: FormData,
): Promise<VehicleState> {
  const { householdId, userId } = await requireSession();
  const parsed = readingSchema.safeParse({
    vehicleId: fd.get("vehicleId"),
    km: fd.get("km"),
    date: fd.get("date") || format(new Date(), "yyyy-MM-dd"),
  });
  if (!parsed.success) return { error: "Quilometragem inválida" };
  const { vehicleId, km, date } = parsed.data;

  if (!(await assertVehicleOwnership(householdId, vehicleId))) {
    return { error: "Veículo não encontrado" };
  }

  /* Odômetro não anda para trás: uma leitura menor que a maior já registrada
     é quase sempre erro de digitação, e aceitar quebraria a média de km/dia. */
  const [{ maxKm } = { maxKm: null }] = await db
    .select({ maxKm: max(odometerReadings.km) })
    .from(odometerReadings)
    .where(eq(odometerReadings.vehicleId, vehicleId));

  if (maxKm !== null && km < maxKm) {
    return {
      error: `A leitura precisa ser maior que a última (${maxKm.toLocaleString("pt-BR")} km).`,
    };
  }

  await db
    .insert(odometerReadings)
    .values({ vehicleId, km, date, createdBy: userId });

  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${vehicleId}`);
  revalidatePath("/");
  return { ok: true };
}

const itemSchema = z
  .object({
    vehicleId: z.coerce.number().int(),
    name: z.string().trim().min(1, "Dê um nome ao item").max(80),
    intervalKm: z.coerce.number().int().min(0).max(9_999_999).optional(),
    intervalMonths: z.coerce.number().int().min(0).max(600).optional(),
    icon: z.string().trim().max(40),
    lastDoneKm: z.coerce.number().int().min(0).max(9_999_999).optional(),
    lastDoneDate: z.string().optional(),
  })
  .refine((d) => (d.intervalKm ?? 0) > 0 || (d.intervalMonths ?? 0) > 0, {
    message: "Defina um intervalo em km, em meses, ou os dois",
  });

export async function saveMaintenanceItem(
  _prev: VehicleState,
  fd: FormData,
): Promise<VehicleState> {
  const { householdId } = await requireSession();
  const raw = Object.fromEntries(fd);
  const parsed = itemSchema.safeParse({
    ...raw,
    intervalKm: raw.intervalKm || undefined,
    intervalMonths: raw.intervalMonths || undefined,
    lastDoneKm: raw.lastDoneKm || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const d = parsed.data;
  if (!(await assertVehicleOwnership(householdId, d.vehicleId))) {
    return { error: "Veículo não encontrado" };
  }

  const values = {
    name: d.name,
    intervalKm: d.intervalKm && d.intervalKm > 0 ? d.intervalKm : null,
    intervalMonths:
      d.intervalMonths && d.intervalMonths > 0 ? d.intervalMonths : null,
    icon: d.icon,
    lastDoneKm: d.lastDoneKm ?? null,
    lastDoneDate: d.lastDoneDate || null,
  };

  const idRaw = fd.get("id");
  if (idRaw) {
    const id = Number(idRaw);
    if (!(await assertItemOwnership(householdId, id))) {
      return { error: "Item não encontrado" };
    }
    await db.update(maintenanceItems).set(values).where(eq(maintenanceItems.id, id));
  } else {
    await db
      .insert(maintenanceItems)
      .values({ vehicleId: d.vehicleId, ...values });
  }

  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${d.vehicleId}`);
  return { ok: true };
}

/** Zera o item: passa a contar a partir do km/data informados. */
export async function markItemDone(fd: FormData) {
  const { householdId } = await requireSession();
  const id = Number(fd.get("id"));
  const vehicleId = await assertItemOwnership(householdId, id);
  if (!vehicleId) return;

  const km = Number(fd.get("km"));
  await db
    .update(maintenanceItems)
    .set({
      lastDoneKm: Number.isFinite(km) && km > 0 ? km : null,
      lastDoneDate: format(new Date(), "yyyy-MM-dd"),
    })
    .where(eq(maintenanceItems.id, id));

  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${vehicleId}`);
  revalidatePath("/");
}

export async function deleteMaintenanceItem(fd: FormData) {
  const { householdId } = await requireSession();
  const id = Number(fd.get("id"));
  const vehicleId = await assertItemOwnership(householdId, id);
  if (!vehicleId) return;
  await db.delete(maintenanceItems).where(eq(maintenanceItems.id, id));
  revalidatePath(`/veiculos/${vehicleId}`);
}
