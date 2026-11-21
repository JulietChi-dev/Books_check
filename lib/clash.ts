/**
 * Pure booking clash logic (PRD 6.7, FR-55 to FR-60, rules/clash-rule.md)
 *
 * Rules:
 * 1. Half-open date range [checkIn, checkOut). Check-out is the morning of departure.
 * 2. Two bookings clash if:
 *    new.checkIn < existing.checkOut AND new.checkOut > existing.checkIn
 * 3. Only ACTIVE bookings block. CANCELLED bookings never block.
 * 4. When editing, ignore the booking being edited.
 * 5. Same-day turnover (new.checkIn == existing.checkOut or new.checkOut == existing.checkIn) is NOT a clash.
 */

export interface BookingInterval {
  id?: string;
  apartmentId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: "ACTIVE" | "CANCELLED";
  guestName?: string;
}

export function doBookingsClash(
  newBooking: {
    apartmentId: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    excludeBookingId?: string;
  },
  existing: BookingInterval
): boolean {
  // Different apartments never clash
  if (newBooking.apartmentId !== existing.apartmentId) {
    return false;
  }

  // Cancelled bookings never block
  if (existing.status !== "ACTIVE") {
    return false;
  }

  // Edit ignores the booking being edited
  if (newBooking.excludeBookingId && existing.id === newBooking.excludeBookingId) {
    return false;
  }

  // Strict interval overlap test:
  // new.checkIn < existing.checkOut AND new.checkOut > existing.checkIn
  // Using ISO string comparisons ("YYYY-MM-DD") is lexicographically exact for dates.
  return (
    newBooking.checkIn < existing.checkOut &&
    newBooking.checkOut > existing.checkIn
  );
}

/**
 * Exact FR-56 error message:
 * "Apartment X is already booked from DATE to DATE (Guest NAME)."
 */
export function formatClashMessage(
  apartmentName: string,
  checkInDisplay: string,
  checkOutDisplay: string,
  guestName: string
): string {
  return `Apartment ${apartmentName} is already booked from ${checkInDisplay} to ${checkOutDisplay} (Guest ${guestName}).`;
}
