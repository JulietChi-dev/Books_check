"use client";

import React, { useState, useActionState } from "react";
import { registerCompanyAction, RegisterCompanyResult } from "./actions";

interface ApartmentRowState {
  id: string;
  name: string;
  roomCount: number;
}

export function CompanyRegistrationForm() {
  const [state, formAction, isPending] = useActionState<RegisterCompanyResult | null, FormData>(
    registerCompanyAction,
    null
  );

  const [apartments, setApartments] = useState<ApartmentRowState[]>([
    { id: "apt-1", name: "", roomCount: 1 },
  ]);

  const addApartment = () => {
    if (apartments.length >= 50) return;
    setApartments((prev) => [
      ...prev,
      { id: `apt-${Date.now()}-${Math.random()}`, name: "", roomCount: 1 },
    ]);
  };

  const removeApartment = (id: string) => {
    if (apartments.length <= 1) return;
    setApartments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateApartment = (id: string, field: "name" | "roomCount", value: string | number) => {
    setApartments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {state.error}
        </div>
      )}

      {/* Hidden input carrying dynamic apartments array */}
      <input
        type="hidden"
        name="apartmentsJson"
        value={JSON.stringify(
          apartments.map((a) => ({ name: a.name, roomCount: Number(a.roomCount) }))
        )}
      />

      {/* SECTION 1: Company Details */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[#182230] border-b border-slate-100 pb-2">
          Company Information
        </h2>

        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
            placeholder="e.g. Grand View Suites"
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="country" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              defaultValue="NG"
              required
              className="block w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
            >
              <option value="NG">Nigeria (NG)</option>
              <option value="GH">Ghana (GH)</option>
              <option value="KE">Kenya (KE)</option>
              <option value="ZA">South Africa (ZA)</option>
              <option value="GB">United Kingdom (GB)</option>
              <option value="US">United States (US)</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="NGN"
              required
              className="block w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
            >
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GHS">GHS - Ghanaian Cedi</option>
              <option value="KES">KES - Kenyan Shilling</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeZone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Time zone <span className="text-red-500">*</span>
            </label>
            <select
              id="timeZone"
              name="timeZone"
              defaultValue="Africa/Lagos"
              required
              className="block w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
            >
              <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
              <option value="Africa/Accra">Africa/Accra (UTC+0)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
              <option value="Europe/London">Europe/London (UTC+0/+1)</option>
              <option value="America/New_York">America/New_York (UTC-5/-4)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Address (optional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              maxLength={200}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
              placeholder="12 Marina Road"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              City (optional)
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
              placeholder="Lagos"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Company phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
              placeholder="+234 801 234 5678"
            />
            {state?.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Company email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm text-slate-900"
              placeholder="contact@company.com"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Apartment List */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#182230] border-b border-slate-100 pb-2">
            Apartments / Rental Units
          </h2>
          {/* Helper text FR-26 */}
          <p className="mt-1 text-xs text-slate-500 italic">
            A hotel registers each rentable room as an apartment.
          </p>
        </div>

        {state?.fieldErrors?.apartments && (
          <p className="text-sm text-red-600 font-medium">{state.fieldErrors.apartments}</p>
        )}

        <div className="space-y-3">
          {apartments.map((apt, index) => (
            <div
              key={apt.id}
              className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apartment / Room name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={apt.name}
                  onChange={(e) => updateApartment(apt.id, "name", e.target.value)}
                  placeholder={`e.g. Apartment ${index + 1}`}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg shadow-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
                />
              </div>

              <div className="w-28">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rooms (1-20) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={apt.roomCount}
                  onChange={(e) => updateApartment(apt.id, "roomCount", Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg shadow-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => removeApartment(apt.id)}
                  disabled={apartments.length <= 1}
                  className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={addApartment}
            disabled={apartments.length >= 50}
            className="inline-flex items-center px-3.5 py-2 border border-slate-300 shadow-xs text-xs font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            + Add apartment
          </button>
          <span className="text-xs text-slate-400 font-mono">{apartments.length} / 50 apartments</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm shadow-teal-900/15 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? "Creating company..." : "Register Company & Continue"}
        </button>
      </div>
    </form>
  );
}
