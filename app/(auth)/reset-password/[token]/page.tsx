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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Invalid or Expired Link</h1>
          <p className="text-sm text-gray-600">
            This password reset link is invalid or has expired. Reset links expire after 60 minutes and work once.
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Set new password</h1>
          <p className="mt-1 text-sm text-gray-600 text-center">
            Must be 8 to 128 characters
          </p>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
