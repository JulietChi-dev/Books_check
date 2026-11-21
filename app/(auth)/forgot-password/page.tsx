"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, ActionResult } from "../actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email to receive a password reset link
          </p>
        </div>

        {state?.message && (
          <div
            role="status"
            className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800"
          >
            {state.message}
          </div>
        )}

        {state?.error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPending ? "Sending link..." : "Send reset link"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
