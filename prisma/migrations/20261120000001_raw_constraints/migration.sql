-- Raw SQL migration: constraints Prisma cannot express (PRD 8.8)
-- Run this through a direct connection (DIRECT_URL).

-- Needed for exclusion constraints on text plus range columns.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- No two ACTIVE bookings for one apartment may overlap.
-- '[)' means check-in is included and check-out is excluded.
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "apartmentId" WITH =,
    daterange("checkIn", "checkOut", '[)') WITH &&
  )
  WHERE (status = 'ACTIVE');

-- Date and money rules.
ALTER TABLE "Booking"
  ADD CONSTRAINT booking_dates_valid CHECK ("checkOut" > "checkIn"),
  ADD CONSTRAINT booking_money_valid CHECK (
    "totalPrice" >= 0
    AND "amountPaid" >= 0
    AND "amountPaid" <= "totalPrice"
  );

-- Apartment names are unique per company, ignoring case.
CREATE UNIQUE INDEX apartment_company_name_ci
  ON "Apartment" ("companyId", lower("name"));

-- Apartment limits.
ALTER TABLE "Apartment"
  ADD CONSTRAINT apartment_rooms_valid CHECK ("roomCount" BETWEEN 1 AND 20);
