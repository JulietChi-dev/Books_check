import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import {
  CompanyForm,
  ApartmentRow,
  AddApartmentForm,
  ChangePasswordForm,
  ChangeEmailForm,
} from "./SettingsSections";

/**
 * Settings Page (PRD 6.10, FR-80 to FR-86)
 * Server Component — session and company scope checked before rendering.
 */
export default async function SettingsPage() {
  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) redirect("/register-company");

  // Load company + apartments + booking counts (all scoped to companyId — FR-88)
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!company) redirect("/register-company");

  const apartments = await prisma.apartment.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  // Count bookings per apartment for the delete guard (FR-83)
  const bookingCounts = await prisma.booking.groupBy({
    by: ["apartmentId"],
    where: { companyId },
    _count: { id: true },
  });
  const countMap = new Map(bookingCounts.map((r) => [r.apartmentId, r._count.id]));

  // FR-25: check if any bookings exist (locks currency)
  const totalBookings = bookingCounts.reduce((s, r) => s + r._count.id, 0);
  const hasBookings = totalBookings > 0;

  const companyName = company.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Header */}
      <AppHeader
        companyName={companyName}
        userName={auth.user.fullName}
        currency={company.currency}
        timeZone={company.timeZone}
        currentTab="settings"
      />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#182230]">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your company configuration, apartments, and account credentials.</p>
        </div>

        {/* ── Company Details (FR-80) ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="text-base font-semibold text-[#182230]">Company Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Edit your company name, location, and contact information.</p>
          </div>
          <div className="p-6">
            <CompanyForm
              company={{
                name:     company.name,
                country:  company.country,
                currency: company.currency,
                timeZone: company.timeZone,
                address:  company.address,
                city:     company.city,
                phone:    company.phone,
                email:    company.email,
              }}
              hasBookings={hasBookings}
            />
          </div>
        </section>

        {/* ── Apartments (FR-81, FR-82, FR-83) ─────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="text-base font-semibold text-[#182230]">Apartments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rename apartments or change room counts. Remove apartments that have no bookings.
            </p>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {apartments.map((apt) => (
              <ApartmentRow
                key={apt.id}
                id={apt.id}
                name={apt.name}
                roomCount={apt.roomCount}
                bookingCount={countMap.get(apt.id) ?? 0}
              />
            ))}

            {/* Add Apartment (FR-82) */}
            <AddApartmentForm apartmentCount={apartments.length} />
          </div>
        </section>

        {/* ── Change Password (FR-84) ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="text-base font-semibold text-[#182230]">Change Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">Requires your current password. All other sessions will be signed out.</p>
          </div>
          <div className="p-6">
            <ChangePasswordForm />
          </div>
        </section>

        {/* ── Change Login Email (FR-85) ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h2 className="text-base font-semibold text-[#182230]">Change Login Email</h2>
            <p className="text-xs text-slate-500 mt-0.5">A verification link will be sent to the new address. Your old email stays active until verified.</p>
          </div>
          <div className="p-6">
            <ChangeEmailForm currentEmail={auth.user.email} />
          </div>
        </section>
      </main>
    </div>
  );
}
