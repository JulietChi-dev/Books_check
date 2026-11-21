"use client";

import React, { useState } from "react";
import { resendVerificationAction } from "@/app/(auth)/actions";

interface UnverifiedEmailBannerProps {
  email: string;
}

/**
 * Unverified Email Banner (PRD FR-8)
 *
 * Appears when user is logged in but email is not yet verified.
 * Reads: "Verify your email" with a "Resend" link.
 * Does NOT block any feature.
 */
export function UnverifiedEmailBanner({ email }: UnverifiedEmailBannerProps) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResending(true);
    setMessage(null);
    try {
      const result = await resendVerificationAction();
      if (result.success) {
        setMessage(result.message || "Verification email sent.");
      } else {
        setMessage(result.error || "Could not resend email. Try again later.");
      }
    } catch {
      setMessage("Could not resend email. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-900 flex items-center justify-between"
    >
      <div className="flex items-center space-x-2">
        <span className="font-medium">Verify your email</span>
        <span className="text-amber-700">({email})</span>
      </div>
      <div className="flex items-center space-x-3">
        {message ? (
          <span className="text-xs text-amber-800 font-medium">{message}</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-amber-800 hover:text-amber-950 underline font-medium text-xs disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        )}
      </div>
    </div>
  );
}
