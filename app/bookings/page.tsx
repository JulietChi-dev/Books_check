import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/guard";
import { listBookings } from "@/lib/db";
import {
  formatMoneyDisplay,
  formatDisplayDate,
  getCompanyToday,
} from "@/lib/money-and-dates";
import { AppHeader } from "@/components/AppHeader";
import { BookingsFilters } from "./BookingsFilters";
import { BookingRow } from "./BookingRow";

interface BookingsPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    status?: string;
    payment?: string;
    q?: string;
    page?: string;
    sort?: string;
  }>;
}

/**
 * Bookings List Page (PRD 6.9, FR-70 to FR-79)
 * Server Component — session and company scope checked before rendering.
 */
export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const auth = await requireSession();
  const companyId = auth.user.companyId;

  if (!companyId) {
    redirect("/register-company");
  }

  const currency  = auth.company?.currency  ?? "NGN";
  const timeZone  = auth.company?.timeZone   ?? "UTC";
  const companyName = auth.company?.name     ?? "My Company";
  const todayStr  = getCompanyToday(timeZone);
  const currentYear = parseInt(todayStr.slice(0, 4), 10);

  // ── Parse search params ──────────────────────────────────────────────────
  const sp = await searchParams;

  const yearParam   = sp.year   ?? String(currentYear); // default: current year (FR-70)
  const monthParam  = sp.month  ?? "";
  const statusParam = sp.status ?? "ACTIVE";            // default: Active  (FR-70, A12)
  const payment     = sp.payment ?? "";
  const q           = sp.q      ?? "";
  const sortParam   = sp.sort   ?? "checkIn";
  const pageParam   = parseInt(sp.page ?? "1", 10);

  const rawYear = yearParam ? parseInt(yearParam, 10) : null;
  const year = rawYear !== null && !isNaN(rawYear) ? rawYear : null;

  const rawMonth = monthParam ? parseInt(monthParam, 10) : null;
  const month = rawMonth !== null && !isNaN(rawMonth) && rawMonth >= 1 && rawMonth <= 12 ? rawMonth : null;

  // "Unpaid only" forces status = ACTIVE (FR-70)
  const unpaidOnly = payment === "unpaid";
  const status =
    unpaidOnly
      ? "ACTIVE"
      : (["ACTIVE", "CANCELLED", "ALL"].includes(statusParam)
          ? (statusParam as "ACTIVE" | "CANCELLED" | "ALL")
          : "ACTIVE");
  const sortBy = sortParam === "balance" ? "balance" : "checkIn";

  // ── Query ────────────────────────────────────────────────────────────────
  const result = await listBookings({
    companyId,
    year,
    month,
    status,
    unpaidOnly,
    search: q,
    page: isNaN(pageParam) ? 1 : pageParam,
    sortBy,
  });

  const { bookings, totalCount, totalPages, currentPage, summary } = result;

  // ── URL param builders ───────────────────────────────────────────────────
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (yearParam)  params.set("year",    yearParam);
    if (monthParam) params.set("month",   monthParam);
    params.set("status",  statusParam);
    if (payment)    params.set("payment", payment);
    if (q)          params.set("q",       q);
    if (sortParam !== "checkIn") params.set("sort", sortParam);
    params.set("page", String(p));
    return `/bookings?${params.toString()}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <AppHeader
        companyName={companyName}
        userName={auth.user.fullName}
        currency={currency}
        timeZone={timeZone}
        currentTab="bookings"
      />

      <main className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Page title + New booking button (FR-79) */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <Link
            href="/bookings/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + New booking
          </Link>
        </div>

        {/* Filters (FR-70, FR-72, FR-74) */}
        <BookingsFilters
          year={yearParam}
          month={monthParam}
          status={statusParam}
          payment={payment}
          q={q}
          sort={sortParam}
          currentYear={currentYear}
        />

        {/* Summary bar (FR-76) */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Active bookings
            </p>
            <p className="font-semibold text-gray-900">
              {summary.activeCount} booking{summary.activeCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Total price
            </p>
            <p className="font-semibold text-gray-900">
              {formatMoneyDisplay(currency, summary.activeTotalPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Total paid
            </p>
            <p className="font-semibold text-emerald-700">
              {formatMoneyDisplay(currency, summary.activeTotalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Balance owed
            </p>
            <p className="font-semibold text-amber-700">
              {formatMoneyDisplay(currency, summary.activeTotalBalance)}
            </p>
          </div>
          <div className="col-span-2 md:col-span-4 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Held on cancelled bookings:</span>{" "}
              {formatMoneyDisplay(currency, summary.heldOnCancelled)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
              /* FR-78: Empty state */
              <div className="text-center py-16 text-gray-500">
                <p className="text-sm font-medium">No bookings match your filters.</p>
                <Link
                  href="/bookings/new"
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  Create a new booking
                </Link>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Check-out
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Nights
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* FR-77: Clicking a row opens the details view */}
                  {bookings.map((booking) => {
                    const isCancelled = booking.status === "CANCELLED";
                    const hasBalance  = !isCancelled && booking.balance !== "0.00";
                    return (
                      <BookingRow
                        key={booking.id}
                        id={booking.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {booking.apartmentName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {booking.guestName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                          {booking.guestPhone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {formatDisplayDate(booking.checkIn)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap hidden md:table-cell">
                          {formatDisplayDate(booking.checkOut)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-right hidden md:table-cell">
                          {booking.nights}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 hidden lg:table-cell">
                          {formatMoneyDisplay(currency, booking.totalPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-emerald-700 hidden lg:table-cell">
                          {formatMoneyDisplay(currency, booking.amountPaid)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {isCancelled ? (
                            <span className="text-gray-400">n/a</span>
                          ) : hasBalance ? (
                            <span className="text-amber-700">
                              {formatMoneyDisplay(currency, booking.balance)}
                            </span>
                          ) : (
                            <span className="text-emerald-600">✓ Paid</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {isCancelled ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          )}
                        </td>
                      </BookingRow>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {(currentPage - 1) * 25 + 1}–
              {Math.min(currentPage * 25, totalCount)} of {totalCount} bookings
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={pageUrl(currentPage - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  ← Previous
                </Link>
              )}
              <span className="px-3 py-1.5 text-gray-900 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={pageUrl(currentPage + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
