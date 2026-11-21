import { PrismaClient, Prisma } from "@prisma/client";
import { formatClashMessage } from "./clash";
import {
  formatDisplayDate,
  formatUTCDate,
  getCompanyToday,
  parseUTCDate,
  parseDecimalToCents,
  formatCentsToDecimal,
  countNights,
} from "./money-and-dates";

// Re-export Prisma namespace so other modules can use its types
// without importing directly from @prisma/client (PRD 8.5 point 3).
export type { Prisma };

/**
 * Data Access Module (PRD 8.5 point 3, rules/auth-and-security.md rule 57)
 *
 * This is the ONLY module permitted to import the Prisma client.
 * ESLint enforces this with the no-restricted-imports rule.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * PRD 8.9 Clash Pre-check query
 * Friendly pre-check before database write to construct conflict details.
 */
export async function checkBookingClash(params: {
  companyId: string;
  apartmentId: string;
  checkIn: Date;
  checkOut: Date;
  excludeBookingId?: string;
}) {
  return prisma.booking.findFirst({
    where: {
      companyId: params.companyId,
      apartmentId: params.apartmentId,
      status: "ACTIVE",
      id: params.excludeBookingId ? { not: params.excludeBookingId } : undefined,
      checkIn: { lt: params.checkOut },
      checkOut: { gt: params.checkIn },
    },
    include: {
      apartment: {
        select: {
          name: true,
        },
      },
    },
  });
}

/**
 * PRD 8.9 Month Calendar query — single query, no N+1 (FR-37, screens.md rule 12)
 * Returns apartments sorted by name, each with their overlapping active bookings.
 */
export async function getMonthCalendar(
  companyId: string,
  monthStart: Date,
  monthEnd: Date
) {
  return prisma.apartment.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: {
          status: "ACTIVE",
          checkIn: { lt: monthEnd },
          checkOut: { gt: monthStart },
        },
        orderBy: { checkIn: "asc" },
      },
    },
  });
}

/**
 * PRD 8.9 Edit with conflict check (FR-61)
 * Uses loadedUpdatedAt for optimistic concurrency control.
 */
export async function updateBookingWithConflictCheck(
  id: string,
  companyId: string,
  loadedUpdatedAt: Date,
  data: Prisma.BookingUpdateInput
) {
  const result = await prisma.booking.updateMany({
    where: {
      id,
      companyId,
      updatedAt: loadedUpdatedAt,
    },
    data,
  });

  return result.count > 0;
}

/**
 * Maps database clash exclusion constraint error (PostgreSQL code 23P01)
 * wrapped by Prisma to the exact FR-56 error message.
 */
export async function mapPrismaClashError(
  error: unknown,
  companyId: string,
  apartmentId: string,
  checkIn: Date,
  checkOut: Date
): Promise<string | null> {
  // Check if error is a Prisma known request error wrapping PostgreSQL 23P01 exclusion violation
  const isPostgres23P01 =
    error instanceof Error &&
    (error.message.includes("23P01") ||
      error.message.includes("booking_no_overlap") ||
      (error as { code?: string }).code === "P2010" ||
      (error as { code?: string }).code === "P2003");

  if (!isPostgres23P01) {
    return null;
  }

  // Look up conflicting booking to format the FR-56 message
  const conflicting = await checkBookingClash({
    companyId,
    apartmentId,
    checkIn,
    checkOut,
  });

  if (conflicting) {
    const aptName = conflicting.apartment.name;
    const checkInStr = formatDisplayDate(formatUTCDate(conflicting.checkIn));
    const checkOutStr = formatDisplayDate(formatUTCDate(conflicting.checkOut));
    return formatClashMessage(aptName, checkInStr, checkOutStr, conflicting.guestName);
  }

  return "Apartment is already booked for these dates.";
}

/**
 * PRD 6.9 — Bookings List (FR-70 to FR-79)
 *
 * Serialisable types returned to the server page (no Prisma/Decimal/Date leaking out).
 */
export interface BookingListItem {
  id: string;
  apartmentName: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  nights: number;
  totalPrice: string;  // decimal text
  amountPaid: string;  // decimal text
  balance: string;     // decimal text, or "n/a" for cancelled (FR-73)
  status: "ACTIVE" | "CANCELLED";
}

export interface ListBookingsSummary {
  activeCount: number;
  activeTotalPrice: string;
  activeTotalPaid: string;
  activeTotalBalance: string;
  heldOnCancelled: string; // sum of amountPaid on cancelled bookings in filter
}

export interface ListBookingsResult {
  bookings: BookingListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  summary: ListBookingsSummary;
}

