import React from "react";
import Link from "next/link";

/**
 * Public Welcome / Landing Page (Light Theme)
 * Full-size month calendar showcase with exact feature parity and comprehensive product information.
 */
export function WelcomePage() {
  // Generate 31 days for December 2026 (Dec 1 is Tuesday)
  const daysInDec = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayNames = ["Tu", "We", "Th", "Fr", "Sa", "Su", "Mo"]; // Dec 1, 2026 is Tuesday

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ── Top Navigation Bar ── */}
      <header className="border-b border-gray-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm text-white font-black text-lg sm:text-xl tracking-tight">
              B
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">
                BooksCheck
              </span>
              <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Hotel &amp; Serviced Apartments
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition transform active:scale-95"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 px-4 sm:px-6 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Zero Double-Bookings Guarantee · Built for Front-Desk Laptops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Never double-book an apartment again.
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
            The web app hotel and serviced apartment managers use on their company laptop to record stays,
            verify instant availability, and maintain exact financial clarity with zero math errors.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              Get Started — Register Company
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-xl shadow-xs transition text-center"
            >
              Sign In to Your Account
            </Link>
          </div>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-gray-500">
            <span className="flex items-center gap-1.5">✓ 1-Minute Setup</span>
            <span className="flex items-center gap-1.5">✓ Same-Day Turnovers</span>
            <span className="flex items-center gap-1.5">✓ Real-Time 60s Refresh</span>
            <span className="flex items-center gap-1.5">✓ Single Shared Account</span>
          </div>
        </div>

        {/* ── FULL-SIZE CALENDAR SHOWCASE ── */}
        <div className="mt-8 sm:mt-12 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-gray-200 overflow-hidden ring-1 ring-gray-900/5">
            {/* Top Browser Bar */}
            <div className="bg-gray-100/90 border-b border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-3 font-semibold text-gray-800 hidden sm:inline">
                  BooksCheck | Eko Suites &amp; Apartments
                </span>
                <span className="text-gray-400 hidden sm:inline">· NGN (₦) · Africa/Lagos</span>
              </div>
              <div className="bg-white px-3 py-1 rounded-md border border-gray-200 text-gray-500 font-mono text-[11px] hidden md:block">
                https://bookscheck.app/calendar
              </div>
              <div className="flex items-center gap-2 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero Double-Bookings Active</span>
              </div>
            </div>

            {/* App Nav Bar in Mockup */}
            <div className="px-6 py-2.5 bg-white border-b border-gray-200 flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="font-bold text-blue-600 text-base">BooksCheck</span>
                <nav className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md">
                    Calendar
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md">
                    Bookings
                  </span>
                  <span className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md">
                    Settings
                  </span>
                </nav>
              </div>
              <div className="text-xs text-gray-500 hidden sm:flex items-center gap-3">
                <span className="font-medium text-gray-700">Manager logged in</span>
                <span className="text-red-600 hover:underline">Log out</span>
              </div>
            </div>

            {/* Full Calendar Toolbar (Exact feature parity with PRD FR-33, FR-35, FR-39) */}
            <div className="p-4 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Prev / Next / Today */}
                <span className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer shadow-2xs">
                  ‹ Prev
                </span>
                <h2 className="text-base font-bold text-gray-900 min-w-[150px] text-center">
                  December 2026
                </h2>
                <span className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer shadow-2xs">
                  Next ›
                </span>
                <span className="px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-700 rounded bg-blue-50 cursor-pointer">
                  Today
                </span>

                {/* Go To Date Control (FR-35) */}
                <div className="hidden lg:flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-gray-500 font-medium">Go to date:</span>
                  <div className="px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 font-mono text-gray-600">
                    2026-12-16
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 cursor-pointer">
                    Go
                  </span>
                </div>
              </div>

              {/* Legend, Auto-refresh time, & New Booking button */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Legend (FR-31) */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-gray-500">Legend:</span>
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-3.5 h-3.5 rounded-sm bg-green-500 border border-green-600 flex-shrink-0" />
                    Paid ✓
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <span className="w-3.5 h-3.5 rounded-sm bg-amber-400 border border-amber-500 flex-shrink-0" />
                    Owes balance
                  </span>
                </div>

                {/* Auto-refresh timestamp (FR-39) */}
                <span className="text-xs text-gray-400 font-mono hidden md:inline">
                  Updated 14:32:05
                </span>

                {/* + New Booking Button (FR-33) */}
                <span className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1">
                  <span>+</span> New booking
                </span>
              </div>
            </div>

            {/* ── FULL-SIZE 31-DAY MONTH GRID (PRD FR-29, FR-30, FR-32, FR-41) ── */}
            <div className="overflow-x-auto bg-gray-100/50">
              <div style={{ minWidth: "1280px" }} className="bg-white">
                {/* Header Row: Days 1 to 31 */}
                <div className="flex border-b border-gray-200 bg-gray-50 text-[11px] font-medium text-gray-600 sticky top-0 z-20">
                  {/* Sticky Apartment Column Header */}
                  <div
                    className="w-48 flex-shrink-0 px-3.5 py-2.5 border-r border-gray-200 bg-gray-50 font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between"
                  >
                    <span>Apartment</span>
                    <span className="text-[10px] text-gray-400 font-normal">Rooms</span>
                  </div>

                  {/* Day Headers (1 to 31) */}
                  <div className="flex flex-1">
                    {daysInDec.map((day, idx) => {
                      const dayName = dayNames[idx % 7];
                      const isWeekend = dayName === "Sa" || dayName === "Su";
                      const isToday = day === 16;
                      return (
                        <div
                          key={day}
                          className={`flex-1 min-w-[34px] py-1.5 flex flex-col items-center justify-center border-r border-gray-200/60 ${
                            isToday
                              ? "bg-blue-100/90 text-blue-900 font-bold ring-1 ring-blue-500"
                              : isWeekend
                              ? "bg-gray-100/70 text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="text-[10px] uppercase font-semibold">{dayName}</span>
                          <span className="text-xs font-bold leading-none">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Apartment Row 1: Deluxe Suite 101 */}
                <div className="flex border-b border-gray-100 text-xs items-center relative hover:bg-blue-50/20 group h-14">
                  <div className="w-48 flex-shrink-0 px-3.5 py-2 border-r border-gray-200 bg-white font-semibold text-gray-900 flex items-center justify-between">
                    <div>
                      <span>Suite 101</span>
                      <span className="block text-[10px] font-normal text-gray-400">Ground floor</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">2</span>
                  </div>
                  <div className="flex flex-1 h-full relative">
                    {/* Background Day Cells */}
                    {daysInDec.map((day, idx) => (
                      <div
                        key={day}
                        className={`flex-1 min-w-[34px] h-full border-r border-gray-100/80 ${
                          day === 16 ? "bg-blue-50/40" : dayNames[idx % 7] === "Sa" || dayNames[idx % 7] === "Su" ? "bg-gray-50/50" : ""
                        }`}
                      />
                    ))}

                    {/* Booking Bar 1: Dec 2 to Dec 7 (Paid in Full) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "4.8%",
                        width: "16.1%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer hover:bg-green-600 transition"
                      title="Chinedu Eze · Check-in: Dec 2, Check-out: Dec 7 · NGN 150,000.00 (Paid in full)"
                    >
                      <span className="truncate">Chinedu Eze</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>

                    {/* Booking Bar 2: Dec 10 to Dec 16 (Same-day checkout on Dec 16) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "30.6%",
                        width: "19.3%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-amber-400 border border-amber-500 text-gray-900 rounded-l px-2 flex items-center justify-between text-[11px] font-semibold shadow-2xs z-10 cursor-pointer hover:bg-amber-500 transition"
                      title="Aisha Bello · Check-in: Dec 10, Check-out: Dec 16 · Balance: NGN 45,000.00"
                    >
                      <span className="truncate">Aisha Bello</span>
                      <span className="text-[10px] font-mono bg-amber-500/50 px-1 rounded ml-1">Bal: ₦45k</span>
                    </div>

                    {/* Same-Day Turnover Booking 3: Dec 16 to Dec 22 (Starts on same day Dec 16!) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        width: "19.3%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded-r px-2 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer hover:bg-green-600 transition"
                      title="Same-day turnover: Taiwo Adeyemi · Check-in: Dec 16, Check-out: Dec 22 · Paid"
                    >
                      <span className="truncate">Taiwo Adeyemi</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>

                    {/* Booking Bar 4: Dec 24 to Dec 29 (Christmas holiday stay) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "74.2%",
                        width: "16.1%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer hover:bg-green-600 transition"
                    >
                      <span className="truncate">Dr. Ibrahim Sule</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>
                  </div>
                </div>

                {/* Apartment Row 2: Executive Room 202 */}
                <div className="flex border-b border-gray-100 text-xs items-center relative hover:bg-blue-50/20 group h-14">
                  <div className="w-48 flex-shrink-0 px-3.5 py-2 border-r border-gray-200 bg-white font-semibold text-gray-900 flex items-center justify-between">
                    <div>
                      <span>Room 202</span>
                      <span className="block text-[10px] font-normal text-gray-400">1st floor</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">1</span>
                  </div>
                  <div className="flex flex-1 h-full relative">
                    {daysInDec.map((day, idx) => (
                      <div
                        key={day}
                        className={`flex-1 min-w-[34px] h-full border-r border-gray-100/80 ${
                          day === 16 ? "bg-blue-50/40" : dayNames[idx % 7] === "Sa" || dayNames[idx % 7] === "Su" ? "bg-gray-50/50" : ""
                        }`}
                      />
                    ))}

                    {/* Booking: Dec 5 to Dec 14 */}
                    <div
                      style={{
                        position: "absolute",
                        left: "14.5%",
                        width: "29%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Blessing Igwe</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>

                    {/* Booking: Dec 18 to Dec 27 (Owes balance) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "54.8%",
                        width: "29%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-amber-400 border border-amber-500 text-gray-900 rounded px-2.5 flex items-center justify-between text-[11px] font-semibold shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Yusuf Musa (10 nights)</span>
                      <span className="text-[10px] font-mono bg-amber-500/50 px-1 rounded ml-1 font-bold">
                        Bal: ₦60k
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apartment Row 3: Penthouse Suite 301 */}
                <div className="flex border-b border-gray-100 text-xs items-center relative hover:bg-blue-50/20 group h-14">
                  <div className="w-48 flex-shrink-0 px-3.5 py-2 border-r border-gray-200 bg-white font-semibold text-gray-900 flex items-center justify-between">
                    <div>
                      <span>Penthouse 301</span>
                      <span className="block text-[10px] font-normal text-gray-400">Top floor</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">3</span>
                  </div>
                  <div className="flex flex-1 h-full relative">
                    {daysInDec.map((day, idx) => (
                      <div
                        key={day}
                        className={`flex-1 min-w-[34px] h-full border-r border-gray-100/80 ${
                          day === 16 ? "bg-blue-50/40" : dayNames[idx % 7] === "Sa" || dayNames[idx % 7] === "Su" ? "bg-gray-50/50" : ""
                        }`}
                      />
                    ))}

                    {/* Booking: Dec 1 to Dec 10 */}
                    <div
                      style={{
                        position: "absolute",
                        left: "1.6%",
                        width: "29%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Ngozi Obi (Diplomat)</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>

                    {/* Booking: Dec 15 to Dec 31 (New Year Stay) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "45.1%",
                        width: "51.6%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-amber-400 border border-amber-500 text-gray-900 rounded px-2.5 flex items-center justify-between text-[11px] font-semibold shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Ambassador Nwosu (Holiday Retreat)</span>
                      <span className="text-[10px] font-mono bg-amber-500/50 px-1 rounded ml-1 font-bold">
                        Bal: ₦120k
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apartment Row 4: Studio Apartment 102 */}
                <div className="flex text-xs items-center relative hover:bg-blue-50/20 group h-14">
                  <div className="w-48 flex-shrink-0 px-3.5 py-2 border-r border-gray-200 bg-white font-semibold text-gray-900 flex items-center justify-between">
                    <div>
                      <span>Studio 102</span>
                      <span className="block text-[10px] font-normal text-gray-400">Ground floor</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]">1</span>
                  </div>
                  <div className="flex flex-1 h-full relative">
                    {daysInDec.map((day, idx) => (
                      <div
                        key={day}
                        className={`flex-1 min-w-[34px] h-full border-r border-gray-100/80 ${
                          day === 16 ? "bg-blue-50/40" : dayNames[idx % 7] === "Sa" || dayNames[idx % 7] === "Su" ? "bg-gray-50/50" : ""
                        }`}
                      />
                    ))}

                    {/* Booking: Dec 8 to Dec 18 (Spans over Today Dec 16) */}
                    <div
                      style={{
                        position: "absolute",
                        left: "22.5%",
                        width: "32.2%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Fatima Aliyu</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>

                    {/* Booking: Dec 20 to Dec 28 */}
                    <div
                      style={{
                        position: "absolute",
                        left: "61.3%",
                        width: "25.8%",
                        top: "10px",
                        bottom: "10px",
                      }}
                      className="bg-green-500 border border-green-600 text-white rounded px-2.5 flex items-center justify-between text-[11px] font-medium shadow-2xs z-10 cursor-pointer"
                    >
                      <span className="truncate">Babajide Sanwo</span>
                      <span className="text-[10px] font-mono bg-green-700/60 px-1 rounded ml-1">✓ Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-gray-800">
                  Exact Invariant: Zero double-bookings allowed.
                </span>
                <span className="text-gray-500 hidden sm:inline">
                  Overlapping active bookings for the same apartment are blocked by the database.
                </span>
              </div>
              <div className="text-gray-500">
                Turnover rule: Checkout day = next check-in day without clashing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem vs. BooksCheck Solution Section ── */}
      <section className="py-16 bg-white border-t border-gray-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Why hospitality managers switch to BooksCheck
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Paper notebooks get lost, WhatsApp chats get buried, and Excel spreadsheets don&apos;t block overlaps. BooksCheck gives your team one shared source of truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-red-50/50 border border-red-200/80 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  ✕
                </span>
                <h3 className="text-lg font-bold text-red-950">The Old Way (Notebooks &amp; Chats)</h3>
              </div>
              <ul className="space-y-3.5 text-sm text-red-900/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span><strong>Accidental Double-Bookings:</strong> Two guests arrive for the same apartment on overlapping dates, causing angry reviews, refunds, and lost trust.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span><strong>Lost Revenue &amp; Unpaid Balances:</strong> Payments scribbled in margins or lost in chat logs make it impossible to know who still owes money.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span><strong>Slow Customer Inquiries:</strong> Taking minutes to flip notebook pages to see if an apartment is free results in lost booking enquiries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span><strong>No Audit History:</strong> When a price or checkout date changes, there is zero record of who changed it or why.</span>
                </li>
              </ul>
            </div>

            {/* The BooksCheck Way */}
            <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <h3 className="text-lg font-bold text-emerald-950">The BooksCheck Way</h3>
              </div>
              <ul className="space-y-3.5 text-sm text-emerald-950/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Guaranteed Zero Clash:</strong> Both the application and the database strictly block overlapping dates. It is mathematically impossible to double-book.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Exact Money Tracking:</strong> Total price minus amount paid equals balance. Filter for unpaid bookings in one click and see live financial summaries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>15-Second Availability Lookups:</strong> Open the month grid, glance at occupancy bars, and confirm availability in seconds while the guest is on the phone.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span><strong>Full Audit History:</strong> Every change to dates, status, or payments is logged automatically in the booking timeline.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Deep Dive Section ── */}
      <section className="py-16 bg-slate-50 border-t border-gray-200/80 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-3 text-gray-600 text-sm sm:text-base">
              Built deliberately for the manager on the company laptop. No steep learning curves or complicated setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                🛡️
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Clash Protection Engine</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A booking occupies nights from check-in up to, but not including, check-out. Same-day turnover is allowed. Any overlapping stay is instantly rejected with a friendly alert.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4">
                💰
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Exact Decimal Balances</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Money is calculated to the cent/kobo without floating point rounding errors. Cancelled bookings retain their amount paid as held deposits, keeping ledgers completely honest.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-purple-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold mb-4">
                ⚡
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">60s Live Auto-Refresh</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Leave the calendar open on the laptop all day. It automatically refreshes every 60 seconds and whenever the manager focuses the window, guaranteeing up-to-date data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                🔍
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Search &amp; Year/Month Filters</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Instantly search by guest name or phone number. Filter by year, month, or active status. Toggle &quot;Unpaid only&quot; to review all outstanding balances in under 30 seconds.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-amber-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-4">
                🔒
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Safe Edits &amp; Delete Guards</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Optimistic concurrency prevents two edits from overwriting each other. Deletion is permitted only when zero money has been paid, preventing accidental record loss.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold mb-4">
                🏢
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Company Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Register up to 50 apartments with customizable room counts. Support for your national currency and local time zone. Currency locks automatically once bookings exist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Setup Section ── */}
      <section className="py-16 bg-white border-t border-gray-200 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Get up and running in 3 simple steps
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Start managing your apartments in less time than it takes to check in a guest.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-bold text-gray-900 text-base mb-1">Create an Account</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sign up with your company email. One login per business keeps management simple on your desk laptop.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-bold text-gray-900 text-base mb-1">Add Your Apartments</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enter your company name, select your currency (NGN, USD, GBP, etc.), and name your apartments or rooms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/90 relative">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-bold text-gray-900 text-base mb-1">Record &amp; Track</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Click any date to record a booking. Watch your calendar update with color-coded paid and balance swatches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-16 bg-slate-50 border-t border-gray-200 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm">
                Can two managers book the same apartment for overlapping dates?
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                No. BooksCheck enforces the zero-clash rule in both application logic and database exclusion constraints. Even if two people attempt to save simultaneous bookings for the exact same night, exactly one succeeds and the other receives a clear clash notification.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm">
                How does same-day turnover work?
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                A booking occupies nights from check-in up to, but not including, check-out. If Guest A checks out on December 16 at 11:00 AM, Guest B can check in on December 16 at 2:00 PM without causing a clash. Both appear cleanly on the calendar.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm">
                What happens when a booking is cancelled?
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                When cancelled, the booking immediately leaves the calendar grid so the apartment becomes free for new guests. However, any amount paid is preserved as held revenue in the system, keeping your financial records 100% honest.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm">
                What currencies and time zones are supported?
              </h3>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                BooksCheck defaults to Nigerian Naira (NGN) and Africa/Lagos time, but supports all major currencies (USD, GBP, EUR, GHS, KES, ZAR, EGP) and international time zones configured during company setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Take full control of your apartment bookings today
          </h2>
          <p className="mt-3.5 text-blue-100 text-base max-w-xl mx-auto">
            Zero clashing stays, guaranteed. Create your company account and start using your month calendar now.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Register Your Company Free
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 bg-blue-700/60 hover:bg-blue-700 border border-blue-400/40 text-white font-semibold text-sm rounded-xl transition"
            >
              Sign In to Laptop
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-gray-200 bg-white px-6 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span className="font-semibold text-gray-900">BooksCheck</span>
            <span>· Dedicated Hotel &amp; Serviced Apartment Management</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-gray-900 transition">Log in</Link>
            <Link href="/signup" className="hover:text-gray-900 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
