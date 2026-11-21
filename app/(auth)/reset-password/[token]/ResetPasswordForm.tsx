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
          className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="8 to 128 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={128}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Re-enter new password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
