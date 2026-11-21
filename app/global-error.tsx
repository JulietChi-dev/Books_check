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
      <body className="antialiased min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">BooksCheck</h1>
          <p className="text-sm text-gray-600">
            A critical error occurred while loading the application.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              Reload
            </button>
            <Link
              href="/login"
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
