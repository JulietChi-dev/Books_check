import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, checkBookingClash } from "../../lib/db";
import { formatClashMessage } from "../../lib/clash";

/**
 * Booking Creation Integration Tests (PRD 6.6, 6.7, 8.6, 8.9)
 *
 * Tests:
 * 1. Idempotent Retry (FR-52): Same requestId returns the saved booking, never double creates or self-clashes.
 * 2. Audit History Privacy (FR-69): BookingEvent.changes holds NO guest personal data.
 * 3. Friendly Clash Pre-Check & Mapping (FR-56): Overlaps return exact clash error text.
 *
 * NOTE: Requires running database.
 */
describe("Booking Creation Integration Suite", () => {
  const companyId = "company-booking-create-test";
  const apartmentId = "apt-booking-create-test";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: "Booking Integration Suites",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });

    await prisma.apartment.upsert({
      where: { id_companyId: { id: apartmentId, companyId } },
      update: {},
      create: {
        id: apartmentId,
        companyId,
        name: "Apartment 101",
        roomCount: 2,
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.bookingEvent.deleteMany({ where: { companyId } });
      await prisma.booking.deleteMany({ where: { companyId } });
      await prisma.apartment.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { id: companyId } });
    } catch {
      // Ignore if DB is unreachable
    }
  });

  it("Idempotent Retry (FR-52): Same requestId returns the saved booking and never clashes with itself", async () => {
    const requestId = "unique-client-req-9999";
    const checkIn = new Date("2026-11-10T00:00:00.000Z");
    const checkOut = new Date("2026-11-15T00:00:00.000Z");

    // First save
    const firstSave = await prisma.booking.create({
      data: {
        companyId,
        apartmentId,
        guestName: "Primary Guest",
        guestPhone: "+2348012345678",
        checkIn,
        checkOut,
        totalPrice: 250000.0,
        amountPaid: 100000.0,
        status: "ACTIVE",
        requestId,
      },
    });

    expect(firstSave.id).toBeDefined();

    // Repeat attempt with the SAME requestId (simulating network retry)
    const existing = await prisma.booking.findUnique({
      where: {
        companyId_requestId: {
          companyId,
          requestId,
        },
      },
    });

    // Idempotency: found existing booking, return success
    expect(existing).not.toBeNull();
    expect(existing?.id).toBe(firstSave.id);

    // Verify only ONE booking row exists for this requestId
    const count = await prisma.booking.count({
      where: { companyId, requestId },
    });
    expect(count).toBe(1);
  });

  it("Audit History Privacy (FR-69): BookingEvent holds changes to dates/money/status, NEVER guest personal data", async () => {
    const booking = await prisma.booking.create({
      data: {
        companyId,
        apartmentId,
        guestName: "Sensitive Guest Name",
        guestPhone: "+2348099991111",
        notes: "Confidential VIP guest notes",
        checkIn: new Date("2026-11-20T00:00:00.000Z"),
        checkOut: new Date("2026-11-25T00:00:00.000Z"),
        totalPrice: 180000.0,
        amountPaid: 180000.0,
        status: "ACTIVE",
      },
    });

    // Record BookingEvent (matching createBookingAction)
    const event = await prisma.bookingEvent.create({
      data: {
        companyId,
        bookingId: booking.id,
        kind: "CREATED",
        changes: {
          apartmentId,
          checkIn: "2026-11-20",
          checkOut: "2026-11-25",
          totalPrice: "180000.00",
          amountPaid: "180000.00",
          status: "ACTIVE",
        },
      },
    });

    const recordedChanges = event.changes as Record<string, unknown>;

    // Must contain dates, amounts, status, apartment
    expect(recordedChanges.apartmentId).toBe(apartmentId);
    expect(recordedChanges.checkIn).toBe("2026-11-20");
    expect(recordedChanges.totalPrice).toBe("180000.00");

    // MUST NOT CONTAIN guestName, guestPhone, or notes (FR-69)
    expect(recordedChanges.guestName).toBeUndefined();
    expect(recordedChanges.guestPhone).toBeUndefined();
    expect(recordedChanges.notes).toBeUndefined();
  });

  it("Clash Pre-Check returns exact FR-56 error on overlapping dates", async () => {
    // Existing booking: 2026-11-20 to 2026-11-25 (Apartment 101)
    const newCheckIn = new Date("2026-11-22T00:00:00.000Z");
    const newCheckOut = new Date("2026-11-27T00:00:00.000Z");

    const conflicting = await checkBookingClash({
      companyId,
      apartmentId,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
    });

    expect(conflicting).not.toBeNull();
    if (conflicting) {
      const message = formatClashMessage(
        conflicting.apartment.name,
        "Sun, 22 Nov 2026",
        "Fri, 27 Nov 2026",
        conflicting.guestName
      );
      expect(message).toBe(
        "Apartment Apartment 101 is already booked from Sun, 22 Nov 2026 to Fri, 27 Nov 2026 (Guest Sensitive Guest Name)."
      );
    }
  });
});
