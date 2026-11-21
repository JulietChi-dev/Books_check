import { describe, it, expect } from "vitest";
import { createBookingSchema } from "../../lib/validations/booking";

describe("Booking Validation Unit Tests (PRD 6.6, FR-42 to FR-49)", () => {
  const validData = {
    apartmentId: "apt-valid-1",
    guestName: "Alice Wonderland",
    guestPhone: "+234 801 234 5678",
    checkIn: "2026-12-10",
    checkOut: "2026-12-14",
    totalPrice: "150000.00",
    amountPaid: "50000.00",
    notes: "Late arrival around 8pm.",
    requestId: "req-test-12345",
  };

  it("accepts valid booking data", () => {
    const result = createBookingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("Dates Validation (FR-45)", () => {
    it("rejects check-out equal to check-in with exact message", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        checkIn: "2026-12-10",
        checkOut: "2026-12-10",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Check-out must be after check-in.");
      }
    });

    it("rejects check-out earlier than check-in with exact message", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        checkIn: "2026-12-14",
        checkOut: "2026-12-10",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Check-out must be after check-in.");
      }
    });
  });

  describe("Money Invariants (FR-47, FR-48)", () => {
    it("rejects amount paid greater than total price with exact message", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        totalPrice: "50000.00",
        amountPaid: "60000.00",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Amount paid cannot be more than the total price."
        );
      }
    });

    it("accepts amount paid equal to total price (fully paid)", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        totalPrice: "50000.00",
        amountPaid: "50000.00",
      });
      expect(result.success).toBe(true);
    });

    it("accepts amount paid equal to zero (default)", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        totalPrice: "50000.00",
        amountPaid: "0.00",
      });
      expect(result.success).toBe(true);
    });

    it("rejects total price exceeding 9,999,999,999.99", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        totalPrice: "10000000000.00",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Guest Fields (FR-43, FR-44)", () => {
    it("rejects guest name shorter than 2 characters", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        guestName: "A",
      });
      expect(result.success).toBe(false);
    });

    it("rejects guest phone outside 7 to 15 digits", () => {
      const result = createBookingSchema.safeParse({
        ...validData,
        guestPhone: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Notes Bounds (FR-42)", () => {
    it("rejects notes longer than 500 characters", () => {
      const longNotes = "n".repeat(501);
      const result = createBookingSchema.safeParse({
        ...validData,
        notes: longNotes,
      });
      expect(result.success).toBe(false);
    });
  });
});
