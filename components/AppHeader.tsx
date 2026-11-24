import Link from "next/link";
import { logOutAction } from "@/app/(auth)/actions";

interface AppHeaderProps {
  companyName: string;
  userName?: string;
  currency?: string;
  timeZone?: string;
  currentTab?: "calendar" | "bookings" | "new" | "settings";
}

/**
 * Architectural App Header (Matching BooksCheck Exact Design)
 * - Single-row dark charcoal-slate (#182230) header
 * - Left: "BooksCheck" (emerald-400) | Company Name + inline navigation pill group
 * - Right: User Name + Currency/Timezone + [+ New booking] teal action button + Log out
 */
export function AppHeader({
  companyName,
  userName,
  currency,
  timeZone,
  currentTab,
}: AppHeaderProps) {
  return (
    <header className="bg-[#182230] text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand + Divider + Company + Nav pills */}
        <div className="flex items-center gap-4 lg:gap-5 min-w-0">
          <Link href="/" className="flex items-center gap-3 min-w-0 flex-shrink-0 group">
            <span className="font-display font-bold text-[17px] tracking-tight text-emerald-400 group-hover:text-emerald-300 transition-colors">
              BooksCheck
            </span>
            <span className="h-4 w-[1px] bg-slate-700 flex-shrink-0" />
            <span className="text-[13.5px] font-medium text-slate-200 truncate max-w-[130px] sm:max-w-[180px] md:max-w-xs">
              {companyName}
            </span>
          </Link>

          {/* Desktop Navigation pill group on the same line */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/70 text-[12px]">
            <Link
              href="/"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentTab === "calendar"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50 font-medium"
              }`}
            >
              Calendar
            </Link>
            <Link
              href="/bookings"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentTab === "bookings"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50 font-medium"
              }`}
            >
              Bookings
            </Link>
            <Link
              href="/bookings/new"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentTab === "new"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50 font-medium"
              }`}
            >
              + New booking
            </Link>
            <Link
              href="/settings"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentTab === "settings"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50 font-medium"
              }`}
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Right: User name + Currency/Timezone + New Booking button + Logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {userName && (
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-[12.5px] font-semibold text-white">{userName}</div>
              {currency && timeZone && (
                <div className="text-[10.5px] font-mono text-slate-400">
                  {currency} · {timeZone}
                </div>
              )}
            </div>
          )}

          {/* "+ New booking" button in header matching design */}
          <Link
            href="/bookings/new"
            className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 text-white text-[12px] font-semibold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            + New booking
          </Link>

          {/* Subtle Log out */}
          <form action={logOutAction} className="flex items-center">
            <button
              type="submit"
              title="Log out"
              className="p-1 sm:px-2.5 sm:py-1 text-[11.5px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Log out</span>
              <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav bar below on screens smaller than md */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar text-[12px]">
        <Link
          href="/"
          className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
            currentTab === "calendar"
              ? "bg-white text-slate-900 font-semibold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Calendar
        </Link>
        <Link
          href="/bookings"
          className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
            currentTab === "bookings"
              ? "bg-white text-slate-900 font-semibold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Bookings
        </Link>
        <Link
          href="/bookings/new"
          className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
            currentTab === "new"
              ? "bg-white text-slate-900 font-semibold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          + New booking
        </Link>
        <Link
          href="/settings"
          className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
            currentTab === "settings"
              ? "bg-white text-slate-900 font-semibold"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
