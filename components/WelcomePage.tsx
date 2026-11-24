"use client";

import React, { useState } from "react";
import Link from "next/link";

interface BookingPreview {
  apartment: string;
  startCol: number;
  span: number;
  type: "paid" | "owes";
  label?: string;
  leftLabel?: string;
  centerLabel?: string;
  tooltip: string;
}

const previewApartments = [
  "Charlotte",
  "Chicago",
  "Dallas",
  "Houston",
  "Los Angeles",
  "New York",
  "San Francisco",
];

const previewBookings: BookingPreview[] = [
  {
    apartment: "Chicago",
    startCol: 25,
    span: 2,
    type: "owes",
    label: "Owes NGN",
    tooltip: "Chicago • Nov 25 – Nov 26 • Owes NGN",
  },
  {
    apartment: "Houston",
    startCol: 22,
    span: 9,
    type: "paid",
    leftLabel: "Paid ✓",
    centerLabel: "John Ofor",
    tooltip: "Houston • Nov 22 – Nov 30 • Paid ✓ — John Ofor",
  },
  {
    apartment: "New York",
    startCol: 26,
    span: 5,
    type: "owes",
    label: "Mar... Owes NGN 230,000.00",
    tooltip: "New York • Nov 26 – Nov 30 • Mar... Owes NGN 230,000.00",
  },
];

