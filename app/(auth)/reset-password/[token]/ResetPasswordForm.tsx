"use client";

import React, { useActionState } from "react";
import { resetPasswordAction, ActionResult } from "../../actions";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
        >
          New password
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
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={128}
          className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
          placeholder="Re-enter new password"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm shadow-teal-900/15 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? "Saving..." : "Save new password"}
        </button>
      </div>
    </form>
  );
}
