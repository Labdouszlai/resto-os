"use server";

import { db } from "@/lib/db";
import { reservations, tables } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc, between } from "drizzle-orm";
import { reservationSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function checkTableAvailability(
  tableId: string,
  date: string,
  time: string,
  excludeReservationId?: string
) {
  try {
    const activeStatuses = ["pending", "confirmed", "seated"];

    const existingReservations = await db.query.reservations.findMany({
      where: and(
        eq(reservations.tableId, tableId),
        eq(reservations.date, date),
      ),
    });

    const activeReservations = existingReservations.filter(
      (r) => activeStatuses.includes(r.status) &&
             (!excludeReservationId || r.id !== excludeReservationId)
    );

    const requestedTime = timeToMinutes(time);

    const hasConflict = activeReservations.some((r) => {
      const existingTime = timeToMinutes(r.time);
      const existingEnd = existingTime + 120;
      const requestedEnd = requestedTime + 120;

      return existingTime < requestedEnd && existingEnd > requestedTime;
    });

    return { success: true, available: !hasConflict };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check availability";
    return { success: false, error: message, available: false };
  }
}

export async function createReservation(data: {
  customerId?: string;
  tableId?: string;
  branchId?: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}) {
  try {
    const { restaurant } = await requirePermission("reservations:create");
    const parsed = reservationSchema.parse(data);

    if (parsed.tableId) {
      const availability = await checkTableAvailability(parsed.tableId, parsed.date, parsed.time);
      if (!availability.success) {
        return { success: false, error: availability.error };
      }
      if (!availability.available) {
        return { success: false, error: "Table is not available at this time. There is a conflicting reservation." };
      }
    }

    const [reservation] = await db
      .insert(reservations)
      .values({
        restaurantId: restaurant.id,
        branchId: data.branchId || null,
        customerId: parsed.customerId || null,
        tableId: parsed.tableId || null,
        date: parsed.date,
        time: parsed.time,
        partySize: parsed.partySize,
        status: "pending",
        notes: parsed.notes || null,
      })
      .returning();

    if (parsed.tableId) {
      await db
        .update(tables)
        .set({ status: "reserved", updatedAt: new Date() })
        .where(eq(tables.id, parsed.tableId));
    }

    revalidatePath("/reservations");
    return { success: true, reservation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reservation";
    return { success: false, error: message };
  }
}

export async function updateReservation(
  reservationId: string,
  data: { customerId?: string; tableId?: string; date?: string; time?: string; partySize?: number; notes?: string; status?: string }
) {
  try {
    const { restaurant } = await requirePermission("reservations:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.tableId !== undefined) updateData.tableId = data.tableId;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.partySize !== undefined) updateData.partySize = data.partySize;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.tableId || data.date || data.time) {
      const existing = await db.query.reservations.findFirst({
        where: and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurant.id)),
      });
      if (!existing) throw new Error("Reservation not found");

      const checkTable = data.tableId || existing.tableId;
      const checkDate = data.date || existing.date;
      const checkTime = data.time || existing.time;
      if (checkTable && checkDate && checkTime) {
        const availability = await checkTableAvailability(checkTable, checkDate, checkTime, reservationId);
        if (!availability.success) {
          return { success: false, error: availability.error };
        }
        if (!availability.available) {
          return { success: false, error: "Table is not available at this time." };
        }
      }
    }

    const [updated] = await db
      .update(reservations)
      .set(updateData)
      .where(and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Reservation not found");

    revalidatePath("/reservations");
    return { success: true, reservation: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reservation";
    return { success: false, error: message };
  }
}

export async function cancelReservation(reservationId: string) {
  try {
    const { restaurant } = await requirePermission("reservations:cancel");

    const reservation = await db.query.reservations.findFirst({
      where: and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurant.id)),
    });

    if (!reservation) throw new Error("Reservation not found");

    await db
      .update(reservations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(reservations.id, reservationId));

    if (reservation.tableId) {
      await db
        .update(tables)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(tables.id, reservation.tableId));
    }

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel reservation";
    return { success: false, error: message };
  }
}

export async function seatReservation(reservationId: string) {
  try {
    const { restaurant } = await requirePermission("reservations:edit");

    const [updated] = await db
      .update(reservations)
      .set({ status: "seated", updatedAt: new Date() })
      .where(and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Reservation not found");

    if (updated.tableId) {
      await db
        .update(tables)
        .set({ status: "occupied", updatedAt: new Date() })
        .where(eq(tables.id, updated.tableId));
    }

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seat reservation";
    return { success: false, error: message };
  }
}

export async function completeReservation(reservationId: string) {
  try {
    const { restaurant } = await requirePermission("reservations:edit");

    const reservation = await db.query.reservations.findFirst({
      where: and(eq(reservations.id, reservationId), eq(reservations.restaurantId, restaurant.id)),
    });

    if (!reservation) throw new Error("Reservation not found");

    await db
      .update(reservations)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(reservations.id, reservationId));

    if (reservation.tableId) {
      await db
        .update(tables)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(tables.id, reservation.tableId));
    }

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete reservation";
    return { success: false, error: message };
  }
}

export async function getReservations(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  try {
    const { restaurant } = await requirePermission("reservations:view");

    const conditions = [eq(reservations.restaurantId, restaurant.id)];
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(reservations.status, filters.status));
    }
    if (filters?.dateFrom && filters?.dateTo) {
      conditions.push(between(reservations.date, filters.dateFrom, filters.dateTo));
    }

    const results = await db.query.reservations.findMany({
      where: and(...conditions),
      with: { customer: true, table: true },
      orderBy: [desc(reservations.date), reservations.time],
    });

    return { success: true, reservations: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reservations";
    return { success: false, error: message, reservations: [] };
  }
}
