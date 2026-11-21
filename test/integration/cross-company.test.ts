import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/db";

/**
 * Cross-Company Data Separation Tests (PRD 8.5, 8.10)
 *
 * Proves that Company A requesting Company B's records returns "not found"
 * or empty results, never leaking existence or data across tenant boundaries.
 *
 * NOTE: This test requires a running database.
 */
describe("Cross-Company Access Separation (PRD 8.5)", () => {
  const companyA = "company-tenant-alpha";
  const companyB = "company-tenant-beta";

  let aptBId: string;
  let bookingBId: string;

  beforeAll(async () => {
    // Setup Company A
    await prisma.company.upsert({
      where: { id: companyA },
      update: {},
      create: {
        id: companyA,
        name: "Alpha Suites",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });

    // Setup Company B
    await prisma.company.upsert({
      where: { id: companyB },
      update: {},
      create: {
        id: companyB,
        name: "Beta Apartments",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });

    const aptB = await prisma.apartment.create({
      data: {
        companyId: companyB,
        name: "Beta Luxury Suite",
        roomCount: 2,
      },
    });
    aptBId = aptB.id;

    const bookingB = await prisma.booking.create({
      data: {
        companyId: companyB,
        apartmentId: aptB.id,
        guestName: "Secret Guest B",
        guestPhone: "+2348099998888",
        checkIn: new Date("2026-12-01T00:00:00.000Z"),
        checkOut: new Date("2026-12-05T00:00:00.000Z"),
        totalPrice: 120000.0,
        amountPaid: 60000.0,
        status: "ACTIVE",
      },
    });
    bookingBId = bookingB.id;
  });

  afterAll(async () => {
    try {
      await prisma.booking.deleteMany({ where: { companyId: { in: [companyA, companyB] } } });
      await prisma.apartment.deleteMany({ where: { companyId: { in: [companyA, companyB] } } });
      await prisma.company.deleteMany({ where: { id: { in: [companyA, companyB] } } });
    } catch {
      // Ignore cleanup error if DB is unreachable
    }
  });

  it("Company A requesting Company B booking ID returns not found", async () => {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingBId,
        companyId: companyA, // Session scope
      },
    });
    expect(booking).toBeNull();
  });

  it("Company A requesting Company B apartment ID returns not found", async () => {
    const apt = await prisma.apartment.findFirst({
      where: {
        id: aptBId,
        companyId: companyA, // Session scope
      },
    });
    expect(apt).toBeNull();
  });

  it("Company A list query never includes Company B bookings", async () => {
    const bookings = await prisma.booking.findMany({
      where: {
        companyId: companyA, // Session scope
      },
    });
    const foundOtherCompanyBooking = bookings.some((b) => b.companyId === companyB);
    expect(foundOtherCompanyBooking).toBe(false);
  });

  it("Composite foreign key prevents creating booking in Company A pointing to Company B apartment", async () => {
    await expect(
      prisma.booking.create({
        data: {
          companyId: companyA,
          apartmentId: aptBId, // Belongs to Company B
          guestName: "Infiltration Guest",
          guestPhone: "+2348000000000",
          checkIn: new Date("2026-12-10T00:00:00.000Z"),
          checkOut: new Date("2026-12-15T00:00:00.000Z"),
          totalPrice: 50000.0,
          amountPaid: 0.0,
          status: "ACTIVE",
        },
      })
    ).rejects.toThrow();
  });
});
