import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { getMonthCalendar } from "@/lib/db";
import { getCompanyToday, parseUTCDate } from "@/lib/money-and-dates";

/** Shape returned by this route and used by CalendarShell for client refreshes. */
export interface CalendarData {
  apartments: Array<{
    id: string;
    name: string;
    bookings: Array<{
      id: string;
      guestName: string;
      checkIn: string;   // YYYY-MM-DD
      checkOut: string;  // YYYY-MM-DD
      totalPrice: string;
      amountPaid: string;
    }>;
  }>;
}

/**
 * GET /api/calendar?month=YYYY-MM
 *
 * Returns the same data as the server page but as JSON,
 * consumed by CalendarShell's 60s refresh timer (FR-39).
 * Session checked on the server — companyId comes from session, never the query string.
 */
export async function GET(req: NextRequest) {
  let auth: Awaited<ReturnType<typeof requireSession>>;
  try {
    auth = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = auth.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company" }, { status: 403 });
  }

  const timeZone = auth.company?.timeZone ?? "UTC";
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month") ?? "";

  // Missing or invalid month falls back to the current month in the company
  // time zone (FR-28). "Today" never comes from the device or server zone (FR-90).
  const todayStr = getCompanyToday(timeZone);
  let year = parseInt(todayStr.slice(0, 4), 10);
  let month = parseInt(todayStr.slice(5, 7), 10);

  const match = /^(\d{4})-(\d{2})$/.exec(monthParam);
  if (match) {
    const candidateYear = parseInt(match[1], 10);
    const candidateMonth = parseInt(match[2], 10);
    if (candidateMonth >= 1 && candidateMonth <= 12) {
      year = candidateYear;
      month = candidateMonth;
    }
  }

  const monthStart = parseUTCDate(
    `${year}-${month.toString().padStart(2, "0")}-01`
  );
  const nextM = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  const monthEnd = parseUTCDate(
    `${nextY}-${nextM.toString().padStart(2, "0")}-01`
  );

  const apartments = await getMonthCalendar(companyId, monthStart, monthEnd);

  const data: CalendarData = {
    apartments: apartments.map((apt) => ({
      id: apt.id,
      name: apt.name,
      bookings: apt.bookings.map((b) => ({
        id: b.id,
        guestName: b.guestName,
        checkIn: formatDate(b.checkIn),
        checkOut: formatDate(b.checkOut),
        totalPrice: String(b.totalPrice),
        amountPaid: String(b.amountPaid),
      })),
    })),
  };

  return NextResponse.json(data);
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
