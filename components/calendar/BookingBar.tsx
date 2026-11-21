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
        "absolute top-1 bottom-1 rounded z-10",
        "flex items-center px-1 gap-1 text-xs font-medium",
        "overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-1",
        isPaid
          ? "bg-green-500 text-white focus:ring-green-600"
          : "bg-amber-400 text-amber-900 focus:ring-amber-500",
      ].join(" ")}
    >
      {/* Status text — meaning never depends on colour alone (FR-31) */}
      {isPaid && (
        <span className="flex-shrink-0 font-semibold">Paid ✓</span>
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
