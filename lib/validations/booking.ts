import { z } from "zod";
import { normalizePhone } from "./company";
import { parseDecimalToCents } from "../money-and-dates";

/**
 * Booking Validation Schemas (PRD 6.6, FR-42 to FR-49, validation-and-messages.md)
 */

export const createBookingSchema = z
  .object({
    apartmentId: z.string().min(1, "Apartment is required."),
    guestName: z
      .string()
      .trim()
      .min(2, "Guest name must be at least 2 characters.")
      .max(80, "Guest name cannot exceed 80 characters."),
    guestPhone: z
      .string()
      .trim()
      .refine(
        (val) => {
          try {
            normalizePhone(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Phone number must contain between 7 and 15 digits." }
      ),
    checkIn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date must be in YYYY-MM-DD format."),
    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date must be in YYYY-MM-DD format."),
    totalPrice: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Total price must be a valid decimal amount.")
      .refine(
        (val) => {
          try {
            const cents = parseDecimalToCents(val);
            return cents >= 0n && cents <= 999999999999n;
          } catch {
            return false;
          }
        },
        { message: "Total price must be between 0 and 9,999,999,999.99." }
      ),
    amountPaid: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Amount paid must be a valid decimal amount.")
      .default("0")
      .refine(
        (val) => {
          try {
            const cents = parseDecimalToCents(val);
            return cents >= 0n;
          } catch {
            return false;
          }
        },
        { message: "Amount paid cannot be negative." }
      ),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters.")
      .optional()
      .or(z.literal("")),
    requestId: z.string().min(1, "Request ID is required for retry safety."),
    entrySeconds: z.coerce.number().int().optional(),
    confirmedUnusualDates: z.boolean().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      try {
        const totalCents = parseDecimalToCents(data.totalPrice);
        const paidCents = parseDecimalToCents(data.amountPaid);
        return paidCents <= totalCents;
      } catch {
        return false;
      }
    },
    {
      message: "Amount paid cannot be more than the total price.",
      path: ["amountPaid"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingSchema = z
  .object({
    bookingId: z.string().min(1, "Booking ID is required."),
    loadedUpdatedAt: z.string().min(1, "Loaded update timestamp is required."),
    apartmentId: z.string().min(1, "Apartment is required."),
    guestName: z
      .string()
      .trim()
      .min(2, "Guest name must be at least 2 characters.")
      .max(80, "Guest name cannot exceed 80 characters."),
    guestPhone: z
      .string()
      .trim()
      .refine(
        (val) => {
          try {
            normalizePhone(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Phone number must contain between 7 and 15 digits." }
      ),
    checkIn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in date must be in YYYY-MM-DD format."),
    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out date must be in YYYY-MM-DD format."),
    totalPrice: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Total price must be a valid decimal amount.")
      .refine(
        (val) => {
          try {
            const cents = parseDecimalToCents(val);
            return cents >= 0n && cents <= 999999999999n;
          } catch {
            return false;
          }
        },
        { message: "Total price must be between 0 and 9,999,999,999.99." }
      ),
    amountPaid: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Amount paid must be a valid decimal amount.")
      .default("0")
      .refine(
        (val) => {
          try {
            const cents = parseDecimalToCents(val);
            return cents >= 0n;
          } catch {
            return false;
          }
        },
        { message: "Amount paid cannot be negative." }
      ),
    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters.")
      .optional()
      .or(z.literal("")),
    confirmedUnusualDates: z.boolean().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      try {
        const totalCents = parseDecimalToCents(data.totalPrice);
        const paidCents = parseDecimalToCents(data.amountPaid);
        return paidCents <= totalCents;
      } catch {
        return false;
      }
    },
    {
      // FR-48: When an edit lowers the total below the amount paid
      message:
        "Total price cannot be less than the amount already paid. Lower the amount paid first.",
      path: ["totalPrice"],
    }
  );

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
