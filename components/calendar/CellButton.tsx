"use client";

import { useRouter } from "next/navigation";
import { findBookingForNight } from "@/lib/calendar-utils";

interface CellButtonProps {
  day: number;
  apartmentId: string;
  checkInDateStr: string; // YYYY-MM-DD for this cell's day
  bookings: Array<{
    id: string;
    checkInDay: number;
    checkOutDay: number;
  }>;
  isWeekend: boolean;
}

/**
 * Clickable calendar cell (PRD FR-34, screens.md rule 7)
 *
 * Click rule by night:
 * - If the night starting on this day is booked → open that booking.
 * - If the night is free → open New booking with this apartment and check-in prefilled.
 * Check-out defaults to the next day (PRD FR-34).
 */
export function CellButton({
  day,
  apartmentId,
  checkInDateStr,
  bookings,
  isWeekend,
}: CellButtonProps) {
  const router = useRouter();

  function handleClick() {
    const bookingId = findBookingForNight(day, bookings);
    if (bookingId) {
      router.push(`/bookings/${bookingId}`);
    } else {
      router.push(
        `/bookings/new?apartmentId=${encodeURIComponent(apartmentId)}&checkIn=${encodeURIComponent(checkInDateStr)}`
      );
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Day ${day}${isWeekend ? " (weekend)" : ""}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={[
        "absolute inset-0 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400",
      ].join(" ")}
    />
  );
}
