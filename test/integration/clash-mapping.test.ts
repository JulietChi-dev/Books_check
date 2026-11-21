import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma, mapPrismaClashError } from "../../lib/db";

/**
 * Integration Test: Database Clash Error Mapping (PRD 8.6, 8.10)
 *
 * Proves that when PostgreSQL exclusion constraint 23P01 fires,
 * the application intercepts it and formats the exact FR-56 message:
 * "Apartment X is already booked from DATE to DATE (Guest NAME)."
 *
 * NOTE: This test requires a running database.
 */
describe("Database Clash Error Mapping (Postgres 23P01 -> FR-56)", () => {
  const companyId = "test-comp-clash-map";
  const apartmentId = "test-apt-clash-map";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: "Clash Mapping Hotel",
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
        name: "Apartment A",
        roomCount: 1,
      },
    });

    // Create existing booking: 10 Dec to 14 Dec
    await prisma.booking.create({
      data: {
        id: "existing-clash-booking-1",
        companyId,
        apartmentId,
        guestName: "Alice Wonderland",
        guestPhone: "+2348011112222",
        checkIn: new Date("2026-12-10T00:00:00.000Z"),
        checkOut: new Date("2026-12-14T00:00:00.000Z"),
        totalPrice: 200000.0,
        amountPaid: 50000.0,
        status: "ACTIVE",
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.booking.deleteMany({ where: { companyId } });
      await prisma.apartment.deleteMany({ where: { companyId } });
      await prisma.company.deleteMany({ where: { id: companyId } });
    } catch {
      // Ignore cleanup error if DB is unreachable
    }
  });

  it("intercepts constraint violation and maps to exact FR-56 error message", async () => {
    const overlappingCheckIn = new Date("2026-12-12T00:00:00.000Z");
    const overlappingCheckOut = new Date("2026-12-15T00:00:00.000Z");

    let thrownError: unknown = null;
    try {
      // Attempting to bypass application pre-check to trigger database exclusion constraint directly
      await prisma.booking.create({
        data: {
          companyId,
          apartmentId,
          guestName: "Bob Builder",
          guestPhone: "+2348033334444",
          checkIn: overlappingCheckIn,
          checkOut: overlappingCheckOut,
          totalPrice: 150000.0,
          amountPaid: 0.0,
          status: "ACTIVE",
        },
      });
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).not.toBeNull();

    const formattedMessage = await mapPrismaClashError(
      thrownError,
      companyId,
      apartmentId,
      overlappingCheckIn,
      overlappingCheckOut
    );

    // Exact FR-56 format: "Apartment X is already booked from DATE to DATE (Guest NAME)."
    expect(formattedMessage).toBe(
      "Apartment Apartment A is already booked from Thu, 10 Dec 2026 to Mon, 14 Dec 2026 (Guest Alice Wonderland)."
    );
  });
});
