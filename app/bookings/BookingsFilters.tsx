"use client";

import { useRouter } from "next/navigation";
import { useTransition, useRef } from "react";

interface BookingsFiltersProps {
  year: string;
  month: string;
  status: string;
  payment: string;
  q: string;
  sort: string;
  currentYear: number;
}

const MONTHS = [
  { value: "", label: "All months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/**
 * Bookings List Filters (PRD FR-70, FR-72, FR-74)
 * Client component — updates URL search params on filter change.
 */
export function BookingsFilters({
  year,
  month,
  status,
  payment,
  q,
  sort,
  currentYear,
}: BookingsFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  // Build years list: 3 past + current + 2 future
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  function update(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 on any filter change
    params.delete("page");

    startTransition(() => {
      router.push(`/bookings?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    update("q", searchRef.current?.value ?? "");
  }

  function handleSearchClear() {
    if (searchRef.current) searchRef.current.value = "";
    update("q", "");
  }

  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 ${isPending ? "opacity-70" : ""}`}>
      {/* Row 1: Year, Month, Status, Payment, Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Year */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Year</label>
          <select
            value={year}
            onChange={(e) => update("year", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Month</label>
          <select
            value={month}
            onChange={(e) => update("month", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</label>
          <select
            value={status}
            onChange={(e) => update("status", e.target.value)}
            disabled={payment === "unpaid"}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ALL">All</option>
          </select>
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Payment</label>
          <select
            value={payment}
            onChange={(e) => update("payment", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
          >
            <option value="">All</option>
            <option value="unpaid">Unpaid only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort by</label>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
          >
            <option value="checkIn">Check-in (newest first)</option>
            <option value="balance">Balance (highest first)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Search */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] w-full">
          <input
            ref={searchRef}
            type="search"
            defaultValue={q}
            placeholder="Search guest name or phone…"
            className="w-full pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Search
        </button>
        {q && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="px-3.5 py-2 border border-slate-300 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
