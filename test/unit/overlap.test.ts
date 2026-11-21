import { describe, it, expect } from "vitest";
import { doBookingsClash, BookingInterval } from "../../lib/clash";

/**
 * Unit tests for every row of the overlap table in PRD 6.7 and rules/clash-rule.md
 *
 * Existing booking:
 * Apartment: "apt-A"
 * Dates: 2026-12-10 to 2026-12-14 (nights of 10, 11, 12, 13)
 * Status: ACTIVE
 */
describe("PRD 6.7 Booking Overlap Rule (All 10 Specification Rows)", () => {
  const existingBooking: BookingInterval = {
    id: "booking-existing-1",
    apartmentId: "apt-A",
    checkIn: "2026-12-10",
    checkOut: "2026-12-14",
    status: "ACTIVE",
    guestName: "Alice",
  };

  it("Row 1: 14 Dec to 17 Dec -> No clash (Same-day turnover: new check-in equals existing check-out)", () => {
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-14",
      checkOut: "2026-12-17",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(false);
  });

  it("Row 2: 7 Dec to 10 Dec -> No clash (Same-day turnover: new check-out equals existing check-in)", () => {
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-07",
      checkOut: "2026-12-10",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(false);
  });

  it("Row 3: 12 Dec to 15 Dec -> Clash (Overlaps nights 12 and 13)", () => {
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-12",
      checkOut: "2026-12-15",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(true);
  });

  it("Row 4: 8 Dec to 16 Dec -> Clash (Fully contains the existing stay)", () => {
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-08",
      checkOut: "2026-12-16",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(true);
  });

  it("Row 5: 11 Dec to 13 Dec -> Clash (Sits inside the existing stay)", () => {
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-11",
      checkOut: "2026-12-13",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(true);
  });

  it("Row 6: 10 Dec to 14 Dec, Apartment B -> No clash (Different apartment)", () => {
    const newBooking = {
      apartmentId: "apt-B",
      checkIn: "2026-12-10",
      checkOut: "2026-12-14",
    };
    expect(doBookingsClash(newBooking, existingBooking)).toBe(false);
  });

  it("Row 7: 12 Dec to 15 Dec, existing is CANCELLED -> No clash (Cancelled bookings never block)", () => {
    const cancelledBooking: BookingInterval = {
      ...existingBooking,
      status: "CANCELLED",
    };
    const newBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-12",
      checkOut: "2026-12-15",
    };
    expect(doBookingsClash(newBooking, cancelledBooking)).toBe(false);
  });

  it("Row 8: Edit existing booking to 10 Dec to 13 Dec -> No clash (Check ignores booking being edited)", () => {
    const editBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-10",
      checkOut: "2026-12-13",
      excludeBookingId: "booking-existing-1",
    };
    expect(doBookingsClash(editBooking, existingBooking)).toBe(false);
  });

  it("Row 9: Edit booking from Apt B to Apt A, 12 Dec to 15 Dec -> Clash (Overlaps nights 12 and 13 in Apt A)", () => {
    const editBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-12",
      checkOut: "2026-12-15",
      excludeBookingId: "booking-from-apt-b",
    };
    expect(doBookingsClash(editBooking, existingBooking)).toBe(true);
  });

  it("Row 10: Edit booking from Apt B to Apt A, 14 Dec to 16 Dec -> No clash (Same-day turnover)", () => {
    const editBooking = {
      apartmentId: "apt-A",
      checkIn: "2026-12-14",
      checkOut: "2026-12-16",
      excludeBookingId: "booking-from-apt-b",
    };
    expect(doBookingsClash(editBooking, existingBooking)).toBe(false);
  });
});
