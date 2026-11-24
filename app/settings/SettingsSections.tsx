"use client";

import { useActionState, useTransition, useState } from "react";
import {
  updateCompanyAction,
  updateApartmentAction,
  createApartmentAction,
  deleteApartmentAction,
  changePasswordAction,
  changeEmailAction,
  SettingsResult,
} from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium flex items-center gap-2">
      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium flex items-center gap-2">
      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
      {message}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

const inputClass =
  "mt-1.5 block w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-[#0F766E] transition shadow-xs";
const labelClass = "block text-sm font-medium text-slate-700";
const btnPrimary =
  "px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 text-white text-sm font-semibold rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 transition";
const btnDanger =
  "px-3.5 py-2.5 border border-red-200 bg-red-50 text-red-700 text-sm font-medium rounded-xl hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 transition";

// ─────────────────────────────────────────────────────────────────────────────
// TIMEZONES & COUNTRIES (abbreviated list for MVP)
// ─────────────────────────────────────────────────────────────────────────────

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "UTC",
];

const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US Dollar" },
];

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IN", name: "India" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Company Details Section (FR-80)
// ─────────────────────────────────────────────────────────────────────────────

interface CompanyFormProps {
  company: {
    name: string;
    country: string;
    currency: string;
    timeZone: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
  };
  hasBookings: boolean;
}

