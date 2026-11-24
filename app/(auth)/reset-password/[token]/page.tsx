import React from "react";
import Link from "next/link";
import { validatePasswordResetToken } from "@/lib/auth/tokens";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Reset Password Page (PRD 6.3, FR-17 to FR-19, 8.4)
 * Loads NO third-party scripts (security hardening for token URLs).
 */
export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  const validation = await validatePasswordResetToken(token);

  if (!validation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/90 text-center space-y-5">
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
          <h1 className="font-display text-xl font-bold text-[#182230]">Invalid or Expired Link</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            This password reset link is invalid or has expired. Reset links expire after 60 minutes and work once.
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold shadow-sm transition-all"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200/90 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-5">
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
          <h1 className="font-display text-2xl font-bold text-[#182230]">Set new password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Must be 8 to 128 characters
          </p>
        </div>

        <ResetPasswordForm token={token} />

        <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
          <Link href="/login" className="font-semibold text-[#0F766E] hover:text-[#115E59]">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
