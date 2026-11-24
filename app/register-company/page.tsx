import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";
import { CompanyRegistrationForm } from "./CompanyRegistrationForm";
import { logOutAction } from "@/app/(auth)/actions";

/**
 * Company Registration Page (PRD 6.4, FR-9, FR-20 to FR-27)
 *
 * Users without a company can only reach this page and logout (FR-9).
 * Logged-in users who already have a company are redirected to Home (FR-14).
 */
export default async function RegisterCompanyPage() {
  const auth = await getCurrentUser();

  if (!auth) {
    redirect("/login");
  }

  // If already registered, redirect to calendar
  if (auth.user.companyId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#182230] flex items-center justify-center shadow-xs">
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
            <div>
              <h1 className="font-display text-2xl font-bold text-[#182230]">Company Registration</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Welcome, {auth.user.fullName}. Set up your property to start recording bookings.
              </p>
            </div>
          </div>
          <form action={logOutAction}>
            <button
              type="submit"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/90">
          <CompanyRegistrationForm />
        </div>
      </div>
    </div>
  );
}
