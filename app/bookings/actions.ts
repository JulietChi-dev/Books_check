"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, checkBookingClash, mapPrismaClashError } from "@/lib/db";
import type { Prisma } from "@/lib/db";
import { createBookingSchema, updateBookingSchema } from "@/lib/validations/booking";
import { normalizePhone } from "@/lib/validations/company";
import { formatClashMessage } from "@/lib/clash";
import {
  parseUTCDate,
  formatUTCDate,
  formatDisplayDate,
  parseDecimalToCents,
} from "@/lib/money-and-dates";
import { requireSession } from "@/lib/auth/guard";
import { verifyOrigin } from "@/lib/auth/origin";

export interface CreateBookingResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  needsConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface UpdateBookingResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Create Booking Server Action (PRD 6.6, 6.7, 8.6, 8.9)
 *
 * Implements:
 * 1. Request ID idempotency check (FR-52)
 * 2. Application clash pre-check for friendly FR-56 error message
 * 3. Database-level exclusion constraint error mapping (23P01)
 * 4. Audit history record BookingEvent (FR-69) containing NO personal data
 * 5. Redirects to calendar on check-in month with confirmation
 */
export async function createBookingAction(
  _prevState: CreateBookingResult | null,
  formData: FormData
): Promise<CreateBookingResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await requireSession();
  const companyId = auth.user.companyId;

  if (!companyId) {
    redirect("/register-company");
  }

  const rawPhone = formData.get("guestPhone")?.toString() || "";
  let normalizedGuestPhone = "";
  try {
    normalizedGuestPhone = normalizePhone(rawPhone);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Phone number must contain between 7 and 15 digits.";
    return { success: false, error: msg, fieldErrors: { guestPhone: msg } };
  }

  const rawData = {
    apartmentId: formData.get("apartmentId")?.toString() || "",
    guestName: formData.get("guestName")?.toString() || "",
    guestPhone: rawPhone,
    checkIn: formData.get("checkIn")?.toString() || "",
    checkOut: formData.get("checkOut")?.toString() || "",
    totalPrice: formData.get("totalPrice")?.toString() || "0",
    amountPaid: formData.get("amountPaid")?.toString() || "0",
    notes: formData.get("notes")?.toString() || "",
    requestId: formData.get("requestId")?.toString() || "",
    entrySeconds: formData.get("entrySeconds") ? Number(formData.get("entrySeconds")) : undefined,
    confirmedUnusualDates: formData.get("confirmedUnusualDates") === "true",
  };

  const validation = createBookingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed.",
      fieldErrors,
    };
  }

  const data = validation.data;
  const checkInDate = parseUTCDate(data.checkIn);
  const checkOutDate = parseUTCDate(data.checkOut);

  // 1. Idempotency Check (FR-52, write-rules.md)
  // If a booking with this requestId already exists for this company, return it as success immediately.
  const existingByRequestId = await prisma.booking.findUnique({
    where: {
      companyId_requestId: {
        companyId,
        requestId: data.requestId,
      },
    },
  });

  if (existingByRequestId) {
    const monthStr = data.checkIn.substring(0, 7);
    redirect(`/?month=${monthStr}&saved=true`);
  }

  // 2. Application Clash Pre-Check (PRD 8.9, FR-56)
  const conflicting = await checkBookingClash({
    companyId,
    apartmentId: data.apartmentId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
  });

  if (conflicting) {
    const aptName = conflicting.apartment.name;
    // FR-56 names the dates of the booking that is already there.
    const clashMsg = formatClashMessage(
      aptName,
      formatDisplayDate(formatUTCDate(conflicting.checkIn)),
      formatDisplayDate(formatUTCDate(conflicting.checkOut)),
      conflicting.guestName
    );
    return { success: false, error: clashMsg };
  }

  // 3. Save in database transaction with BookingEvent (FR-69)
  try {
    await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          companyId,
          apartmentId: data.apartmentId,
          guestName: data.guestName,
          guestPhone: normalizedGuestPhone,
          notes: data.notes || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice: data.totalPrice,
          amountPaid: data.amountPaid,
          status: "ACTIVE",
          requestId: data.requestId,
          entrySeconds: data.entrySeconds ?? null,
        },
      });

      // Audit History Record (FR-69, write-rules.md Rule 2)
      // MUST NOT contain guestName, guestPhone, or notes!
      await tx.bookingEvent.create({
        data: {
          companyId,
          bookingId: createdBooking.id,
          kind: "CREATED",
          changes: {
            apartmentId: data.apartmentId,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            totalPrice: data.totalPrice,
            amountPaid: data.amountPaid,
            status: "ACTIVE",
          },
        },
      });
    });
  } catch (err: unknown) {
    // Intercept database-level exclusion constraint (booking_no_overlap 23P01)
    const mappedClash = await mapPrismaClashError(
      err,
      companyId,
      data.apartmentId,
      checkInDate,
      checkOutDate
    );

    if (mappedClash) {
      return { success: false, error: mappedClash };
    }

    console.error("Booking creation error:", err);
    return {
      success: false,
      error: "Could not save. Check your connection and try again.", // FR-53
    };
  }

  // 4. On success: redirect to calendar on check-in month (FR-51)
  const monthStr = data.checkIn.substring(0, 7);
  redirect(`/?month=${monthStr}&saved=true`);
}

