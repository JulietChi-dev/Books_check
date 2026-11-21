/**
 * Calendar layout utilities — pure functions, no Prisma, no I/O.
 * Used by CalendarGrid and by unit tests.
 */

/** Returns the number of days in the given UTC month (year/month 1-indexed). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Returns 0-indexed weekday (0=Mon…6=Sun) for the given UTC year/month/day. */
export function weekdayIndex(year: number, month: number, day: number): number {
  const d = new Date(Date.UTC(year, month - 1, day));
  // getUTCDay: 0=Sun, 1=Mon…6=Sat → shift so Mon=0
  return (d.getUTCDay() + 6) % 7;
}

/** Returns true for Saturday (5) or Sunday (6) using weekdayIndex. */
export function isWeekend(year: number, month: number, day: number): boolean {
  const idx = weekdayIndex(year, month, day);
  return idx === 5 || idx === 6;
}

export interface BarGeometry {
  /** Left offset as a percentage of the total grid width (all days). */
  leftPct: number;
  /** Width as a percentage of the total grid width. */
  widthPct: number;
}

/**
 * Computes bar left/width for a booking displayed in a given month.
 *
 * PRD FR-30: bar starts mid-cell on check-in and ends mid-cell on check-out.
 * When the booking extends outside the displayed month, the bar is clipped
 * to the month boundary (no half-cell overhang needed — bar fills to edge).
 *
 * @param checkInDay  1-indexed day of check-in in this month (or 0 if before).
 * @param checkOutDay 1-indexed day of check-out in this month (or dayCount+1 if after).
 * @param totalDays   Total days in the month.
 */
export function computeBarGeometry(
  checkInDay: number,
  checkOutDay: number,
  totalDays: number
): BarGeometry {
  const cellWidth = 100 / totalDays;

  // Clamp to month boundaries.
  const clampedIn = Math.max(1, checkInDay);
  const clampedOut = Math.min(totalDays + 1, checkOutDay);

  // Mid-cell: add 0.5 to get the center, then convert to percentage.
  // If the booking starts before this month, left starts at day-1 edge (no half offset).
  const leftMid =
    checkInDay >= 1
      ? (clampedIn - 1 + 0.5) * cellWidth
      : (clampedIn - 1) * cellWidth;

  // If the booking ends after this month, right goes to the last day's right edge.
  const rightMid =
    checkOutDay <= totalDays
      ? (clampedOut - 1 + 0.5) * cellWidth
      : clampedOut * cellWidth - cellWidth; // right edge of last cell

  const leftPct = Math.max(0, leftMid);
  const widthPct = Math.max(0, rightMid - leftMid);

  return { leftPct, widthPct };
}

/**
 * Given a click on `clickedDay` (1-indexed) in an apartment row, returns
 * the booking ID whose night covers that day, or null if free (FR-34).
 *
 * Night rule: a booking occupies nights from checkIn up to, NOT including checkOut.
 * In month-relative terms: a click on day D belongs to the booking if
 *   checkInDay <= D < checkOutDay (using 1-indexed month-relative days).
 */
export function findBookingForNight(
  clickedDay: number,
  bookings: Array<{
    id: string;
    checkInDay: number;  // 1-indexed within month (may be <=0 if before month)
    checkOutDay: number; // 1-indexed within month (may be > daysInMonth if after)
  }>
): string | null {
  for (const b of bookings) {
    if (b.checkInDay <= clickedDay && clickedDay < b.checkOutDay) {
      return b.id;
    }
  }
  return null;
}
