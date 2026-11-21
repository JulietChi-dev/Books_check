"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelBookingAction, deleteBookingAction } from "@/app/bookings/actions";

interface BookingDetailsActionsProps {
  bookingId: string;
  status: "ACTIVE" | "CANCELLED";
  canDelete: boolean;
}

/**
 * Booking Details Actions (PRD FR-63, FR-65, FR-66, FR-67)
 * - Edit button (links to /bookings/[id]/edit, disabled/hidden if CANCELLED)
 * - Cancel button with confirmation modal (FR-65)
 * - Delete button (enabled only when amountPaid == 0, FR-67)
 */
export function BookingDetailsActions({
  bookingId,
  status,
  canDelete,
}: BookingDetailsActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCancelled = status === "CANCELLED";

  function handleCancelConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.success) {
        setShowCancelModal(false);
        router.refresh();
      } else {
        setError(result.error || "Failed to cancel booking.");
      }
    });
  }

  function handleDeleteConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBookingAction(bookingId);
      if (!result?.success && result?.error) {
        setError(result.error);
        setShowDeleteModal(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
        >
          ← Back to Calendar
        </Link>

        {!isCancelled && (
          <Link
            href={`/bookings/${bookingId}/edit`}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
          >
            Edit booking
          </Link>
        )}

        {!isCancelled && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={isPending}
            className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-800 rounded-md text-sm font-medium hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition disabled:opacity-50"
          >
            Cancel booking
          </button>
        )}

        {canDelete ? (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={isPending}
            className="px-4 py-2 border border-red-300 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition disabled:opacity-50"
          >
            Delete booking
          </button>
        ) : (
          <div className="relative group inline-block">
            <button
              type="button"
              disabled
              className="px-4 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-md text-sm font-medium cursor-not-allowed"
              title="Cancel instead. Bookings with payments cannot be deleted."
            >
              Delete booking
            </button>
            <span className="hidden group-hover:block absolute bottom-full left-0 mb-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20">
              Cancel instead. Bookings with payments cannot be deleted.
            </span>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal (FR-65) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel booking</h3>
            <p className="text-sm text-gray-600 mb-6">
              Cancel this booking? It will leave the calendar but stay in your list as Cancelled.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isPending}
                className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50"
              >
                {isPending ? "Cancelling..." : "Yes, cancel booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (FR-67) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete permanently</h3>
            <p className="text-sm text-gray-600 mb-6">
              Delete permanently? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
