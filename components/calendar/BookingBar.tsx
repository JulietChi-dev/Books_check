"use client";

import { useRouter } from "next/navigation";
import { computeBarGeometry } from "@/lib/calendar-utils";

interface BookingBarProps {
  id: string;
  guestName: string;
  /** "paid" | "owes" */
  variant: "paid" | "owes";
  owesLabel: string; // e.g. "Owes NGN 45,000.00" — empty when paid
  checkInDay: number;
  checkOutDay: number;
  totalDays: number;
}

/**
 * Booking bar (PRD FR-30, FR-31, FR-40, screens.md rules 3, 4, 9)
 *
 * - Green with ✓ Paid when balance = 0 (FR-31).
 * - Amber with "Owes NGN x" when balance > 0 (FR-31).
 * - Guest name shown, truncated with ellipsis on overflow.
 * - Keyboard-focusable button with descriptive aria-label (FR-40).
 * - Positioned absolutely using mid-cell geometry (FR-30).
 */
export function BookingBar({
  id,
  guestName,
  variant,
  owesLabel,
  checkInDay,
  checkOutDay,
  totalDays,
}: BookingBarProps) {
  const router = useRouter();
  const { leftPct, widthPct } = computeBarGeometry(
    checkInDay,
    checkOutDay,
    totalDays
  );

  const isPaid = variant === "paid";
  const ariaLabel = isPaid
    ? `${guestName} — Paid. Check in day ${checkInDay}, check out day ${checkOutDay}.`
    : `${guestName} — ${owesLabel}. Check in day ${checkInDay}, check out day ${checkOutDay}.`;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation(); // prevent cell click from firing (FR-34)
        router.push(`/bookings/${id}`);
      }}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
      }}
      className={[
        "absolute top-1 bottom-1 rounded-lg z-10",
        "flex items-center px-2 gap-1 text-[11.5px] font-semibold",
        "overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
        isPaid
          ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 border-l-4 border-l-[#16A34A] text-emerald-950 focus:ring-emerald-500 shadow-xs"
          : "bg-amber-50 hover:bg-amber-100 border border-amber-300 border-l-4 border-l-[#D97706] text-amber-950 focus:ring-amber-500 shadow-xs",
      ].join(" ")}
    >
      {/* Status text — meaning never depends on colour alone (FR-31) */}
      {isPaid && (
        <span className="flex-shrink-0 font-bold text-[#16A34A]">Paid ✓</span>
      )}
      {/* Guest name — may be clipped */}
      <span className="truncate min-w-0 flex-1">{guestName}</span>
      {/* Balance label when owes, with currency code (FR-31, FR-89) */}
      {!isPaid && owesLabel && (
        <span className="flex-shrink-0 font-semibold">{owesLabel}</span>
      )}
    </button>
  );
}
