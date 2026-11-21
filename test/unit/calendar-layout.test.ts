/**
 * Unit tests for calendar-utils.ts (PRD FR-30, FR-34)
 *
 * Tests:
 * 1. daysInMonth returns correct counts including leap years.
 * 2. isWeekend correctly identifies Sat/Sun.
 * 3. computeBarGeometry — bar fully within month.
 * 4. computeBarGeometry — booking starts before month (left clamps to 0).
 * 5. computeBarGeometry — booking ends after month (right extends to 100%).
 * 6. computeBarGeometry — booking spans entire month.
 * 7. findBookingForNight — returns booking ID when night is occupied.
 * 8. findBookingForNight — returns null when night is free.
 * 9. findBookingForNight — same-day turnover: check-out day is NOT blocked by that booking.
 * 10. findBookingForNight — check-in day IS blocked by the incoming booking.
 */

import { describe, it, expect } from "vitest";
import {
  daysInMonth,
  isWeekend,
  computeBarGeometry,
  findBookingForNight,
} from "@/lib/calendar-utils";

describe("daysInMonth", () => {
  it("returns 31 for January", () => expect(daysInMonth(2026, 1)).toBe(31));
  it("returns 28 for Feb non-leap", () => expect(daysInMonth(2026, 2)).toBe(28));
  it("returns 29 for Feb leap year", () => expect(daysInMonth(2024, 2)).toBe(29));
  it("returns 30 for April", () => expect(daysInMonth(2026, 4)).toBe(30));
  it("returns 31 for December", () => expect(daysInMonth(2026, 12)).toBe(31));
});

describe("isWeekend", () => {
  // 2026-11-21 is a Saturday
  it("Saturday is weekend", () => expect(isWeekend(2026, 11, 21)).toBe(true));
  // 2026-11-22 is a Sunday
  it("Sunday is weekend", () => expect(isWeekend(2026, 11, 22)).toBe(true));
  // 2026-11-20 is a Friday
  it("Friday is not weekend", () => expect(isWeekend(2026, 11, 20)).toBe(false));
  // 2026-11-23 is a Monday
  it("Monday is not weekend", () => expect(isWeekend(2026, 11, 23)).toBe(false));
});

describe("computeBarGeometry", () => {
  const totalDays = 30; // e.g. November

  it("full booking within month: starts mid day 1, ends mid day 5", () => {
    const { leftPct, widthPct } = computeBarGeometry(1, 5, totalDays);
    // left = (0 + 0.5) / 30 * 100 ≈ 1.667
    expect(leftPct).toBeCloseTo((0.5 / 30) * 100, 3);
    // right = (4 + 0.5) / 30 * 100 = 15
    expect(widthPct).toBeCloseTo(((4.5 - 0.5) / 30) * 100, 3);
  });

  it("booking starts before month: left clamps to 0", () => {
    const { leftPct } = computeBarGeometry(0, 10, totalDays);
    expect(leftPct).toBe(0);
  });

  it("booking ends after month: right goes to 100%", () => {
    const { leftPct, widthPct } = computeBarGeometry(25, totalDays + 1, totalDays);
    expect(leftPct).toBeCloseTo(((24 + 0.5) / 30) * 100, 1);
    // rightMid = right edge of last cell = totalDays * cellWidth = 100%
    // width = 100 - leftPct
    expect(leftPct + widthPct).toBeCloseTo(100, 1);
  });

  it("booking spans entire month: left=0, right=100%", () => {
    const { leftPct, widthPct } = computeBarGeometry(0, totalDays + 1, totalDays);
    expect(leftPct).toBe(0);
    expect(leftPct + widthPct).toBeCloseTo(100, 1);
  });

  it("single-night booking: width is one cell width minus half offsets", () => {
    // check-in = 10, check-out = 11 → 1 night
    const { widthPct } = computeBarGeometry(10, 11, totalDays);
    const cellWidth = 100 / totalDays;
    // leftMid = (9 + 0.5) * cellWidth, rightMid = (10 + 0.5) * cellWidth
    expect(widthPct).toBeCloseTo(cellWidth, 3);
  });
});

describe("findBookingForNight", () => {
  const bookings = [
    { id: "b1", checkInDay: 5, checkOutDay: 10 },
    { id: "b2", checkInDay: 15, checkOutDay: 20 },
  ];

  it("returns booking ID when night is booked", () => {
    expect(findBookingForNight(5, bookings)).toBe("b1");
    expect(findBookingForNight(9, bookings)).toBe("b1");
    expect(findBookingForNight(15, bookings)).toBe("b2");
  });

  it("returns null when night is free", () => {
    expect(findBookingForNight(4, bookings)).toBeNull();
    expect(findBookingForNight(10, bookings)).toBeNull(); // check-out day is free
    expect(findBookingForNight(14, bookings)).toBeNull();
    expect(findBookingForNight(21, bookings)).toBeNull();
  });

  it("same-day turnover: check-out day belongs to next booking, not current", () => {
    const turnover = [
      { id: "out", checkInDay: 1, checkOutDay: 10 },
      { id: "in", checkInDay: 10, checkOutDay: 15 },
    ];
    // Day 10 is check-out for 'out' and check-in for 'in'
    // findBookingForNight uses < checkOutDay, so day 10 belongs to 'in'
    expect(findBookingForNight(10, turnover)).toBe("in");
    expect(findBookingForNight(9, turnover)).toBe("out");
  });

  it("check-in day is occupied by that booking", () => {
    expect(findBookingForNight(5, bookings)).toBe("b1");
  });
});
