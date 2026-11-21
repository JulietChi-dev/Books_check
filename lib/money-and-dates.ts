/**
 * Exact Decimal Money & Calendar Date Handling (PRD FR-49, FR-89, FR-90, rules/dates-and-money.md)
 *
 * Rules:
 * 1. Money uses exact decimal arithmetic. Never floating point numbers.
 * 2. Money moves between server and browser as plain decimal text (digits, dot, up to 2 decimals).
 * 3. Balance = totalPrice minus amountPaid. Never stored.
 * 4. Booking dates are calendar dates with no time ("YYYY-MM-DD").
 * 5. Dates are constructed with Date.UTC, read with UTC getters.
 * 6. "Today" is computed in the company time zone using Intl.DateTimeFormat.
 */

// --- MONEY (Exact Decimal via Integer Cent Arithmetic) ---

export function parseDecimalToCents(amountStr: string): bigint {
  const trimmed = amountStr.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    throw new Error(`Invalid money format: "${amountStr}". Expected decimal text.`);
  }
  const parts = trimmed.split(".");
  const whole = BigInt(parts[0]);
  const decimals = (parts[1] || "").padEnd(2, "0");
  const fraction = BigInt(decimals);
  return whole * 100n + fraction;
}

export function formatCentsToDecimal(cents: bigint): string {
  const isNegative = cents < 0n;
  const absCents = isNegative ? -cents : cents;
  const whole = absCents / 100n;
  const fraction = absCents % 100n;
  const fractionStr = fraction.toString().padStart(2, "0");
  return `${isNegative ? "-" : ""}${whole.toString()}.${fractionStr}`;
}

/**
 * Calculates balance as exact decimal text: totalPrice - amountPaid.
 */
export function calculateBalance(totalPriceStr: string, amountPaidStr: string): string {
  const totalCents = parseDecimalToCents(totalPriceStr);
  const paidCents = parseDecimalToCents(amountPaidStr);
  const balanceCents = totalCents - paidCents;
  return formatCentsToDecimal(balanceCents);
}

/**
 * Formats decimal text for display with currency code and thousands separators.
 * Example: "NGN 150,000.00"
 */
export function formatMoneyDisplay(currency: string, decimalStr: string): string {
  const cents = parseDecimalToCents(decimalStr);
  const isNegative = cents < 0n;
  const absCents = isNegative ? -cents : cents;
  const whole = (absCents / 100n).toString();
  const fraction = (absCents % 100n).toString().padStart(2, "0");

  // Insert thousands separators into whole part without floating point
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${isNegative ? "-" : ""}${withCommas}.${fraction}`;
}

// --- DATES (UTC Calendar Dates) ---

/**
 * Parses YYYY-MM-DD into a UTC Date, validating calendar round-trip (e.g. rejects 2026-02-30).
 */
export function parseUTCDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date format: "${dateStr}". Expected YYYY-MM-DD.`);
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: "${dateStr}".`);
  }
  return date;
}

export function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Counts nights as the exact difference of UTC calendar days.
 */
export function countNights(checkInStr: string, checkOutStr: string): number {
  const checkIn = parseUTCDate(checkInStr);
  const checkOut = parseUTCDate(checkOutStr);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round(diffMs / dayMs);
}

/**
 * Returns "today" in the company time zone as YYYY-MM-DD.
 */
export function getCompanyToday(timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Formats a UTC date for display: "Wed, 24 Dec 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseUTCDate(dateStr);
  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
