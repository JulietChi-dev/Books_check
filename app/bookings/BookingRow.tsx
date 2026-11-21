"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface BookingRowProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Clickable table row for bookings list (PRD FR-77).
 * Client component to allow onClick in Next.js App Router without
 * violating React Server Component restrictions.
 */
export function BookingRow({ id, className, children }: BookingRowProps) {
  const router = useRouter();

  return (
    <tr
      className={className}
      onClick={() => router.push(`/bookings/${id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/bookings/${id}`);
        }
      }}
    >
      {children}
    </tr>
  );
}
