"use client";

import React, { useState, useEffect, useActionState, useTransition } from "react";
import Link from "next/link";
import { createBookingAction, CreateBookingResult } from "../actions";
import { calculateBalance, countNights, formatDisplayDate } from "@/lib/money-and-dates";

interface ApartmentOption {
  id: string;
  name: string;
}

interface NewBookingFormProps {
  apartments: ApartmentOption[];
  currency: string;
  initialApartmentId?: string;
  initialCheckIn?: string;
}

export function NewBookingForm({
  apartments,
  currency,
  initialApartmentId,
  initialCheckIn,
}: NewBookingFormProps) {
  // Generate unique requestId on form open (FR-52)
  const [requestId] = useState<string>(() => crypto.randomUUID());
  const [loadTime] = useState<number>(() => Date.now());

  // Form field states
  const [apartmentId, setApartmentId] = useState(initialApartmentId || (apartments[0]?.id ?? ""));
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [checkIn, setCheckIn] = useState(initialCheckIn || "");
  const [checkOut, setCheckOut] = useState(() => {
    if (initialCheckIn) {
      const d = new Date(initialCheckIn);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    }
    return "";
  });
  const [totalPrice, setTotalPrice] = useState("0.00");
  const [amountPaid, setAmountPaid] = useState("0.00");
  const [notes, setNotes] = useState("");

  // Live balance computed via exact decimal arithmetic (FR-49)
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    try {
      setBalance(calculateBalance(totalPrice, amountPaid));
    } catch {
      setBalance("0.00");
    }
  }, [totalPrice, amountPaid]);

  // Unusual dates confirmation dialog state (FR-46)
  const [showUnusualModal, setShowUnusualModal] = useState(false);
  const [unusualPrompt, setUnusualPrompt] = useState("");
  const [confirmedUnusualDates, setConfirmedUnusualDates] = useState(false);

  const [state, formAction, isPending] = useActionState<CreateBookingResult | null, FormData>(
    createBookingAction,
    null
  );

  const [networkError, setNetworkError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNetworkError(null);

    // Check FR-46: > 60 nights or check-in > 365 days from today
    if (checkIn && checkOut && !confirmedUnusualDates) {
      try {
        const nights = countNights(checkIn, checkOut);
        const checkInDate = new Date(checkIn);
        const today = new Date();
        const diffDays = Math.round((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (nights > 60 || Math.abs(diffDays) > 365) {
          const displayDate = formatDisplayDate(checkIn);
          setUnusualPrompt(`Check the dates. This stay starts on ${displayDate} and lasts ${nights} nights. Save anyway?`);
          setShowUnusualModal(true);
          return;
        }
      } catch {
        // Fall through to normal server validation
      }
    }

    submitForm(confirmedUnusualDates);
  };

  const submitForm = (unusualConfirmed: boolean) => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - loadTime) / 1000));

    const fd = new FormData();
    fd.append("apartmentId", apartmentId);
    fd.append("guestName", guestName);
    fd.append("guestPhone", guestPhone);
    fd.append("checkIn", checkIn);
    fd.append("checkOut", checkOut);
    fd.append("totalPrice", totalPrice);
    fd.append("amountPaid", amountPaid);
    fd.append("notes", notes);
    fd.append("requestId", requestId);
    fd.append("entrySeconds", elapsedSeconds.toString());
    fd.append("confirmedUnusualDates", unusualConfirmed ? "true" : "false");

    startTransition(async () => {
      try {
        await formAction(fd);
      } catch (err: unknown) {
        // FR-53: on network failure, form keeps its values
        console.error("Network or submission error:", err);
        setNetworkError("Could not save. Check your connection and try again.");
      }
    });
  };

  return (
    <>
      {/* Unusual Dates Confirmation Dialog (FR-46) */}
      {showUnusualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Confirm Booking Dates</h3>
            <p className="text-sm text-gray-600">{unusualPrompt}</p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnusualModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnusualModal(false);
                  setConfirmedUnusualDates(true);
                  submitForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Error Banners */}
        {networkError && (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {networkError}
          </div>
        )}

        {state?.error && !networkError && (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Apartment Selection */}
        <div>
          <label htmlFor="apartmentId" className="block text-sm font-medium text-gray-700">
            Apartment <span className="text-red-500">*</span>
          </label>
          <select
            id="apartmentId"
            name="apartmentId"
            value={apartmentId}
            onChange={(e) => setApartmentId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.id}>
                {apt.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.apartmentId && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.apartmentId}</p>
          )}
        </div>

        {/* Guest Name & Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
              Guest name <span className="text-red-500">*</span>
            </label>
            <input
              id="guestName"
              name="guestName"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Mary Okon"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {state?.fieldErrors?.guestName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.guestName}</p>
            )}
          </div>

          <div>
            <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
              Guest phone <span className="text-red-500">*</span>
            </label>
            <input
              id="guestPhone"
              name="guestPhone"
              type="tel"
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {state?.fieldErrors?.guestPhone && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.guestPhone}</p>
            )}
          </div>
        </div>

        {/* Check-In and Check-Out Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">
              Check-in date <span className="text-red-500">*</span>
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {state?.fieldErrors?.checkIn && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.checkIn}</p>
            )}
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">
              Check-out date <span className="text-red-500">*</span>
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {state?.fieldErrors?.checkOut && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.checkOut}</p>
            )}
          </div>
        </div>

        {/* Money Fields: Total Price, Amount Paid, Live Balance */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700">
              Total price ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              id="totalPrice"
              name="totalPrice"
              type="text"
              required
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
            />
            {state?.fieldErrors?.totalPrice && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.totalPrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
              Amount paid ({currency})
            </label>
            <input
              id="amountPaid"
              name="amountPaid"
              type="text"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
            />
            {state?.fieldErrors?.amountPaid && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.amountPaid}</p>
            )}
          </div>

          {/* Read-only Live Balance (FR-49) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Balance ({currency})
            </label>
            <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md sm:text-sm font-semibold text-gray-900">
              {balance}
            </div>
          </div>
        </div>

        {/* Notes with helper text FR-42 */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Guest requests, arrival notes..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Do not enter ID or card numbers.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save booking"}
          </button>
        </div>
      </form>
    </>
  );
}
