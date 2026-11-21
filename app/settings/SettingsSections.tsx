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
    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-md">
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
      {message}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

const inputClass =
  "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700";
const btnPrimary =
  "px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition";
const btnDanger =
  "px-3 py-1.5 border border-red-300 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition";

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
            Currency * {hasBookings && <span className="text-xs text-gray-500 font-normal ml-1">(locked — bookings exist)</span>}
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={company.currency}
            disabled={hasBookings}
            className={`${inputClass} ${hasBookings ? "bg-gray-100 text-gray-500" : ""}`}
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
    if (!window.confirm(`Remove apartment "${name}"? This cannot be undone.`)) return;
    startDeleteTransition(async () => {
      const result = await deleteApartmentAction(id);
      setDeleteState(result);
    });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
      {state?.success && <SuccessBanner message="Apartment updated." />}
      {state?.error && !state.success && <ErrorBanner message={state.error} />}
      {deleteState?.error && <ErrorBanner message={deleteState.error} />}

      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="apartmentId" value={id} />

        <div className="flex-1 min-w-[180px]">
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

        <div className="w-28">
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

        <div className="flex items-center gap-2 pb-0.5">
          <button type="submit" disabled={isPending} className={btnPrimary}>
            {isPending ? "Saving…" : "Save"}
          </button>

          {/* FR-83: Delete only when no bookings of any status */}
          {bookingCount === 0 ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              className={btnDanger}
            >
              {deletePending ? "Removing…" : "Remove"}
            </button>
          ) : (
            <span className="text-xs text-gray-500 ml-1">
              {bookingCount} booking{bookingCount !== 1 ? "s" : ""}
            </span>
          )}
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
    <form action={formAction} className="flex flex-wrap items-end gap-3 pt-2 border-t border-gray-200">
      {state?.success && <div className="w-full"><SuccessBanner message="Apartment added." /></div>}
      {state?.error && !state.success && <div className="w-full"><ErrorBanner message={state.error} /></div>}

      <div className="flex-1 min-w-[180px]">
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

      <div className="w-28">
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

      <div className="pb-0.5">
        <button
          type="submit"
          disabled={isPending || apartmentCount >= 50}
          className={btnPrimary}
        >
          {isPending ? "Adding…" : "+ Add apartment"}
        </button>
      </div>

      {apartmentCount >= 50 && (
        <p className="w-full text-xs text-amber-700">Maximum of 50 apartments reached.</p>
      )}
      <p className="w-full text-xs text-gray-500">
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
        <p className="mt-1 text-xs text-gray-500">8 to 128 characters.</p>
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
        <p className="text-sm text-gray-600">
          Current login email: <span className="font-medium text-gray-900">{currentEmail}</span>
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

