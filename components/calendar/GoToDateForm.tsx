"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Go to date control (PRD FR-33, screens.md rule 6)
 * FR-33: navigates to ?month=YYYY-MM for the entered date's month.
 */
export function GoToDateForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dates move as "YYYY-MM-DD" text and are built with Date.UTC, read with
    // UTC getters, and checked by round-trip (FR-90). No local-time parsing.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      setError(true);
      return;
    }
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      setError(true);
      return;
    }
    setError(false);
    router.push(`/?month=${year}-${match[2]}`);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <label htmlFor="go-to-date" className="sr-only">
        Go to date
      </label>
      <input
        id="go-to-date"
        type="date"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(false);
        }}
        aria-invalid={error}
        className={`border rounded-lg px-2 py-1 text-sm h-8 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-[#0F766E] ${
          error ? "border-red-500" : "border-slate-300"
        }`}
      />
      <button
        type="submit"
        className="px-2.5 py-1 h-8 text-sm font-medium border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-colors"
      >
        Go
      </button>
    </form>
  );
}
