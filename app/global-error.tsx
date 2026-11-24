"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F6F7F9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/90 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#182230] flex items-center justify-center shadow-xs">
              <svg
                className="w-5 h-5 text-emerald-400"
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
          </div>
          <h1 className="font-display text-2xl font-bold text-[#182230]">BooksCheck</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            A critical error occurred while loading the application.
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Reload
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
