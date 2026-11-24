import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";
import { getMonthCalendar } from "@/lib/db";
import { parseUTCDate, getCompanyToday } from "@/lib/money-and-dates";
import { CalendarShell } from "@/components/calendar/CalendarShell";
import { UnverifiedEmailBanner } from "@/components/UnverifiedEmailBanner";
import { AppHeader } from "@/components/AppHeader";
import { WelcomePage } from "@/components/WelcomePage";
import type { CalendarData } from "@/app/api/calendar/route";

interface HomeProps {
  searchParams: Promise<{
    month?: string;
    saved?: string;
  }>;
}

/**
 * Home — Month Calendar (PRD 6.5, FR-28 to FR-41, FR-87)
 *
 * Server component: validates session, resolves month, queries DB in one
 * round-trip via getMonthCalendar, then passes serialisable data to the
 * CalendarShell client component.
 */
export default async function Home({ searchParams }: HomeProps) {
  const auth = await getCurrentUser();

  if (!auth) return <WelcomePage />;
  if (!auth.user.companyId) redirect("/register-company");

  const { month: monthParam, saved } = await searchParams;

  // Resolve month — invalid param falls back to current month (Decision: Option A)
  const timeZone = auth.company?.timeZone ?? "UTC";
  const currency = auth.company?.currency ?? "NGN";
  const companyId = auth.user.companyId;

  let year: number;
  let month: number;

  const match = monthParam ? /^(\d{4})-(\d{2})$/.exec(monthParam) : null;
  if (match) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
    if (month < 1 || month > 12) {
      // Fall back to current month
      const todayStr = getCompanyToday(timeZone);
      year = parseInt(todayStr.slice(0, 4), 10);
      month = parseInt(todayStr.slice(5, 7), 10);
    }
  } else {
    const todayStr = getCompanyToday(timeZone);
    year = parseInt(todayStr.slice(0, 4), 10);
    month = parseInt(todayStr.slice(5, 7), 10);
  }

  const monthStart = parseUTCDate(
    `${year}-${month.toString().padStart(2, "0")}-01`
  );
  const nextM = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  const monthEnd = parseUTCDate(
    `${nextY}-${nextM.toString().padStart(2, "0")}-01`
  );

  // Measure server query time for FR-37 performance target
  const t0 = Date.now();
  const apartments = await getMonthCalendar(companyId, monthStart, monthEnd);
  const serverMs = Date.now() - t0;

  // Serialise Decimal/Date fields to plain strings before passing to client
  const calendarData: CalendarData = {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Unverified email banner (FR-8) */}
      {!auth.user.emailVerifiedAt && (
        <UnverifiedEmailBanner email={auth.user.email} />
      )}

      {/* Page header with full app navigation */}
      <AppHeader
        companyName={auth.company?.name ?? "My Company"}
        userName={auth.user.fullName}
        currency={currency}
        timeZone={timeZone}
        currentTab="calendar"
      />

      {/* Calendar — fills the remaining viewport height */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <CalendarShell
          year={year}
          month={month}
          initialData={calendarData}
          currency={currency}
          timeZone={timeZone}
          serverMs={serverMs}
          savedMessage={saved === "true"}
        />
      </main>
    </div>
  );
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