/**
 * Cancel Booking Server Action (PRD FR-65, FR-68, FR-69)
 * - Changes status to CANCELLED and records cancelledAt.
 * - Leaves amountPaid intact (FR-68).
 * - Writes audit history record with no guest details (FR-69).
 */
export async function cancelBookingAction(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) {
    redirect("/register-company");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, companyId },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.status === "CANCELLED") {
    return { success: false, error: "Booking is already cancelled." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // FR-69: History records hold changes to dates, apartment, amounts, and status.
      // They never hold guest name, phone, or notes.
      await tx.bookingEvent.create({
        data: {
          companyId,
          bookingId,
          kind: "CANCELLED",
          changes: {
            status: "CANCELLED",
          },
        },
      });
    });
  } catch (err: unknown) {
    console.error("Cancel booking error:", err);
    return { success: false, error: "Could not cancel booking. Try again." };
  }

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/");
  return { success: true };
}

/**
 * Delete Booking Server Action (PRD FR-67, FR-69)
 * - Available only when amountPaid == 0.
 * - Removes guest name, phone, notes and booking row.
 * - Preserves audit history record with only booking ID, apartment, dates, and deletion time (FR-69).
 */
export async function deleteBookingAction(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) {
    redirect("/register-company");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, companyId },
  });

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  // FR-67: Delete is available from the details view only when amount paid is 0.
  // When amount paid is above 0, the button is disabled and shows:
  // "Cancel instead. Bookings with payments cannot be deleted."
  const paidCents = parseDecimalToCents(booking.amountPaid.toString());
  if (paidCents > 0n) {
    return {
      success: false,
      error: "Cancel instead. Bookings with payments cannot be deleted.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // FR-69: After a delete, only the booking ID, apartment, dates, and deletion time remain.
      // History records never hold guest name, phone, or notes.
      await tx.bookingEvent.create({
        data: {
          companyId,
          bookingId,
          kind: "DELETED",
          changes: {
            apartmentId: booking.apartmentId,
            checkIn: formatUTCDate(booking.checkIn),
            checkOut: formatUTCDate(booking.checkOut),
            deletedAt: new Date().toISOString(),
          },
        },
      });

      await tx.booking.delete({
        where: { id: bookingId },
      });
    });
  } catch (err: unknown) {
    console.error("Delete booking error:", err);
    return { success: false, error: "Could not delete booking. Try again." };
  }

  redirect("/?deleted=true");
}

/**
 * Update Booking Server Action (PRD FR-63, FR-58, FR-59, FR-61, FR-64, FR-69)
 *
 * Implements:
 * 1. Optimistic concurrency control via loadedUpdatedAt (FR-61)
 * 2. Clash pre-check excluding the booking being edited (FR-58)
 * 3. Database-level exclusion constraint mapping (FR-60, 8.6)
 * 4. Audit BookingEvent in same transaction with changed fields only (FR-64, FR-69)
 * 5. Cancelled bookings cannot be edited (FR-66)
 */
