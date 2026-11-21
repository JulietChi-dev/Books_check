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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Registration</h1>
            <p className="text-sm text-gray-600">
              Welcome, {auth.user.fullName}. Set up your property to start recording bookings.
            </p>
          </div>
          <form action={logOutAction}>
            <button
              type="submit"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <CompanyRegistrationForm />
        </div>
      </div>
    </div>
  );
}