const dayAbbr = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function WelcomePage() {
  const [previewYear, setPreviewYear] = useState(2026);
  const [previewMonth, setPreviewMonth] = useState(10); // November (0-indexed)

  // Floating Tooltip State
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });

  // Calendar calculations
  const daysInMonth = new Date(previewYear, previewMonth + 1, 0).getDate();
  const firstDow = new Date(previewYear, previewMonth, 1).getDay();
  const monthLabel = new Date(previewYear, previewMonth, 1).toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const isNov2026 = previewYear === 2026 && previewMonth === 10;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function shiftPreviewMonth(delta: number) {
    const nextM = previewMonth + delta;
    if (nextM < 0) {
      setPreviewMonth(11);
      setPreviewYear((y) => y - 1);
    } else if (nextM > 11) {
      setPreviewMonth(0);
      setPreviewYear((y) => y + 1);
    } else {
      setPreviewMonth(nextM);
    }
  }

  function handleMouseMove(e: React.MouseEvent, text: string) {
    let x = e.clientX + 12;
    let y = e.clientY - 36;
    if (typeof window !== "undefined") {
      if (x + 260 > window.innerWidth) x = e.clientX - 260;
      if (y < 8) y = e.clientY + 16;
    }
    setTooltip({
      visible: true,
      text,
      x,
      y,
    });
  }

  function handleMouseLeave() {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }

  return (
    <div className="bg-[#F6F7F9] text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-950 flex flex-col min-h-screen">
      {/* ── 1. TOP NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          {/* Left: BooksCheck Brand Logo Mark + Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#182230] flex items-center justify-center shadow-sm group-hover:bg-[#0F766E] transition-colors">
              {/* Custom Calendar Check Architectural Mark */}
              <svg
                className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="3" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 15.5l2 2 4.5-4.5" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-[20px] tracking-tight text-[#182230]">
              BooksCheck
            </span>
          </Link>

          {/* Center Navigation Links: Intentionally excluded per user instruction ("leave out the feature, preview, pricing and how it works on the menu") */}

          {/* Right: Log in + Get Started Free */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-[13.5px] font-semibold text-slate-800 transition-all cursor-pointer inline-block text-center"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 text-white text-[13.5px] font-semibold shadow-sm shadow-teal-900/15 transition-all cursor-pointer inline-block text-center"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── 2. EDITORIAL HERO SECTION + INTERACTIVE PRODUCT PREVIEW ── */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F9FAFB] to-[#F6F7F9]">
          {/* Subtle architectural dot backdrop */}
          <div
            className="absolute inset-0 hero-grid-bg opacity-35 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8">
            {/* Centered Editorial Hero Copy */}
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-[#0F766E] text-[11.5px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                <span>APARTMENT &amp; SHORT-LET BOOKING MANAGEMENT</span>
              </div>

              {/* Main Headline (H1) */}
              <h1 className="font-display font-extrabold text-[34px] sm:text-[48px] lg:text-[56px] text-[#182230] leading-[1.1] tracking-tight">
                Every apartment, booking, and balance in one clear timeline.
              </h1>

              {/* Subheadline */}
              <p className="text-[16px] sm:text-[18px] text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Eliminate double bookings and track guest payments in real time.
                Built for property managers running multi-unit apartments like{" "}
                <span className="font-semibold text-slate-800">
                  Kings Crown Apartment
                </span>
                —with instant NGN &amp; multi-currency balance tracking.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[15px] font-semibold shadow-md shadow-teal-900/15 transition-all cursor-pointer"
                >
                  <span>Create Free Account</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#182230] text-[15px] font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>Sign In to Workspace</span>
                </Link>
              </div>

              {/* Trust Micro-caption */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[#16A34A]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[#16A34A]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  NGN &amp; Multi-currency ready
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[#16A34A]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Set up all units in 2 minutes
                </span>
              </div>
            </div>

            {/* INTERACTIVE HERO VISUAL PREVIEW CARD (Exact BooksCheck Workspace) */}
            <div id="live-preview" className="mt-12 sm:mt-14">
              <div className="rounded-2xl bg-white border border-slate-200/95 shadow-[0_20px_50px_rgba(24,34,48,0.10)] overflow-hidden">
                {/* Browser Window Chrome Bar */}
                <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400/90" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/90" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-lg bg-white border border-slate-200/90 text-[12px] font-mono text-slate-500">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>app.bookscheck.io/kings-crown-apartment</span>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Interactive Preview
                  </span>
                </div>

                {/* Simulated App Header (Architectural Dark Charcoal-Slate) */}
                <div className="bg-[#182230] text-white px-4 sm:px-6 h-14 flex items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-[17px] tracking-tight text-emerald-400">
                        BooksCheck
                      </span>
                      <span className="h-4 w-[1px] bg-slate-700" />
                      <span className="text-[13.5px] font-medium text-slate-200">
                        Kings Crown Apartment
                      </span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/70 text-[12px]">
                      <span className="px-2.5 py-1 rounded-md bg-white text-slate-900 font-semibold">
                        Calendar
                      </span>
                      <span className="px-2.5 py-1 text-slate-300">Bookings</span>
                      <span className="px-2.5 py-1 text-slate-300">
                        + New booking
                      </span>
                      <span className="px-2.5 py-1 text-slate-300">Settings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right leading-tight hidden sm:block">
                      <div className="text-[12.5px] font-semibold text-white">
                        uti lagos
                      </div>
                      <div className="text-[10.5px] font-mono text-slate-400">
                        NGN · Africa/Lagos
                      </div>
                    </div>
                    <Link
                      href="/signup"
                      className="px-3 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      + New booking
                    </Link>
                  </div>
                </div>

                {/* Simulated Calendar Toolbar & Legend */}
                <div className="bg-[#F6F7F9] px-4 sm:px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[12.5px]">
                      <button
                        type="button"
                        onClick={() => shiftPreviewMonth(-1)}
                        className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
                      >
                        &lt; Prev
                      </button>
                      <span className="px-3 font-display font-bold text-slate-900 min-w-[140px] text-center">
                        {monthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => shiftPreviewMonth(1)}
                        className="px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 font-medium cursor-pointer"
                      >
                        Next &gt;
                      </button>
                    </div>
                    <span className="hidden md:inline-block text-[11.5px] font-mono text-slate-400">
                      Updated 19:38
                    </span>
                  </div>

                  {/* Legend Pills */}
                  <div className="flex items-center gap-3 text-[12px]">
                    <span className="text-slate-500 font-medium hidden sm:inline">
                      Legend:
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      Paid ✓
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      Owes balance
                    </span>
                  </div>
                </div>

                {/* Interactive 30-Day Apartment Matrix */}
                <div className="preview-scroll overflow-x-auto bg-white">
                  <div className="min-w-[1100px]">
                    {/* Header Row */}
                    <div
                      className="grid border-b border-slate-200 bg-[#FAFAFA]"
                      style={{
                        gridTemplateColumns: `165px repeat(${daysInMonth}, minmax(31px, 1fr))`,
                      }}
                    >
                      <div className="sticky left-0 z-20 bg-[#FAFAFA] border-r border-slate-200 px-4 py-2.5 flex items-center">
                        <span className="text-[10.5px] font-bold uppercase tracking-widest text-slate-500">
                          APARTMENT
                        </span>
                      </div>

                      {daysArray.map((d) => {
                        const dow = (firstDow + d - 1) % 7;
                        const isWeekend = dow === 0 || dow === 6;
                        return (
                          <div
                            key={d}
                            className={`flex flex-col items-center justify-center py-2 border-r border-slate-100 last:border-r-0 tabular-nums ${
                              isWeekend ? "bg-slate-100/75" : ""
                            }`}
                          >
                            <span className="font-mono text-[11.5px] font-semibold text-slate-800 leading-tight">
                              {d}
                            </span>
                            <span className="text-[9.5px] font-medium uppercase text-slate-400 mt-0.5">
                              {dayAbbr[dow]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rows */}
                    {previewApartments.map((apt) => {
                      const rowItems = isNov2026
                        ? previewBookings.filter((b) => b.apartment === apt)
                        : [];

                      return (
                        <div
                          key={apt}
                          className="group relative grid border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors"
                          style={{
                            gridTemplateColumns: `165px repeat(${daysInMonth}, minmax(31px, 1fr))`,
                            height: "48px",
                          }}
                        >
                          <div className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 px-4 flex items-center transition-colors">
                            <span className="text-[13px] font-semibold text-slate-800">
                              {apt}
                            </span>
                          </div>

                          {daysArray.map((d) => {
                            const dow = (firstDow + d - 1) % 7;
                            const isWeekend = dow === 0 || dow === 6;
                            return (
                              <div
                                key={d}
                                className={`border-r border-slate-100/90 last:border-r-0 h-full ${
                                  isWeekend ? "bg-[#F8F9FB]" : ""
                                }`}
                              />
                            );
                          })}

                          {/* Overlay Booking Bars */}
                          <div
                            className="pointer-events-none absolute inset-y-0 right-0 left-[165px] grid items-center"
                            style={{
                              gridTemplateColumns: `repeat(${daysInMonth}, minmax(31px, 1fr))`,
                            }}
                          >
                            {rowItems.map((b, idx) => {
                              if (b.type === "paid") {
                                return (
                                  <div
                                    key={idx}
                                    onMouseEnter={(e) =>
                                      handleMouseMove(e, b.tooltip)
                                    }
                                    onMouseMove={(e) =>
                                      handleMouseMove(e, b.tooltip)
                                    }
                                    onMouseLeave={handleMouseLeave}
                                    style={{
                                      gridColumn: `${b.startCol} / span ${b.span}`,
                                    }}
                                    className="pointer-events-auto mx-0.5 h-8 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 border-l-4 border-l-[#16A34A] text-emerald-950 text-[11.5px] font-semibold flex items-center justify-between transition-all cursor-pointer shadow-xs"
                                  >
                                    <span className="shrink-0 text-[#16A34A] font-bold">
                                      {b.leftLabel}
                                    </span>
                                    <span className="mx-auto pr-4 truncate">
                                      {b.centerLabel}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={idx}
                                  onMouseEnter={(e) =>
                                    handleMouseMove(e, b.tooltip)
                                  }
                                  onMouseMove={(e) =>
                                    handleMouseMove(e, b.tooltip)
                                  }
                                  onMouseLeave={handleMouseLeave}
                                  style={{
                                    gridColumn: `${b.startCol} / span ${b.span}`,
                                  }}
                                  className="pointer-events-auto mx-0.5 h-8 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 border-l-4 border-l-[#D97706] text-amber-950 text-[11px] font-semibold flex items-center overflow-hidden whitespace-nowrap transition-all cursor-pointer shadow-xs"
                                >
                                  <span className="truncate">{b.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Interactive Hint Bar */}
                <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500">
                  <span>
                    Hover over any booking bar to inspect guest stay details and
                    payment status.
                  </span>
                  <Link
                    href="/signup"
                    className="font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    Try with your own apartments →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CORE VALUE PILLARS / FEATURES SECTION ── */}
        <section id="features" className="py-16 sm:py-24 bg-[#F6F7F9]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            {/* Section Header */}
            <div className="max-w-2xl mb-12 sm:mb-14">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F766E] mb-2.5">
                BUILT FOR CLARITY &amp; SPEED
              </p>
              <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] text-[#182230] tracking-tight leading-tight">
                Everything you need to run multi-unit apartments without
                spreadsheet chaos.
              </h2>
            </div>

            {/* 3-Column Architectural Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: Visual 30-Day Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-[0_2px_10px_rgba(24,34,48,0.03)] hover:border-teal-600/40 hover:shadow-[0_10px_30px_rgba(24,34,48,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/80 text-[#0F766E] flex items-center justify-center mb-6">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <rect
                        x="7"
                        y="14"
                        width="6"
                        height="3"
                        rx="1"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[19px] text-[#182230] mb-3">
                    Visual 30-Day Timeline
                  </h3>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed">
                    See occupancy across all apartments—from Charlotte and Houston
                    to New York and San Francisco—at a single glance without messy
                    spreadsheets or overlapping dates.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-[12.5px] font-semibold text-[#0F766E]">
                  <span>Zero double-booking conflicts</span>
                </div>
              </div>

              {/* Card 2: Instant Balance & Payment Status */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-[0_2px_10px_rgba(24,34,48,0.03)] hover:border-teal-600/40 hover:shadow-[0_10px_30px_rgba(24,34,48,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#16A34A] flex items-center justify-center mb-6">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[19px] text-[#182230] mb-3">
                    Instant Balance &amp; Payment Status
                  </h3>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed">
                    Color-coded{" "}
                    <span className="font-semibold text-[#16A34A]">Paid ✓</span>{" "}
                    and{" "}
                    <span className="font-semibold text-[#D97706]">
                      Owes balance
                    </span>{" "}
                    indicators highlight exact unpaid guest amounts right on the
                    timeline so balances never slip through the cracks.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3 text-[12px] font-semibold">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Paid ✓
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    Owes NGN 230,000.00
                  </span>
                </div>
              </div>

              {/* Card 3: Multi-Currency & Local Timezone Ready */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 shadow-[0_2px_10px_rgba(24,34,48,0.03)] hover:border-teal-600/40 hover:shadow-[0_10px_30px_rgba(24,34,48,0.06)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-[#182230] flex items-center justify-center mb-6">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[19px] text-[#182230] mb-3">
                    Multi-Currency &amp; Local Timezone Ready
                  </h3>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed">
                    Native support for{" "}
                    <span className="font-mono text-[13px] font-semibold text-slate-800">
                      NGN (Africa/Lagos)
                    </span>{" "}
                    and global currencies with automatic check-in date alignment
                    and real-time sync timestamps.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-[12.5px] font-mono font-semibold text-slate-600">
                  <span>NGN · Africa/Lagos · Synced</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS SECTION (3 Simple Numbered Steps) ── */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 bg-white border-y border-slate-200/80"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F766E] mb-2.5">
                HOW IT WORKS
              </p>
              <h2 className="font-display font-extrabold text-[28px] sm:text-[36px] text-[#182230] tracking-tight">
                From setup to full visibility in three steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {/* Step 01 */}
              <div className="relative p-7 rounded-2xl bg-[#F6F7F9] border border-slate-200/80">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#182230] text-emerald-400 font-mono font-bold text-[15px] mb-5 shadow-xs">
                  01
                </div>
                <h3 className="font-display font-bold text-[19px] text-[#182230] mb-2.5">
                  Add your property &amp; apartments
                </h3>
                <p className="text-[14.5px] text-slate-600 leading-relaxed">
                  Create your property workspace—like{" "}
                  <span className="font-medium text-slate-800">
                    Kings Crown Apartment
                  </span>
                  —and list every apartment unit, suite, or short-let room in
                  seconds.
                </p>
              </div>

              {/* Step 02 */}
              <div className="relative p-7 rounded-2xl bg-[#F6F7F9] border border-slate-200/80">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#182230] text-emerald-400 font-mono font-bold text-[15px] mb-5 shadow-xs">
                  02
                </div>
                <h3 className="font-display font-bold text-[19px] text-[#182230] mb-2.5">
                  Log guest stays in seconds
                </h3>
                <p className="text-[14.5px] text-slate-600 leading-relaxed">
                  Click{" "}
                  <span className="font-semibold text-[#0F766E]">
                    + New booking
                  </span>{" "}
                  to assign check-in and check-out dates, guest names, and total
                  stay rates directly onto the monthly calendar.
                </p>
              </div>

              {/* Step 03 */}
              <div className="relative p-7 rounded-2xl bg-[#F6F7F9] border border-slate-200/80">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#182230] text-emerald-400 font-mono font-bold text-[15px] mb-5 shadow-xs">
                  03
                </div>
                <h3 className="font-display font-bold text-[19px] text-[#182230] mb-2.5">
                  Track paid stays &amp; pending balances automatically
                </h3>
                <p className="text-[14.5px] text-slate-600 leading-relaxed">
                  Monitor settled reservations in emerald green and spot partial
                  payments in warm amber so your front desk and accounting stay
                  aligned every day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. SIMPLE PRICING / PLAN HIGHLIGHTS + BOTTOM PRE-LOGIN CTA BANNER ── */}
        <section id="pricing" className="py-16 sm:py-24 bg-[#F6F7F9]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            {/* Dark Charcoal-Slate Container (#182230) */}
            <div className="rounded-3xl bg-[#182230] text-white p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
              {/* Subtle decorative teal glow */}
              <div
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0F766E]/25 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-[11.5px] font-bold uppercase tracking-widest">
                    FREE STARTER WORKSPACE INCLUDED
                  </div>
                  <h2 className="font-display font-extrabold text-[28px] sm:text-[38px] leading-tight tracking-tight text-white">
                    Ready to organize your apartment bookings?
                  </h2>
                  <p className="text-[15.5px] sm:text-[17px] text-slate-300 leading-relaxed">
                    Start managing your apartments, guest schedules, and NGN
                    balances in one clean calendar. Free for up to 10
                    apartments—upgrade anytime as your portfolio grows.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
                  <Link
                    href="/signup"
                    className="px-7 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-[15px] font-semibold shadow-lg shadow-black/20 transition-all text-center cursor-pointer"
                  >
                    Sign Up Now
                  </Link>
                  <Link
                    href="/login"
                    className="px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-white text-[15px] font-semibold transition-all text-center cursor-pointer"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 6. MINIMAL FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: BooksCheck Logo + Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#182230] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 15.5l2 2 4.5-4.5" />
              </svg>
            </div>
            <span className="font-display font-bold text-[15px] text-[#182230]">
              BooksCheck
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[13px] text-slate-500">© 2026 BooksCheck</span>
          </div>

          {/* Right: Privacy, Terms, Support Links */}
          <div className="flex items-center gap-6 text-[13px] font-medium text-slate-500">
            <span className="hover:text-[#182230] transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-[#182230] transition-colors cursor-pointer">
              Terms
            </span>
            <span className="hover:text-[#182230] transition-colors cursor-pointer">
              Support
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Tooltip for Interactive Calendar Preview */}
      {tooltip.visible && (
        <div
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          className="fixed z-50 pointer-events-none bg-[#182230] text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