export async function updateBookingAction(
  _prevState: UpdateBookingResult | null,
  formData: FormData
): Promise<UpdateBookingResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) {
    redirect("/register-company");
  }

  const rawPhone = formData.get("guestPhone")?.toString() || "";
  let normalizedGuestPhone = "";
  try {
    normalizedGuestPhone = normalizePhone(rawPhone);
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Phone number must contain between 7 and 15 digits.";
    return { success: false, error: msg, fieldErrors: { guestPhone: msg } };
  }

  const rawData = {
    bookingId: formData.get("bookingId")?.toString() || "",
    loadedUpdatedAt: formData.get("loadedUpdatedAt")?.toString() || "",
    apartmentId: formData.get("apartmentId")?.toString() || "",
    guestName: formData.get("guestName")?.toString() || "",
    guestPhone: rawPhone,
    checkIn: formData.get("checkIn")?.toString() || "",
    checkOut: formData.get("checkOut")?.toString() || "",
    totalPrice: formData.get("totalPrice")?.toString() || "0",
    amountPaid: formData.get("amountPaid")?.toString() || "0",
    notes: formData.get("notes")?.toString() || "",
    confirmedUnusualDates: formData.get("confirmedUnusualDates") === "true",
  };

  const validation = updateBookingSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed.",
      fieldErrors,
    };
  }

  const data = validation.data;

  // Fetch current booking scoped by companyId (FR-88)
  const current = await prisma.booking.findFirst({
    where: { id: data.bookingId, companyId },
  });

  if (!current) {
    return { success: false, error: "Booking not found." };
  }

  // FR-66: Cancelled bookings cannot be edited.
  if (current.status === "CANCELLED") {
    return { success: false, error: "Cancelled bookings cannot be edited." };
  }

  const checkInDate = parseUTCDate(data.checkIn);
  const checkOutDate = parseUTCDate(data.checkOut);

  // 1. Clash pre-check excluding this booking (FR-58, FR-59)
  const conflicting = await checkBookingClash({
    companyId,
    apartmentId: data.apartmentId,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    excludeBookingId: data.bookingId,
  });

  if (conflicting) {
    const aptName = conflicting.apartment.name;
    const clashMsg = formatClashMessage(
      aptName,
      formatDisplayDate(formatUTCDate(conflicting.checkIn)),
      formatDisplayDate(formatUTCDate(conflicting.checkOut)),
      conflicting.guestName
    );
    return { success: false, error: clashMsg };
  }

  // Build audit changes record — only fields that actually changed (FR-64, FR-69)
  // Never include guestName, guestPhone, or notes.
  const changes: Record<string, unknown> = {};
  const currentCheckIn = formatUTCDate(current.checkIn);
  const currentCheckOut = formatUTCDate(current.checkOut);
  if (data.checkIn !== currentCheckIn) {
    changes.checkIn = { from: currentCheckIn, to: data.checkIn };
  }
  if (data.checkOut !== currentCheckOut) {
    changes.checkOut = { from: currentCheckOut, to: data.checkOut };
  }
  if (data.apartmentId !== current.apartmentId) {
    changes.apartmentId = { from: current.apartmentId, to: data.apartmentId };
  }

  const currentTotal = current.totalPrice.toString();
  if (data.totalPrice !== currentTotal) {
    changes.totalPrice = { from: currentTotal, to: data.totalPrice };
  }

  const currentPaid = current.amountPaid.toString();
  if (data.amountPaid !== currentPaid) {
    changes.amountPaid = { from: currentPaid, to: data.amountPaid };
  }

  // 2. Update with optimistic concurrency (FR-61)
  try {
    const loadedUpdatedAt = new Date(data.loadedUpdatedAt);

    await prisma.$transaction(async (tx) => {
      // updateMany returns count=0 if updatedAt no longer matches (FR-61)
      const result = await tx.booking.updateMany({
        where: {
          id: data.bookingId,
          companyId,
          updatedAt: loadedUpdatedAt,
        },
        data: {
          apartmentId: data.apartmentId,
          guestName: data.guestName,
          guestPhone: normalizedGuestPhone,
          notes: data.notes || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice: data.totalPrice,
          amountPaid: data.amountPaid,
        },
      });

      if (result.count === 0) {
        // Either not found or updatedAt changed — cannot distinguish safely
        throw new Error("CONFLICT");
      }

      // FR-69: Audit history — only write if there are actual changes
      if (Object.keys(changes).length > 0) {
        await tx.bookingEvent.create({
          data: {
            companyId,
            bookingId: data.bookingId,
            kind: "UPDATED",
            changes: changes as Prisma.InputJsonValue,
          },
        });
      }
    });
  } catch (err: unknown) {
    // FR-61: Edit conflict
    if (err instanceof Error && err.message === "CONFLICT") {
      return {
        success: false,
        error: "This booking changed. Reload and try again.",
      };
    }

    // Database-level clash constraint (23P01)
    const mappedClash = await mapPrismaClashError(
      err,
      companyId,
      data.apartmentId,
      checkInDate,
      checkOutDate
    );
    if (mappedClash) {
      return { success: false, error: mappedClash };
    }

    console.error("Update booking error:", err);
    return {
      success: false,
      error: "Could not save. Check your connection and try again.",
    };
  }

  revalidatePath(`/bookings/${data.bookingId}`);
  revalidatePath("/");
  redirect(`/bookings/${data.bookingId}`);
}
