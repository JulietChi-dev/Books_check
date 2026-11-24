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
 * Architectural App Header (Matching BooksCheck Design System)
 * - Dark Charcoal-Slate (#182230) with Emerald-400 brand accent
 * - Desktop: seamless single/double row with logo, company, nav pills, user details, and logout
 * - Mobile: two clean rows with brand logo + company on top, and horizontal scrollable nav pills below
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row: Brand + Company + User info + Logout */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F766E] transition-colors">
              <svg
                className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="3" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 15.5l2 2 4.5-4.5" />
              </svg>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display font-bold text-base sm:text-lg tracking-tight text-emerald-400 group-hover:text-emerald-300 flex-shrink-0 transition-colors">
                BooksCheck
              </span>
              <span className="text-slate-600 flex-shrink-0">|</span>
              <span className="text-xs sm:text-sm font-medium text-slate-200 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                {companyName}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {userName && (
              <div className="text-right hidden md:block text-xs text-slate-400">
                <div className="font-semibold text-white">{userName}</div>
                {currency && timeZone && (
                  <div className="text-[11px] font-mono text-slate-400">
                    {currency} · {timeZone}
                  </div>
                )}
              </div>
            )}
            <form action={logOutAction}>
              <button
                type="submit"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {/* Navigation row: Scrollable horizontally on small screens */}
        <div className="flex items-center gap-1 sm:gap-2 pb-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 text-xs sm:text-[13px]">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === "calendar"
                ? "bg-white text-slate-900 font-bold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/bookings"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === "bookings"
                ? "bg-white text-slate-900 font-bold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
            }`}
          >
            Bookings
          </Link>
          <Link
            href="/bookings/new"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === "new"
                ? "bg-[#0F766E] text-white font-bold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
            }`}
          >
            + New booking
          </Link>
          <Link
            href="/settings"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === "settings"
                ? "bg-white text-slate-900 font-bold shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
            }`}
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
