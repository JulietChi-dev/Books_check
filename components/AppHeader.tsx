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
 * Mobile-responsive unified application header.
 * - Desktop: single seamless row with logo, company, nav links, user details, and logout.
 * - Mobile: two clean rows with logo + truncated company + logout on top, and scrollable nav pills on bottom.
 */
export function AppHeader({
  companyName,
  userName,
  currency,
  timeZone,
  currentTab,
}: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row: Brand + Company + User info + Logout */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-3">
          <Link href="/" className="flex items-center gap-2 min-w-0 group">
            <span className="font-bold text-lg sm:text-xl text-blue-600 tracking-tight group-hover:text-blue-700 flex-shrink-0">
              BooksCheck
            </span>
            <span className="text-gray-300 flex-shrink-0">|</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
              {companyName}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {userName && (
              <div className="text-right hidden md:block text-xs text-gray-500">
                <div className="font-medium text-gray-800">{userName}</div>
                {currency && timeZone && (
                  <div className="text-gray-400">{currency} · {timeZone}</div>
                )}
              </div>
            )}
            <form action={logOutAction}>
              <button
                type="submit"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {/* Navigation row: Scrollable horizontally on small screens */}
        <div className="flex items-center gap-1 sm:gap-2 pb-2.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === "calendar"
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/bookings"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === "bookings"
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Bookings
          </Link>
          <Link
            href="/bookings/new"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === "new"
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            + New booking
          </Link>
          <Link
            href="/settings"
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              currentTab === "settings"
                ? "text-blue-600 bg-blue-50 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
