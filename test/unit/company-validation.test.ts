import { describe, it, expect } from "vitest";
import {
  normalizePhone,
  checkDuplicateApartmentNames,
  companyRegistrationSchema,
} from "../../lib/validations/company";

describe("Company & Apartment Validation Unit Tests (PRD 6.4)", () => {
  describe("Phone Normalization (FR-21)", () => {
    it("normalizes phone with leading + and stripped spaces/hyphens", () => {
      expect(normalizePhone("+234 801-234-5678")).toBe("+2348012345678");
      expect(normalizePhone("+1 (555) 123-4567".replace(/[()]/g, ""))).toBe("+15551234567");
    });

    it("normalizes phone without leading +", () => {
      expect(normalizePhone("0801 234 5678")).toBe("08012345678");
    });

    it("rejects phone numbers with fewer than 7 digits", () => {
      expect(() => normalizePhone("12345")).toThrow("Phone number must contain between 7 and 15 digits.");
    });

    it("rejects phone numbers with more than 15 digits", () => {
      expect(() => normalizePhone("+1234567890123456")).toThrow("Phone number must contain between 7 and 15 digits.");
    });

    it("rejects phone with invalid alphabetic characters", () => {
      expect(() => normalizePhone("+234-CALL-ME")).toThrow();
    });
  });

  describe("Duplicate Apartment Names Check (FR-23)", () => {
    it("allows distinct apartment names", () => {
      const apartments = [
        { name: "Apartment 1" },
        { name: "Apartment 2" },
        { name: "Penthouse" },
      ];
      const check = checkDuplicateApartmentNames(apartments);
      expect(check.hasDuplicates).toBe(false);
    });

    it("catches exact duplicates with PRD error message", () => {
      const apartments = [
        { name: "Apartment A" },
        { name: "Apartment A" },
      ];
      const check = checkDuplicateApartmentNames(apartments);
      expect(check.hasDuplicates).toBe(true);
      expect(check.message).toBe("Two apartments share the name 'Apartment A'.");
    });

    it("catches duplicates ignoring casing (e.g. 'Suite 1' and 'suite 1')", () => {
      const apartments = [
        { name: "Suite 1" },
        { name: "suite 1" },
      ];
      const check = checkDuplicateApartmentNames(apartments);
      expect(check.hasDuplicates).toBe(true);
      expect(check.message).toBe("Two apartments share the name 'suite 1'.");
    });
  });

  describe("Company Registration Schema Bounds (FR-20, FR-22)", () => {
    const validData = {
      name: "Grand View Suites",
      country: "NG",
      currency: "NGN",
      timeZone: "Africa/Lagos",
      apartments: [{ name: "Unit 1", roomCount: 2 }],
    };

    it("accepts valid defaults (Nigeria, NGN, Africa/Lagos)", () => {
      const result = companyRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects company name shorter than 2 chars", () => {
      const result = companyRegistrationSchema.safeParse({
        ...validData,
        name: "A",
      });
      expect(result.success).toBe(false);
    });

    it("rejects apartment room count outside 1 to 20", () => {
      const resultZero = companyRegistrationSchema.safeParse({
        ...validData,
        apartments: [{ name: "Unit 1", roomCount: 0 }],
      });
      expect(resultZero.success).toBe(false);

      const resultOver = companyRegistrationSchema.safeParse({
        ...validData,
        apartments: [{ name: "Unit 1", roomCount: 21 }],
      });
      expect(resultOver.success).toBe(false);
    });

    it("rejects empty apartment list", () => {
      const result = companyRegistrationSchema.safeParse({
        ...validData,
        apartments: [],
      });
      expect(result.success).toBe(false);
    });
  });
});