/**
 * Bookings list query (FR-70 to FR-79, PRD 8.9).
 *
 * Loads ALL rows matching date+search into memory, then:
 *  - applies status/unpaid filters
 *  - sorts (checkIn desc default, or balance desc — FR-74)
 *  - paginates at 25 rows (FR-75)
 *  - computes summary across all filtered pages (FR-76)
 *
 * In-memory approach is safe at pilot scale (≤ a few hundred bookings).
 */
export async function listBookings(params: {
  companyId: string;
  year: number | null;    // null = all years
  month: number | null;   // null = all months (1–12 when set)
  status: "ACTIVE" | "CANCELLED" | "ALL";
  unpaidOnly: boolean;
  search: string;
  page: number;
  sortBy: "checkIn" | "balance";
}): Promise<ListBookingsResult> {
  const PAGE_SIZE = 25;

  // ── Date filter (FR-71: any night falls inside the period) ──────────────
  const dateWhere: Prisma.BookingWhereInput = {};
  if (params.year !== null && !isNaN(params.year)) {
    const y = params.year;
    if (params.month !== null && !isNaN(params.month)) {
      const m = params.month;
      // half-open: checkIn < first_of_next_month AND checkOut > first_of_this_month
      const firstDay = new Date(Date.UTC(y, m - 1, 1));
      const firstDayNext = new Date(Date.UTC(y, m, 1));
      dateWhere.checkIn = { lt: firstDayNext };
      dateWhere.checkOut = { gt: firstDay };
    } else {
      const yearStart = new Date(Date.UTC(y, 0, 1));
      const yearEnd = new Date(Date.UTC(y + 1, 0, 1));
      dateWhere.checkIn = { lt: yearEnd };
      dateWhere.checkOut = { gt: yearStart };
    }
  }

  // ── Search filter (FR-72: case-insensitive partial match) ───────────────
  const q = params.search.trim();
  const searchWhere: Prisma.BookingWhereInput = q.length > 0
    ? {
        OR: [
          { guestName: { contains: q, mode: "insensitive" } },
          { guestPhone: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  // ── Fetch ALL matching rows (no status or unpaid filter — applied later) ─
  const rawRows = await prisma.booking.findMany({
    where: { companyId: params.companyId, ...dateWhere, ...searchWhere },
    include: { apartment: { select: { name: true } } },
    orderBy: { checkIn: "desc" }, // base order; balance sort applied in memory
  });

  // ── Serialise to plain objects ───────────────────────────────────────────
  const toItem = (b: typeof rawRows[number]): BookingListItem => {
    const checkInStr  = formatUTCDate(b.checkIn);
    const checkOutStr = formatUTCDate(b.checkOut);
    const totalStr    = b.totalPrice.toString();
    const paidStr     = b.amountPaid.toString();
    const cancelled   = b.status === "CANCELLED";
    let balance = "n/a";
    if (!cancelled) {
      const diff = parseDecimalToCents(totalStr) - parseDecimalToCents(paidStr);
      balance = formatCentsToDecimal(diff);
    }
    return {
      id: b.id,
      apartmentName: b.apartment.name,
      guestName: b.guestName,
      guestPhone: b.guestPhone,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      nights: countNights(checkInStr, checkOutStr),
      totalPrice: totalStr,
      amountPaid: paidStr,
      balance,
      status: b.status,
    };
  };

  const allItems    = rawRows.map(toItem);
  const allActive   = allItems.filter(i => i.status === "ACTIVE");
  const allCancelled = allItems.filter(i => i.status === "CANCELLED");

  // ── Summary (FR-76): computed across the entire date+search result set ───
  let activeTotalCents = 0n, activePaidCents = 0n, heldCents = 0n;
  for (const item of allActive) {
    activeTotalCents += parseDecimalToCents(item.totalPrice);
    activePaidCents  += parseDecimalToCents(item.amountPaid);
  }
  for (const item of allCancelled) {
    heldCents += parseDecimalToCents(item.amountPaid);
  }
  const summary: ListBookingsSummary = {
    activeCount: allActive.length,
    activeTotalPrice:   formatCentsToDecimal(activeTotalCents),
    activeTotalPaid:    formatCentsToDecimal(activePaidCents),
    activeTotalBalance: formatCentsToDecimal(activeTotalCents - activePaidCents),
    heldOnCancelled:    formatCentsToDecimal(heldCents),
  };

  // ── Apply status filter ──────────────────────────────────────────────────
  let list: BookingListItem[];
  if (params.status === "ACTIVE")     list = allActive;
  else if (params.status === "CANCELLED") list = allCancelled;
  else                                list = allItems;

  // ── Apply unpaid filter (FR-70) ─────────────────────────────────────────
  if (params.unpaidOnly) {
    list = allActive.filter(item => parseDecimalToCents(item.balance) > 0n);
  }

  // ── Sort (FR-74) ────────────────────────────────────────────────────────
  if (params.sortBy === "balance") {
    list = [...list].sort((a, b_) => {
      const aB = a.balance === "n/a" ? 0n : parseDecimalToCents(a.balance);
      const bB = b_.balance === "n/a" ? 0n : parseDecimalToCents(b_.balance);
      return bB > aB ? 1 : bB < aB ? -1 : 0;
    });
  }

  // ── Paginate (FR-75: 25 rows) ────────────────────────────────────────────
  const totalCount  = list.length;
  const totalPages  = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.max(1, Math.min(params.page, totalPages));
  const bookings    = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return { bookings, totalCount, totalPages, currentPage, summary };
}

/**
 * Developer-only seed for the FR-37 calendar performance test. * It lives here because lib/db.ts is the only module allowed to import Prisma.
 * The agent never runs it; the person runs it against local Postgres.
 */
export async function seedPerformanceData() {
  const companyEmail = "seed-manager@example.com";
  const apartmentCount = 50;
  const targetBookings = 300;
  const guestNames = [
    "Adaeze Okafor", "Emeka Nwosu", "Fatima Aliyu", "Chinedu Eze",
    "Ngozi Obi", "Yusuf Musa", "Amaka Okonkwo", "Ibrahim Sule",
    "Chioma Nwachukwu", "Taiwo Adeyemi", "Blessing Igwe", "Abubakar Danladi",
  ];

  const previous = await prisma.user.findUnique({
    where: { email: companyEmail },
  });
  if (previous?.companyId) {
    await prisma.company.delete({ where: { id: previous.companyId } });
  } else if (previous) {
    await prisma.user.delete({ where: { id: previous.id } });
  }

  const company = await prisma.company.create({
    data: {
      name: "Seed Hotel",
      country: "NG",
      currency: "NGN",
      timeZone: "Africa/Lagos",
    },
  });

  await prisma.user.create({
    data: {
      email: companyEmail,
      fullName: "Seed Manager",
      passwordHash: "not-a-real-hash",
      emailVerifiedAt: new Date(),
      companyId: company.id,
    },
  });

  const apartments = [];
  for (let i = 0; i < apartmentCount; i++) {
    apartments.push(
      await prisma.apartment.create({
        data: {
          companyId: company.id,
          name: `Room ${(i + 1).toString().padStart(3, "0")}`,
          roomCount: 1,
        },
      })
    );
  }

  // Each apartment gets a non-overlapping run of stays with a one-day gap.
  const rangeStart = addDaysUTC(getCompanyToday(company.timeZone), -60);
  const lastStart = addDaysUTC(getCompanyToday(company.timeZone), 30);
  const bookingsPerApartment = Math.ceil(targetBookings / apartmentCount);
  let bookingsCreated = 0;

  for (const apartment of apartments) {
    let cursor = rangeStart;
    let created = 0;

    while (created < bookingsPerApartment && cursor <= lastStart) {
      const checkOut = addDaysUTC(cursor, Math.floor(Math.random() * 5) + 1);
      const totalCents = Math.floor(Math.random() * 500_000 + 50_000);
      const paidCents = Math.random() > 0.5 ? totalCents : Math.floor(totalCents / 2);

      await prisma.booking.create({
        data: {
          companyId: company.id,
          apartmentId: apartment.id,
          guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
          guestPhone: `+2348${Math.floor(Math.random() * 900_000_000 + 100_000_000)}`,
          checkIn: parseUTCDate(cursor),
          checkOut: parseUTCDate(checkOut),
          totalPrice: centsToDecimal(totalCents),
          amountPaid: centsToDecimal(paidCents),
          status: "ACTIVE",
          requestId: `seed-${apartment.id}-${created}`,
        },
      });

      bookingsCreated++;
      created++;
      cursor = addDaysUTC(checkOut, 1);
    }
  }

  return { apartmentsCreated: apartments.length, bookingsCreated };
}

export async function getBooking(id: string, companyId: string) {
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      apartment: {
        select: {
          id: true,
          name: true,
          roomCount: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          currency: true,
          timeZone: true,
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  const events = await prisma.bookingEvent.findMany({
    where: {
      bookingId: id,
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    ...booking,
    events,
  };
}

function addDaysUTC(dateStr: string, days: number): string {
  const date = parseUTCDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUTCDate(date);
}

function centsToDecimal(cents: number): string {
  return `${Math.floor(cents / 100)}.${(cents % 100).toString().padStart(2, "0")}`;
}
