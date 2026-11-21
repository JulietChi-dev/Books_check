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
          className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 font-medium"
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
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Company Information
        </h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g. Grand View Suites"
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              defaultValue="NG"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="NGN"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
              Time zone <span className="text-red-500">*</span>
            </label>
            <select
              id="timeZone"
              name="timeZone"
              defaultValue="Africa/Lagos"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address (optional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              maxLength={200}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="12 Marina Road"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City (optional)
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Lagos"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Company phone (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="+234 801 234 5678"
            />
            {state?.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Company email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="contact@company.com"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Apartment List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Apartments / Rental Units
          </h2>
          {/* Helper text FR-26 */}
          <p className="mt-1 text-sm text-gray-500 italic">
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
              className="flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700">
                  Apartment / Room name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={apt.name}
                  onChange={(e) => updateApartment(apt.id, "name", e.target.value)}
                  placeholder={`e.g. Apartment ${index + 1}`}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="w-28">
                <label className="block text-xs font-medium text-gray-700">
                  Rooms (1-20) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={apt.roomCount}
                  onChange={(e) => updateApartment(apt.id, "roomCount", Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => removeApartment(apt.id)}
                  disabled={apartments.length <= 1}
                  className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
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
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            + Add apartment
          </button>
          <span className="text-xs text-gray-500">{apartments.length} / 50 apartments</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? "Creating company..." : "Register Company & Continue"}
        </button>
      </div>
    </form>
  );
}
