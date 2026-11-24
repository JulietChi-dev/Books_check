import React from "react";
import Link from "next/link";
import { consumeEmailVerificationToken } from "@/lib/auth/tokens";

interface VerifyEmailPageProps {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Verify Email Route Page (PRD 6.1, FR-8, 8.4)
 * Loads NO third-party scripts (PRD 8.4).
 */
export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = await params;
  const result = await consumeEmailVerificationToken(token);

  if (!result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-12">
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
          <h1 className="font-display text-xl font-bold text-[#182230]">Verification Failed</h1>
          <p className="text-sm text-red-600 font-medium">{result.error}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verification links expire after 24 hours and work once. You can request a new link from your dashboard.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isChangeEmail = result.kind === "CHANGE_EMAIL";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-12">
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
        <h1 className="font-display text-2xl font-bold text-[#182230]">
          {isChangeEmail ? "Login Email Updated" : "Email Verified"}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {isChangeEmail
            ? "Your login email has been updated and verified successfully."
            : "Your email address has been successfully verified."}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Continue to Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
