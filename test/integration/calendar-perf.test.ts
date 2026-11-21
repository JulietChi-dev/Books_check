/**
 * Integration performance test: calendar query must complete < 400 ms
 * for 50 apartments and ~300 bookings (PRD FR-37, screens.md rule 12).
 *
 * Run after the seed script has been applied:
 *   npx tsx prisma/seed.ts
 *   npx vitest run test/integration/calendar-perf.test.ts
 *
 * Requires DATABASE_URL pointing at the seeded local Postgres.
 */

import { describe, it, expect } from "vitest";
import { getMonthCalendar } from "@/lib/db";
import { parseUTCDate } from "@/lib/money-and-dates";
import { prisma } from "@/lib/db";

const SEED_EMAIL = "seed-manager@example.com";

describe("Calendar query performance (FR-37)", () => {
  it("completes under 400 ms for 50 apartments × 31-day month", async () => {
    // Look up the seeded company
    const user = await prisma.user.findUnique({ where: { email: SEED_EMAIL } });
    if (!user?.companyId) {
      throw new Error(
        "Seed data not found. Run: npx tsx prisma/seed.ts first."
      );
    }

    const companyId = user.companyId;

    // Use the current month
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");
    const monthStart = parseUTCDate(`${year}-${monthStr}-01`);
    const nextM = month === 12 ? 1 : month + 1;
    const nextY = month === 12 ? year + 1 : year;
    const monthEnd = parseUTCDate(
      `${nextY}-${nextM.toString().padStart(2, "0")}-01`
    );

    // Warm-up call
    await getMonthCalendar(companyId, monthStart, monthEnd);

    // Measured call
    const t0 = Date.now();
    const result = await getMonthCalendar(companyId, monthStart, monthEnd);
    const elapsed = Date.now() - t0;

    console.log(`\nCalendar query: ${elapsed} ms`);
    console.log(`Apartments returned: ${result.length}`);
    console.log(
      `Bookings returned: ${result.reduce((n, a) => n + a.bookings.length, 0)}`
    );
    console.log(
      `\nFR-37 target: server < 400 ms. Measured: ${elapsed} ms. ${
        elapsed < 400 ? "✓ PASS" : "✗ FAIL"
      }`
    );

    expect(elapsed).toBeLessThan(400);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("apartments are sorted by name", async () => {
    const user = await prisma.user.findUnique({ where: { email: SEED_EMAIL } });
    if (!user?.companyId) return; // skip if not seeded

    const monthStart = parseUTCDate("2026-11-01");
    const monthEnd = parseUTCDate("2026-12-01");

    const result = await getMonthCalendar(user.companyId, monthStart, monthEnd);
    const names = result.map((a) => a.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("cancelled bookings are excluded from calendar query", async () => {
    const user = await prisma.user.findUnique({ where: { email: SEED_EMAIL } });
    if (!user?.companyId) return;

    const monthStart = parseUTCDate("2026-11-01");
    const monthEnd = parseUTCDate("2026-12-01");

    const result = await getMonthCalendar(user.companyId, monthStart, monthEnd);
    for (const apt of result) {
      for (const b of apt.bookings) {
        // Prisma returns the status field; all must be ACTIVE (FR-36)
        expect((b as { status: string }).status).toBe("ACTIVE");
      }
    }
  });
});
