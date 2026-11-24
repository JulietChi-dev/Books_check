import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/guard";
import { getBooking } from "@/lib/db";
import {
  formatDisplayDate,
  formatUTCDate,
  formatMoneyDisplay,
  calculateBalance,
  countNights,
  parseDecimalToCents,
} from "@/lib/money-and-dates";
import { AppHeader } from "@/components/AppHeader";
import { BookingDetailsActions } from "./BookingDetailsActions";

interface BookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Formats a Date object in the company's time zone for display.
 */
function formatTimestamp(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return date.toISOString().replace("T", " ").substring(0, 19);
  }
}

interface AuditChanges {
  amountPaid?: string | { from?: string; to?: string };
  totalPrice?: string | { from?: string; to?: string };
  checkIn?: string;
  checkOut?: string;
  apartmentId?: string;
  status?: string;
}

/**
 * Formats audit history change details (PRD FR-62, FR-69)
 * Example: "Amount paid: 50,000.00 to 80,000.00"
 */
function formatHistoryChange(
  event: { kind: string; changes: unknown },
  currency: string
): string {
  if (event.kind === "CREATED") {
    return "Booking created";
  }
  if (event.kind === "CANCELLED") {
    return "Status changed to Cancelled";
  }
  if (event.kind === "DELETED") {
    return "Booking deleted";
  }

  const changes = event.changes as AuditChanges | null;
  if (!changes || typeof changes !== "object") {
    return "Booking updated";
  }

  const parts: string[] = [];

  if (changes.amountPaid) {
    if (typeof changes.amountPaid === "object" && changes.amountPaid !== null) {
      parts.push(
        `Amount paid: ${formatMoneyDisplay(currency, String(changes.amountPaid.from))} to ${formatMoneyDisplay(currency, String(changes.amountPaid.to))}`
      );
    } else {
      parts.push(`Amount paid: ${formatMoneyDisplay(currency, String(changes.amountPaid))}`);
    }
  }

  if (changes.totalPrice) {
    if (typeof changes.totalPrice === "object" && changes.totalPrice !== null) {
      parts.push(
        `Total price: ${formatMoneyDisplay(currency, String(changes.totalPrice.from))} to ${formatMoneyDisplay(currency, String(changes.totalPrice.to))}`
      );
    } else {
      parts.push(`Total price: ${formatMoneyDisplay(currency, String(changes.totalPrice))}`);
    }
  }

  if (changes.checkIn || changes.checkOut) {
    parts.push("Dates changed");
  }

  if (changes.apartmentId) {
    parts.push("Apartment changed");
  }

  if (changes.status) {
    parts.push(`Status changed to ${changes.status}`);
  }

  return parts.length > 0 ? parts.join("; ") : "Booking updated";
}

/**
 * Booking Details Page (PRD 6.8, FR-62 to FR-69)
 * Server Component scoped strictly by companyId (FR-87, FR-88).
 */
export default async function BookingDetailPage({ params }: BookingPageProps) {
  const { id } = await params;
  const auth = await requireSession();
  const companyId = auth.user.companyId;

  if (!companyId) {
    redirect("/register-company");
  }

  const booking = await getBooking(id, companyId);
  if (!booking) {
    notFound();
  }

  const currency = booking.company.currency;
  const timeZone = booking.company.timeZone;

  const checkInStr = formatUTCDate(booking.checkIn);
  const checkOutStr = formatUTCDate(booking.checkOut);
  const nights = countNights(checkInStr, checkOutStr);

  const totalPriceStr = booking.totalPrice.toString();
  const amountPaidStr = booking.amountPaid.toString();
  const balanceStr =
    booking.status === "CANCELLED"
      ? "n/a"
      : calculateBalance(totalPriceStr, amountPaidStr);

  const isCancelled = booking.status === "CANCELLED";
  const paidCents = parseDecimalToCents(amountPaidStr);
  const canDelete = paidCents === 0n;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Top Header */}
      <AppHeader
        companyName={booking.company.name}
        userName={auth.user.fullName}
        currency={currency}
        timeZone={timeZone}
        currentTab="bookings"
      />

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Title and Status Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-[#182230]">
                Booking: {booking.guestName}
              </h1>
              {isCancelled ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Cancelled
                </span>
              ) : balanceStr === "0.00" ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Active (Paid)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                  Active (Owes {formatMoneyDisplay(currency, balanceStr)})
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Apartment: <span className="font-semibold text-slate-800">{booking.apartment.name}</span>
            </p>
          </div>

          <BookingDetailsActions
            bookingId={booking.id}
            status={booking.status}
            canDelete={canDelete}
          />
        </div>

        {/* Details Grid (FR-62) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="font-display text-base font-bold text-[#182230]">Booking Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Guest Name
              </p>
              <p className="text-sm font-semibold text-slate-900">{booking.guestName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Guest Phone
              </p>
              <p className="text-sm font-semibold text-slate-900">{booking.guestPhone}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Check-in Date
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatDisplayDate(checkInStr)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Check-out Date
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatDisplayDate(checkOutStr)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nights
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {nights} {nights === 1 ? "night" : "nights"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Apartment
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {booking.apartment.name} ({booking.apartment.roomCount}{" "}
                {booking.apartment.roomCount === 1 ? "room" : "rooms"})
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total stay rate
              </p>
              <p className="text-base font-bold text-slate-900 font-mono">
                {formatMoneyDisplay(currency, String(booking.totalPrice))}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Amount paid
              </p>
              <p className="text-base font-bold text-emerald-700 font-mono">
                {formatMoneyDisplay(currency, String(booking.amountPaid))}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 col-span-1 md:col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Balance owed
              </p>
              {isCancelled ? (
                <p className="text-base font-semibold text-slate-400">n/a (Cancelled)</p>
              ) : balanceStr === "0.00" ? (
                <p className="text-base font-bold text-emerald-700 font-mono">
                  {formatMoneyDisplay(currency, balanceStr)} (Paid ✓)
                </p>
              ) : (
                <p className="text-base font-bold text-amber-700 font-mono">
                  {formatMoneyDisplay(currency, balanceStr)}
                </p>
              )}
            </div>

            {booking.notes && (
              <div className="border-t border-slate-100 pt-4 col-span-1 md:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Audit History (PRD FR-62, FR-69) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="font-display text-base font-bold text-[#182230]">History of Changes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit trail of date, amount, and status updates (contains no guest personal data).
            </p>
          </div>
          <div className="p-6">
            {booking.events.length === 0 ? (
              <p className="text-sm text-slate-500">No change history recorded.</p>
            ) : (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {booking.events.map((event, eventIdx) => {
                    const isLast = eventIdx === booking.events.length - 1;
                    return (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {!isLast && (
                            <span
                              className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  event.kind === "CREATED"
                                    ? "bg-teal-100 text-[#0F766E]"
                                    : event.kind === "CANCELLED"
                                    ? "bg-amber-100 text-amber-700"
                                    : event.kind === "DELETED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                •
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {formatHistoryChange(event, currency)}
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-xs text-slate-400 font-mono">
                                {formatTimestamp(event.createdAt, timeZone)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
