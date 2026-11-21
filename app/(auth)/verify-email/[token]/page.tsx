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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
          <h1 className="text-xl font-bold text-gray-900">Verification Failed</h1>
          <p className="text-sm text-red-600">{result.error}</p>
          <p className="text-xs text-gray-500">
            Verification links expire after 24 hours and work once. You can request a new link from your dashboard.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isChangeEmail ? "Login Email Updated" : "Email Verified"}
        </h1>
        <p className="text-sm text-gray-600">
          {isChangeEmail
            ? "Your login email has been updated and verified successfully."
            : "Your email address has been successfully verified."}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
          >
            Continue to Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
