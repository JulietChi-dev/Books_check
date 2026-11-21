import { describe, it, expect } from "vitest";
import {
  calculateBalance,
  formatMoneyDisplay,
  parseDecimalToCents,
  formatCentsToDecimal,
  parseUTCDate,
  formatUTCDate,
  countNights,
  getCompanyToday,
  formatDisplayDate,
} from "../../lib/money-and-dates";

describe("Exact Decimal Money Handling (PRD FR-49, FR-89)", () => {
  it("computes balance without floating point error", () => {
    // 0.1 + 0.2 in float is 0.30000000000000004
    const balance = calculateBalance("0.30", "0.10");
    expect(balance).toBe("0.20");

    expect(calculateBalance("150000.00", "50000.00")).toBe("100000.00");
    expect(calculateBalance("50000.00", "50000.00")).toBe("0.00");
  });

  it("handles maximum PRD bounds safely (9,999,999,999.99)", () => {
    const total = "9999999999.99";
    const paid = "1234567890.50";
    const balance = calculateBalance(total, paid);
    expect(balance).toBe("8765432109.49");
  });

  it("rejects malformed decimal text", () => {
    expect(() => parseDecimalToCents("150,000.00")).toThrow();
    expect(() => parseDecimalToCents("150.000")).toThrow();
    expect(() => parseDecimalToCents("abc")).toThrow();
  });

  it("formats display money without floats", () => {
    expect(formatMoneyDisplay("NGN", "150000.00")).toBe("NGN 150,000.00");
    expect(formatMoneyDisplay("USD", "0.00")).toBe("USD 0.00");
  });

  it("round trips money between decimal text and cent bigints", () => {
    const original = "1234567.89";
    const cents = parseDecimalToCents(original);
    const roundTripped = formatCentsToDecimal(cents);
    expect(roundTripped).toBe(original);
  });
});

describe("Calendar Date Handling (PRD FR-90, rules/dates-and-money.md)", () => {
  it("constructs and formats UTC dates safely", () => {
    const parsed = parseUTCDate("2026-12-24");
    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(11); // 0-indexed December
    expect(parsed.getUTCDate()).toBe(24);
    expect(formatUTCDate(parsed)).toBe("2026-12-24");
  });

  it("rejects non-existent calendar dates like 30 February", () => {
    expect(() => parseUTCDate("2026-02-30")).toThrow();
    expect(() => parseUTCDate("2026-04-31")).toThrow();
  });

  it("counts nights exactly across month and year boundaries", () => {
    expect(countNights("2026-12-10", "2026-12-14")).toBe(4);
    expect(countNights("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("formats display date exactly as required", () => {
    expect(formatDisplayDate("2026-12-24")).toBe("Thu, 24 Dec 2026");
  });

  describe("Timezone Suitability across Africa/Lagos, Pacific/Auckland, America/Los_Angeles", () => {
    const zones = ["Africa/Lagos", "Pacific/Auckland", "America/Los_Angeles"];

    zones.forEach((zone) => {
      it(`calculates valid company today for ${zone}`, () => {
        const today = getCompanyToday(zone);
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // Date must be valid
        expect(() => parseUTCDate(today)).not.toThrow();
      });
    });
  });
});
