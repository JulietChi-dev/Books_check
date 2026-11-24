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
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/90">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#182230] flex items-center justify-center shadow-xs group-hover:bg-[#0F766E] transition-colors">
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
              <span className="font-display font-extrabold text-[22px] tracking-tight text-[#182230]">
                BooksCheck
              </span>
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#182230]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Register to manage hotel and serviced apartment bookings
          </p>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
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
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
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
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
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
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
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
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
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
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
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
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
              placeholder="Re-enter password"
            />
            {state?.fieldErrors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start pt-1">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="focus:ring-teal-500 h-4 w-4 text-[#0F766E] border-slate-300 rounded"
              />
            </div>
            <div className="ml-3 text-xs sm:text-sm">
              <label htmlFor="terms" className="text-slate-600">
                I accept the terms and privacy notice
              </label>
              {state?.fieldErrors?.terms && (
                <p className="mt-1 text-xs text-red-600">{state.fieldErrors.terms}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm shadow-teal-900/15 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0F766E] hover:text-[#115E59]"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
