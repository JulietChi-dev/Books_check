"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signUpAction, ActionResult } from "../actions";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    signUpAction,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Register to manage hotel and serviced apartment bookings
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-medium"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={80}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. John Doe"
            />
            {state?.fieldErrors?.fullName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email */}
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
            {state?.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="8 to 128 characters"
            />
            {state?.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              maxLength={128}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Re-enter password"
            />
            {state?.fieldErrors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I accept the terms and privacy notice
              </label>
              {state?.fieldErrors?.terms && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.terms}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
