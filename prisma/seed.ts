/**
 * Seed: 50 apartments + ~300 bookings for performance testing (PRD FR-37)
 *
 * Run against local Postgres:
 *   npx tsx prisma/seed.ts
 *
 * The seed logic lives in lib/db.ts, the only module allowed to import Prisma
 * (PRD 8.5). The agent never runs this script; the person runs it.
 */

import { seedPerformanceData } from "../lib/db";

seedPerformanceData()
  .then(({ apartmentsCreated, bookingsCreated }) => {
    console.log(
      `Seed complete: ${apartmentsCreated} apartments, ${bookingsCreated} bookings.`
    );
    console.log("Open /?month=YYYY-MM to inspect the calendar.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
