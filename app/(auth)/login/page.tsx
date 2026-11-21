"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { logInAction, ActionResult } from "../actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    logInAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Sign in to BooksCheck
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email and password to access your bookings
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? "Signing in..." : "Log in"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
