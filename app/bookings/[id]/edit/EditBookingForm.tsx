"use client";

import React, { useState, useEffect, useActionState, useTransition } from "react";
import Link from "next/link";
import { updateBookingAction, UpdateBookingResult } from "@/app/bookings/actions";
import { calculateBalance, countNights, formatDisplayDate } from "@/lib/money-and-dates";

interface ApartmentOption {
  id: string;
  name: string;
}

interface EditBookingFormProps {
  bookingId: string;
  loadedUpdatedAt: string; // ISO string — sent back to detect edit conflicts (FR-61)
  apartments: ApartmentOption[];
  currency: string;
  initial: {
    apartmentId: string;
    guestName: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    totalPrice: string;
    amountPaid: string;
    notes: string;
  };
}

/**
 * Edit Booking Form (PRD FR-63, FR-58, FR-61, FR-64)
 *
 * Reuses the same field set as New booking.
 * Sends loadedUpdatedAt for optimistic concurrency (FR-61).
 * Unusual-date confirmation follows same FR-46 rules.
 * Clash check on the server excludes this booking (FR-58).
 */
export function EditBookingForm({
  bookingId,
  loadedUpdatedAt,
  apartments,
  currency,
  initial,
}: EditBookingFormProps) {
  const [apartmentId, setApartmentId] = useState(initial.apartmentId);
  const [guestName, setGuestName] = useState(initial.guestName);
  const [guestPhone, setGuestPhone] = useState(initial.guestPhone);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [totalPrice, setTotalPrice] = useState(initial.totalPrice);
  const [amountPaid, setAmountPaid] = useState(initial.amountPaid);
  const [notes, setNotes] = useState(initial.notes);

  // Live balance (FR-49)
  const [balance, setBalance] = useState("0.00");
  useEffect(() => {
    try {
      setBalance(calculateBalance(totalPrice, amountPaid));
    } catch {
      setBalance("0.00");
    }
  }, [totalPrice, amountPaid]);

  // Unusual dates modal (FR-46)
  const [showUnusualModal, setShowUnusualModal] = useState(false);
  const [unusualPrompt, setUnusualPrompt] = useState("");
  const [confirmedUnusualDates, setConfirmedUnusualDates] = useState(false);

  const [state, formAction, isPending] = useActionState<UpdateBookingResult | null, FormData>(
    updateBookingAction,
    null
  );

  const [networkError, setNetworkError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNetworkError(null);

    // FR-46: unusual-date warning (same rule as create)
    if (checkIn && checkOut && !confirmedUnusualDates) {
      try {
        const nights = countNights(checkIn, checkOut);
        const checkInDate = new Date(checkIn);
        const today = new Date();
        const diffDays = Math.round(
          (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (nights > 60 || Math.abs(diffDays) > 365) {
          const displayDate = formatDisplayDate(checkIn);
          setUnusualPrompt(
            `Check the dates. This stay starts on ${displayDate} and lasts ${nights} nights. Save anyway?`
          );
          setShowUnusualModal(true);
          return;
        }
      } catch {
        // fall through to server validation
      }
    }

    submitForm(confirmedUnusualDates);
  };

  const submitForm = (unusualConfirmed: boolean) => {
    const fd = new FormData();
    fd.append("bookingId", bookingId);
    fd.append("loadedUpdatedAt", loadedUpdatedAt);
    fd.append("apartmentId", apartmentId);
    fd.append("guestName", guestName);
    fd.append("guestPhone", guestPhone);
    fd.append("checkIn", checkIn);
    fd.append("checkOut", checkOut);
    fd.append("totalPrice", totalPrice);
    fd.append("amountPaid", amountPaid);
    fd.append("notes", notes);
    fd.append("confirmedUnusualDates", unusualConfirmed ? "true" : "false");

    startTransition(async () => {
      try {
        await formAction(fd);
      } catch (err: unknown) {
        // FR-53-equivalent: network errors keep form values
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200/90 space-y-4">
            <h3 className="font-display text-lg font-bold text-[#182230]">Confirm Booking Dates</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{unusualPrompt}</p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUnusualModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnusualModal(false);
                  setConfirmedUnusualDates(true);
                  submitForm(true);
                }}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
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
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {networkError}
          </div>
        )}
        {state?.error && !networkError && (
          <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {state.error}
          </div>
        )}

        {/* Apartment Selection */}
        <div>
          <label htmlFor="apartmentId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Apartment <span className="text-red-500">*</span>
          </label>
          <select
            id="apartmentId"
            name="apartmentId"
            value={apartmentId}
            onChange={(e) => setApartmentId(e.target.value)}
            required
            className="block w-full px-3.5 py-2.5 border border-slate-300 bg-white rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
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
            <label htmlFor="guestName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
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
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
            />
            {state?.fieldErrors?.guestName && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.guestName}</p>
            )}
          </div>

          <div>
            <label htmlFor="guestPhone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Guest phone <span className="text-red-500">*</span>
            </label>
            <input
              id="guestPhone"
              name="guestPhone"
              type="tel"
              required
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
            />
            {state?.fieldErrors?.guestPhone && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.guestPhone}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="checkIn" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Check-in date <span className="text-red-500">*</span>
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
            />
            {state?.fieldErrors?.checkIn && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.checkIn}</p>
            )}
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Check-out date <span className="text-red-500">*</span>
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
            />
            {state?.fieldErrors?.checkOut && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.checkOut}</p>
            )}
          </div>
        </div>

        {/* Money: Total Price, Amount Paid, Live Balance */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="totalPrice" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Total price ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              id="totalPrice"
              name="totalPrice"
              type="text"
              required
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
              placeholder="0.00"
            />
            {state?.fieldErrors?.totalPrice && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.totalPrice}</p>
            )}
          </div>

          <div>
            <label htmlFor="amountPaid" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Amount paid ({currency})
            </label>
            <input
              id="amountPaid"
              name="amountPaid"
              type="text"
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
              placeholder="0.00"
            />
            {state?.fieldErrors?.amountPaid && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.amountPaid}</p>
            )}
          </div>

          {/* Read-only live balance (FR-49) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Balance ({currency})
            </label>
            <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl sm:text-sm font-bold font-mono text-slate-900">
              {balance}
            </div>
          </div>
        </div>

        {/* Notes (FR-42) */}
        <div>
          <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-xs placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/15 focus:border-[#0F766E] sm:text-sm"
            placeholder="Guest requests, arrival notes..."
          />
          <p className="mt-1 text-xs text-slate-500">Do not enter ID or card numbers.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href={`/bookings/${bookingId}`}
            className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Back to booking
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center py-2.5 px-6 rounded-xl shadow-sm shadow-teal-900/15 text-sm font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] active:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}
