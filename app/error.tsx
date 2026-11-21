"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="text-sm text-gray-600">
          An unexpected error occurred. Please try again or return to the login page.
        </p>
        {process.env.NODE_ENV !== "production" && error?.message && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded text-left overflow-auto font-mono max-h-32">
            {error.message}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/login"
            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