export function CompanyForm({ company, hasBookings }: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    updateCompanyAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.success && <SuccessBanner message="Company details saved." />}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>Company name *</label>
          <input id="name" name="name" type="text" required defaultValue={company.name} className={inputClass} />
          <FieldError msg={state?.fieldErrors?.name} />
        </div>

        <div>
          <label htmlFor="timeZone" className={labelClass}>Time zone *</label>
          <select id="timeZone" name="timeZone" defaultValue={company.timeZone} className={inputClass}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <FieldError msg={state?.fieldErrors?.timeZone} />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>Country *</label>
          <select id="country" name="country" defaultValue={company.country} className={inputClass}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <FieldError msg={state?.fieldErrors?.country} />
        </div>

        <div>
          <label htmlFor="currency" className={labelClass}>
            Currency * {hasBookings && <span className="text-xs text-slate-500 font-normal ml-1">(locked — bookings exist)</span>}
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={company.currency}
            disabled={hasBookings}
            className={`${inputClass} ${hasBookings ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </select>
          {hasBookings && (
            <input type="hidden" name="currency" value={company.currency} />
          )}
          <FieldError msg={state?.fieldErrors?.currency} />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>Address</label>
          <input id="address" name="address" type="text" defaultValue={company.address ?? ""} maxLength={200} className={inputClass} />
          <FieldError msg={state?.fieldErrors?.address} />
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>City</label>
          <input id="city" name="city" type="text" defaultValue={company.city ?? ""} className={inputClass} />
          <FieldError msg={state?.fieldErrors?.city} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Company phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={company.phone ?? ""} className={inputClass} placeholder="+234 801 234 5678" />
          <FieldError msg={state?.fieldErrors?.phone} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Company email</label>
          <input id="email" name="email" type="email" defaultValue={company.email ?? ""} className={inputClass} placeholder="info@example.com" />
          <FieldError msg={state?.fieldErrors?.email} />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : "Save company details"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Apartment Row (rename + room count) (FR-81)
// Linear Grid: Apartment Name (1fr) | Rooms (96px) | Save (auto) | Action (96px)
// ─────────────────────────────────────────────────────────────────────────────

interface ApartmentRowProps {
  id: string;
  name: string;
  roomCount: number;
  bookingCount: number;
}

export function ApartmentRow({ id, name, roomCount, bookingCount }: ApartmentRowProps) {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    updateApartmentAction,
    null
  );
  const [deletePending, startDeleteTransition] = useTransition();
  const [deleteState, setDeleteState] = useState<SettingsResult | null>(null);

  function handleDelete() {
    if (bookingCount > 0) {
      setDeleteState({
        success: false,
        error: `Cannot remove "${name}" — it has ${bookingCount} booking${bookingCount !== 1 ? "s" : ""}. Cancel and delete all bookings first.`,
      });
      return;
    }
    if (!window.confirm(`Remove apartment "${name}"? This cannot be undone.`)) return;
    startDeleteTransition(async () => {
      const result = await deleteApartmentAction(id);
      setDeleteState(result);
    });
  }

  return (
    <div className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/50 space-y-3">
      {state?.success && <SuccessBanner message="Apartment updated." />}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}
      {deleteState?.error && <ErrorBanner message={deleteState.error} />}

      <form action={formAction} className="grid grid-cols-1 sm:grid-cols-[1fr_96px_auto_96px] items-end gap-3">
        <input type="hidden" name="apartmentId" value={id} />

        <div>
          <label htmlFor={`apt-name-${id}`} className={labelClass}>Apartment name *</label>
          <input
            id={`apt-name-${id}`}
            name="name"
            type="text"
            required
            defaultValue={name}
            maxLength={60}
            className={inputClass}
          />
          <FieldError msg={state?.fieldErrors?.name} />
        </div>

        <div>
          <label htmlFor={`apt-rooms-${id}`} className={labelClass}>Rooms *</label>
          <input
            id={`apt-rooms-${id}`}
            name="roomCount"
            type="number"
            required
            min={1}
            max={20}
            defaultValue={roomCount}
            className={inputClass}
          />
          <FieldError msg={state?.fieldErrors?.roomCount} />
        </div>

        <div>
          <button type="submit" disabled={isPending} className={`${btnPrimary} w-full sm:w-auto px-4 text-center whitespace-nowrap`}>
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="flex items-center justify-start h-[42px]">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePending}
            className={`${btnDanger} w-full text-center whitespace-nowrap`}
          >
            {deletePending ? "Removing…" : "Remove"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Apartment Form (FR-82)
// ─────────────────────────────────────────────────────────────────────────────

export function AddApartmentForm({ apartmentCount }: { apartmentCount: number }) {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    createApartmentAction,
    null
  );

  return (
    <form action={formAction} className="pt-4 border-t border-slate-200 space-y-3">
      {state?.success && <SuccessBanner message="Apartment added." />}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_96px_auto_96px] items-end gap-3">
        <div>
          <label htmlFor="new-apt-name" className={labelClass}>New apartment name *</label>
          <input
            id="new-apt-name"
            name="name"
            type="text"
            required
            maxLength={60}
            className={inputClass}
            placeholder="e.g. Room 101"
          />
          <FieldError msg={state?.fieldErrors?.name} />
        </div>

        <div>
          <label htmlFor="new-apt-rooms" className={labelClass}>Rooms *</label>
          <input
            id="new-apt-rooms"
            name="roomCount"
            type="number"
            required
            min={1}
            max={20}
            defaultValue={1}
            className={inputClass}
          />
          <FieldError msg={state?.fieldErrors?.roomCount} />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending || apartmentCount >= 50}
            className={`${btnPrimary} w-full sm:w-auto px-4 whitespace-nowrap`}
          >
            {isPending ? "Adding…" : "+ Add apartment"}
          </button>
        </div>
      </div>

      {apartmentCount >= 50 && (
        <p className="text-xs text-amber-700">Maximum of 50 apartments reached.</p>
      )}
      <p className="text-xs text-slate-500">
        A hotel registers each rentable room as an apartment.
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Password Form (FR-84)
// ─────────────────────────────────────────────────────────────────────────────

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    changePasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.success && <SuccessBanner message="Password changed. All other sessions have been signed out." />}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}

      <div>
        <label htmlFor="currentPassword" className={labelClass}>Current password *</label>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
        <FieldError msg={state?.fieldErrors?.currentPassword} />
      </div>

      <div>
        <label htmlFor="newPassword" className={labelClass}>New password *</label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">8 to 128 characters.</p>
        <FieldError msg={state?.fieldErrors?.newPassword} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>Confirm new password *</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className={inputClass} />
        <FieldError msg={state?.fieldErrors?.confirmPassword} />
      </div>

      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Login Email Form (FR-85)
// ─────────────────────────────────────────────────────────────────────────────

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState<SettingsResult | null, FormData>(
    changeEmailAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.success && (
        <SuccessBanner message="Verification email sent to your new address. Your old email stays active until you verify the new one." />
      )}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}

      <div>
        <p className="text-sm text-slate-600">
          Current login email: <span className="font-semibold text-slate-900">{currentEmail}</span>
        </p>
      </div>

      <div>
        <label htmlFor="newEmail" className={labelClass}>New email address *</label>
        <input id="newEmail" name="newEmail" type="email" required autoComplete="email" className={inputClass} />
        <FieldError msg={state?.fieldErrors?.newEmail} />
      </div>

      <div>
        <label htmlFor="currentPasswordEmail" className={labelClass}>Current password *</label>
        <input id="currentPasswordEmail" name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
        <FieldError msg={state?.fieldErrors?.currentPassword} />
      </div>

      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "Sending…" : "Send verification email"}
      </button>
    </form>
  );
}
