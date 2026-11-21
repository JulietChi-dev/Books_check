import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/db";

/**
 * Integration Test: 10 Simultaneous Bookings (PRD 8.10)
 *
 * Fires 10 concurrent booking creation requests for the exact same apartment
 * and overlapping dates.
 * Proves that PostgreSQL exclusion constraint (booking_no_overlap) guarantees
 * exactly 1 success and 9 rejections.
 *
 * NOTE: This test requires a running database (Docker Postgres or Supabase).
 */
describe("Simultaneous Bookings Concurrency Test (PRD 8.10)", () => {
  const companyId = "test-comp-concurrency";
  const apartmentId = "test-apt-concurrency";

  beforeAll(async () => {
    // Attempt connection check; if DB is unavailable, test will fail as expected
    await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: "Concurrency Test Hotel",
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
        name: "Unit 101",
        roomCount: 1,
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

  it("fires 10 simultaneous bookings for the same dates and expects exactly 1 success", async () => {
    const checkIn = new Date("2026-11-01T00:00:00.000Z");
    const checkOut = new Date("2026-11-05T00:00:00.000Z");

    const attempts = Array.from({ length: 10 }, (_, i) =>
      prisma.booking.create({
        data: {
          companyId,
          apartmentId,
          guestName: `Guest ${i + 1}`,
          guestPhone: `+234800000000${i}`,
          checkIn,
          checkOut,
          totalPrice: 100000.0,
          amountPaid: 0.0,
          status: "ACTIVE",
          requestId: `req-concurrent-${i + 1}`,
        },
      })
    );

    const results = await Promise.allSettled(attempts);
    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(9);
  });
});
