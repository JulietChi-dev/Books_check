import { z } from "zod";

/**
 * Company & Apartment Validation (PRD 6.4, FR-20 to FR-26, validation-and-messages.md)
 */

/**
 * Phone normalization (PRD FR-21)
 * Count only digits: 7 to 15. Accept spaces and hyphens, then remove them.
 * Keep a leading plus. Store the rest.
 */
export function normalizePhone(rawPhone: string): string {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    throw new Error("Phone number is required.");
  }

  const hasPlus = trimmed.startsWith("+");
  // Remove all spaces and hyphens
  const cleaned = trimmed.replace(/[\s-]/g, "");

  // Extract digits
  const digitsOnly = cleaned.replace(/\D/g, "");

  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    throw new Error("Phone number must contain between 7 and 15 digits.");
  }

  // Ensure no other invalid characters exist
  const expectedFormat = hasPlus ? `+${digitsOnly}` : digitsOnly;
  if (cleaned !== expectedFormat) {
    throw new Error("Phone number contains invalid characters.");
  }

  return expectedFormat;
}

export const apartmentRowSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Apartment name is required.")
    .max(60, "Apartment name cannot exceed 60 characters."),
  roomCount: z.coerce
    .number()
    .int("Room count must be an integer.")
    .min(1, "Room count must be between 1 and 20.")
    .max(20, "Room count must be between 1 and 20."),
});

export type ApartmentRowInput = z.infer<typeof apartmentRowSchema>;

/**
 * Validates apartment array for duplicate names ignoring case (PRD FR-23).
 * Exact error text: "Two apartments share the name 'X'."
 */
export function checkDuplicateApartmentNames(
  apartments: Array<{ name: string }>
): { hasDuplicates: boolean; duplicateName?: string; message?: string } {
  const seen = new Set<string>();

  for (const apt of apartments) {
    const trimmed = apt.name.trim();
    const lower = trimmed.toLowerCase();

    if (seen.has(lower)) {
      return {
        hasDuplicates: true,
        duplicateName: trimmed,
        message: `Two apartments share the name '${trimmed}'.`,
      };
    }
    seen.add(lower);
  }

  return { hasDuplicates: false };
}

export const companyRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters."),
  country: z.string().length(2).default("NG"),
  currency: z.string().length(3).default("NGN"),
  timeZone: z.string().default("Africa/Lagos"),
  address: z
    .string()
    .trim()
    .max(200, "Address cannot exceed 200 characters.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        try {
          normalizePhone(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Phone number must contain between 7 and 15 digits." }
    ),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      { message: "Enter a valid email address." }
    ),
  apartments: z
    .array(apartmentRowSchema)
    .min(1, "At least one apartment is required.")
    .max(50, "You cannot register more than 50 apartments."),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
