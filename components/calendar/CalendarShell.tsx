"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarGrid } from "./CalendarGrid";
import { EmptyState } from "./EmptyState";
import { GoToDateForm } from "./GoToDateForm";
import type { CalendarData } from "@/app/api/calendar/route";

interface CalendarShellProps {
  year: number;
  month: number; // 1-indexed
  initialData: CalendarData;
  currency: string;
  timeZone: string;
  serverMs: number; // server query time in ms, for performance reporting
  savedMessage?: boolean;
}

function formatUpdatedTime(date: Date, timeZone: string): string {
  // Decision: company time zone, 24-hour HH:MM (Option A)
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function monthLabel(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

function prevMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month - 2, 1));
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

function nextMonth(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 1));
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * CalendarShell — client component that owns:
 * - Navigation (Prev/Next/Today/Go-to-date) (FR-33)
 * - 60s auto-refresh while tab is visible + on focus (FR-39)
 * - "Updated HH:MM" timestamp (FR-39, decision: company tz, 24h)
 * - Inline toolbar legend (Paid / Owes) matching design
 * - Renders CalendarGrid or EmptyState (FR-38)
 */
export function CalendarShell({
  year,
  month,
  initialData,
  currency,
  timeZone,
  serverMs,
  savedMessage,
}: CalendarShellProps) {
  const router = useRouter();
  const [data, setData] = useState<CalendarData>(initialData);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const mm = month.toString().padStart(2, "0");
      const res = await fetch(`/api/calendar?month=${year}-${mm}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json: CalendarData = await res.json();
        setData(json);
        setUpdatedAt(new Date());
      }
    } catch {
      // Network failure — keep existing data, do not reset (FR-53)
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [year, month]);

  // 60s interval while tab visible (FR-39)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function startInterval() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(refresh, 60_000);
    }
    function stopInterval() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refresh(); // immediate refresh on regain focus
        startInterval();
      } else {
        stopInterval();
      }
    }

    if (document.visibilityState === "visible") {
      startInterval();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", refresh);
    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const hasBookings = data.apartments.some((a) => a.bookings.length > 0);
  const label = monthLabel(year, month);
  const prevSlug = prevMonth(year, month);
  const nextSlug = nextMonth(year, month);

  // Today month slug
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const todaySlug = todayStr.slice(0, 7);

  const isToday = `${year}-${month.toString().padStart(2, "0")}` === todaySlug;

  return (
    <div className="flex flex-col h-full">
      {/* ── Booking saved banner ── */}
      {savedMessage && (
        <div
          role="status"
          className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-sm text-emerald-900 flex items-center justify-between"
        >
          <span className="font-medium">Booking saved.</span>
        </div>
      )}

      {/* ── Toolbar & Legend (matching exact design) ── */}
      <div className="bg-[#F6F7F9] px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation, Month label, and status */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[12.5px] shadow-xs">
            <button
              type="button"
              onClick={() => router.push(`/?month=${prevSlug}`)}
              className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 font-medium transition cursor-pointer"
              aria-label="Previous month"
            >
              ‹ Prev
            </button>
            <span className="px-3 font-display font-bold text-slate-900 min-w-[130px] sm:min-w-[150px] text-center">
              {label}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/?month=${nextSlug}`)}
              className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 font-medium transition cursor-pointer"
              aria-label="Next month"
            >
              Next ›
            </button>
          </div>

          {!isToday && (
            <button
              type="button"
              onClick={() => router.push(`/?month=${todaySlug}`)}
              className="px-2.5 py-1 text-xs border border-teal-200 text-[#0F766E] rounded-lg bg-teal-50 hover:bg-teal-100 font-semibold transition"
            >
              Today
            </button>
          )}

          <span
            className={`text-[11.5px] font-mono text-slate-400 hidden md:inline-block ${refreshing ? "opacity-50" : ""}`}
            aria-live="polite"
            aria-label="Last updated"
          >
            Updated {formatUpdatedTime(updatedAt, timeZone)}
          </span>

          <GoToDateForm />
        </div>

        {/* Legend Pills (inline) */}
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-slate-500 font-medium hidden sm:inline">Legend:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
            Paid ✓
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0" />
            Owes balance
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col w-full max-w-full">
        {!hasBookings && <EmptyState />}
        <div className="flex-1 overflow-auto w-full max-w-full">
          <CalendarGrid
            year={year}
            month={month}
            apartments={data.apartments}
            currency={currency}
          />
        </div>
      </div>

      {/* Dev performance note — hidden in production */}
      {process.env.NODE_ENV !== "production" && (
        <div className="text-[10px] text-gray-300 px-4 pb-1">
          Server query: {serverMs} ms
        </div>
      )}
    </div>
  );
}
