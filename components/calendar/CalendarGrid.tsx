import { BookingBar } from "./BookingBar";
import { CellButton } from "./CellButton";
import {
  daysInMonth,
  isWeekend as isWeekendDay,
} from "@/lib/calendar-utils";
import { formatMoneyDisplay } from "@/lib/money-and-dates";

interface Booking {
  id: string;
  guestName: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  totalPrice: string;
  amountPaid: string;
}

interface ApartmentRow {
  id: string;
  name: string;
  bookings: Booking[];
}

interface CalendarGridProps {
  year: number;
  month: number; // 1-indexed
  apartments: ApartmentRow[];
  currency: string;
}

const DAY_ABBREVS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * Calendar grid (PRD FR-29, FR-30, FR-31, FR-32, FR-34, FR-40, FR-41)
 *
 * - Sticky apartment name column (left) and day header row (top).
 * - Weekend shading.
 * - Booking bars: green (paid) or amber (owes), guest name, ellipsis.
 * - Bars span mid-cell of check-in to mid-cell of check-out.
 * - CellButton handles click-by-night rule (FR-34).
 * - On screens < 1280 px the grid scrolls horizontally inside this container;
 *   the page body never scrolls sideways (FR-41).
 */
export function CalendarGrid({
  year,
  month,
  apartments,
  currency,
}: CalendarGridProps) {
  const totalDays = daysInMonth(year, month);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Column widths: name column is fixed 160 px; each day column is flexible.
  const NAME_COL_WIDTH = 160;
  const DAY_COL_MIN_WIDTH = 32; // px per day, widens as screen allows

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white overflow-auto"
      style={{ maxWidth: "100%" }}
    >
      {/* Min-width ensures the grid scrolls on narrow screens (FR-41) */}
      <div style={{ minWidth: NAME_COL_WIDTH + totalDays * DAY_COL_MIN_WIDTH }}>

        {/* ── HEADER ROW ── */}
        <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200">
          {/* Apartment name header */}
          <div
            className="flex-shrink-0 sticky left-0 z-30 bg-white border-r border-gray-200 flex items-center px-3 py-2"
            style={{ width: NAME_COL_WIDTH }}
          >
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Apartment
            </span>
          </div>

          {/* Day headers */}
          <div className="flex flex-1">
            {days.map((day) => {
              const weekend = isWeekendDay(year, month, day);
              const wd = DAY_ABBREVS[
                ((new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7)
              ];
              return (
                <div
                  key={day}
                  className={[
                    "flex-1 flex flex-col items-center justify-center border-r border-gray-100 py-1",
                    weekend ? "bg-gray-50" : "bg-white",
                  ].join(" ")}
                  style={{ minWidth: DAY_COL_MIN_WIDTH }}
                >
                  <span className="text-xs font-medium text-gray-600">{day}</span>
                  <span className="text-[10px] text-gray-400">{wd}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── APARTMENT ROWS ── */}
        {apartments.map((apt, rowIdx) => {
          // Map each booking to its month-relative day boundaries
          const mappedBookings = apt.bookings.map((b) => {
            const ciUTC = b.checkIn; // already YYYY-MM-DD
            const coUTC = b.checkOut;

            const ciYear = parseInt(ciUTC.slice(0, 4), 10);
            const ciMonth = parseInt(ciUTC.slice(5, 7), 10);
            const ciDay = parseInt(ciUTC.slice(8, 10), 10);

            const coYear = parseInt(coUTC.slice(0, 4), 10);
            const coMonth = parseInt(coUTC.slice(5, 7), 10);
            const coDay = parseInt(coUTC.slice(8, 10), 10);

            // Convert check-in to month-relative day (may be <=0 if before this month)
            const checkInDay =
              ciYear === year && ciMonth === month
                ? ciDay
                : ciYear < year || (ciYear === year && ciMonth < month)
                ? 0 // before this month
                : totalDays + 1; // after this month (shouldn't match query)

            // Convert check-out to month-relative day (may be > totalDays if after)
            const checkOutDay =
              coYear === year && coMonth === month
                ? coDay
                : coYear > year || (coYear === year && coMonth > month)
                ? totalDays + 1 // extends past this month
                : 0; // before this month (shouldn't match query)

            // Parse money as exact integer cents from decimal string (never float)
            function decimalToCents(s: string): bigint {
              const [whole, frac = ""] = s.split(".");
              return BigInt(whole) * 100n + BigInt(frac.padEnd(2, "0").slice(0, 2));
            }
            const totalCents = decimalToCents(b.totalPrice);
            const paidCents = decimalToCents(b.amountPaid);
            const balanceCents = totalCents - paidCents;
            const isPaid = balanceCents <= 0n;

            const wholeBalance = balanceCents / 100n;
            const fracBalance = (balanceCents % 100n)
              .toString()
              .padStart(2, "0");
            const balanceDecimal = `${wholeBalance}.${fracBalance}`;
            const owesLabel = isPaid
              ? ""
              : `Owes ${formatMoneyDisplay(currency, balanceDecimal)}`;

            return {
              id: b.id,
              guestName: b.guestName,
              variant: (isPaid ? "paid" : "owes") as "paid" | "owes",
              owesLabel,
              checkInDay,
              checkOutDay,
            };
          });

          return (
            <div
              key={apt.id}
              className={[
                "flex border-b border-gray-100",
                rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
              ].join(" ")}
              style={{ height: 44 }}
            >
              {/* Sticky apartment name */}
              <div
                className="flex-shrink-0 sticky left-0 z-10 border-r border-gray-200 flex items-center px-3"
                style={{
                  width: NAME_COL_WIDTH,
                  background: rowIdx % 2 === 0 ? "#fff" : "rgb(249 250 251 / 0.4)",
                }}
              >
                <span
                  className="text-sm text-gray-800 font-medium truncate"
                  title={apt.name}
                >
                  {apt.name}
                </span>
              </div>

              {/* Day cells + bars */}
              <div className="flex-1 relative flex">
                {/* Day cell backgrounds + click handlers */}
                {days.map((day) => {
                  const weekend = isWeekendDay(year, month, day);
                  // Build YYYY-MM-DD for this cell's check-in prefill
                  const mm = month.toString().padStart(2, "0");
                  const dd = day.toString().padStart(2, "0");
                  const dateStr = `${year}-${mm}-${dd}`;

                  return (
                    <div
                      key={day}
                      className={[
                        "flex-1 relative border-r border-gray-100",
                        weekend ? "bg-gray-50" : "",
                      ].join(" ")}
                      style={{ minWidth: DAY_COL_MIN_WIDTH }}
                    >
                      <CellButton
                        day={day}
                        apartmentId={apt.id}
                        checkInDateStr={dateStr}
                        bookings={mappedBookings}
                        isWeekend={weekend}
                      />
                    </div>
                  );
                })}

                {/* Booking bars — absolutely positioned over the whole row */}
                {mappedBookings.map((b) => (
                  <BookingBar
                    key={b.id}
                    id={b.id}
                    guestName={b.guestName}
                    variant={b.variant}
                    owesLabel={b.owesLabel}
                    checkInDay={b.checkInDay}
                    checkOutDay={b.checkOutDay}
                    totalDays={totalDays}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
