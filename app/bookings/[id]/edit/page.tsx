import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/guard";
import { getBooking } from "@/lib/db";
import { prisma } from "@/lib/db";
import { formatUTCDate } from "@/lib/money-and-dates";
import { AppHeader } from "@/components/AppHeader";
import { EditBookingForm } from "./EditBookingForm";

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Booking Page (PRD FR-63, FR-58, FR-61)
 * Server Component — session and company scope checked before rendering.
 * FR-66: Cancelled bookings are read-only; redirect back to details.
 */
export default async function EditBookingPage({ params }: EditBookingPageProps) {
  const { id } = await params;
  const auth = await requireSession();
  const companyId = auth.user.companyId;

  if (!companyId) {
    redirect("/register-company");
  }

  const booking = await getBooking(id, companyId);
  if (!booking) {
    notFound();
  }

  // FR-66: A cancelled booking cannot be edited.
  if (booking.status === "CANCELLED") {
    redirect(`/bookings/${id}`);
  }

  // Load apartments for dropdown, scoped to company (FR-88)
  const apartments = await prisma.apartment.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const currency = booking.company.currency;

  // Serialise Decimal/Date fields to strings for the client form
  const initial = {
    apartmentId: booking.apartmentId,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    checkIn: formatUTCDate(booking.checkIn),
    checkOut: formatUTCDate(booking.checkOut),
    totalPrice: booking.totalPrice.toString(),
    amountPaid: booking.amountPaid.toString(),
    notes: booking.notes ?? "",
  };

  // Pass updatedAt as ISO string for optimistic concurrency (FR-61)
  const loadedUpdatedAt = booking.updatedAt.toISOString();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <AppHeader
        companyName={booking.company.name}
        currentTab="bookings"
      />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
            <p className="text-sm text-gray-600">
              Editing booking for{" "}
              <span className="font-medium text-gray-900">{booking.guestName}</span> in{" "}
              <span className="font-medium text-gray-900">{booking.apartment.name}</span>.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <EditBookingForm
              bookingId={id}
              loadedUpdatedAt={loadedUpdatedAt}
              apartments={apartments}
              currency={currency}
              initial={initial}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
