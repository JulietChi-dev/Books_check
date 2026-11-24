import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/guard";
import { AppHeader } from "@/components/AppHeader";
import { NewBookingForm } from "./NewBookingForm";

interface NewBookingPageProps {
  searchParams: Promise<{
    apartmentId?: string;
    checkIn?: string;
  }>;
}

/**
 * New Booking Page (PRD 6.6, FR-42 to FR-54)
 *
 * Accepts ?apartmentId and ?checkIn query parameters (FR-34).
 */
export default async function NewBookingPage({ searchParams }: NewBookingPageProps) {
  const auth = await getCurrentUser();

  if (!auth) {
    redirect("/login");
  }

  if (!auth.user.companyId) {
    redirect("/register-company");
  }

  const { apartmentId, checkIn } = await searchParams;

  // Fetch company apartments for dropdown
  const apartments = await prisma.apartment.findMany({
    where: { companyId: auth.user.companyId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  if (apartments.length === 0) {
    redirect("/register-company");
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
      {/* Top Header */}
      <AppHeader
        companyName={auth.company?.name ?? "My Company"}
        userName={auth.user.fullName}
        currency={auth.company?.currency}
        timeZone={auth.company?.timeZone}
        currentTab="new"
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#182230]">New Booking</h1>
              <p className="text-sm text-slate-500">
                Record a guest stay and verify availability
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/90">
            <NewBookingForm
              apartments={apartments}
              currency={auth.company?.currency || "NGN"}
              initialApartmentId={apartmentId}
              initialCheckIn={checkIn}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
