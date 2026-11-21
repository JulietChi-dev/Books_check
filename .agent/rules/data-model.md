# data-model.md

One job: the shape of the stored data and its constraints.
Source: PRD 8.7 and 8.8. Copy the Prisma schema from 8.7 and the SQL from 8.8. Do not retype either from memory.

1. Do not add, rename, or drop a field without asking. Why: the PRD schema was reviewed, and each field supports a rule elsewhere.
2. Pin Prisma first. Read that version's documentation. If it moves the datasource URL into `prisma.config.ts`, follow that layout and create the file. Otherwise do not create it. Why: Prisma changed this between versions.
3. The app uses `DATABASE_URL` (pooled). Migrations use `DIRECT_URL` (direct). Why: pooled connections do not suit migrations.
4. Apartment, Booking, and BookingEvent each carry `companyId`. Why: every query can then filter by company without a join.
5. Booking points to its apartment through a composite foreign key on `(apartmentId, companyId)`. Apartment needs `@@unique([id, companyId])` for it. Why: the database then refuses a booking that points at another company's apartment.
6. Check-in and check-out use `@db.Date`. Money uses `Decimal(12, 2)`. Why: a time value adds time zone errors, and floats cause rounding errors.
7. Add no balance column. Why: a stored balance can drift from price and paid. A calculated one cannot.
8. Keep `User.companyId` unique. Why: it enforces one account per company. Removing it is a Version 2 migration.
9. BookingEvent has no foreign key to Booking. Why: history must survive a delete.
10. Add no index on guest name. Why: a partial-match search cannot use it, and MVP volumes do not need one.
11. The agent cannot run `prisma migrate`, so the order is: edit the schema, then ask the person to run `prisma migrate dev --create-only` and give you the new folder name. Then write the hand-written file in Prisma's migrations folder, in a new folder with a later timestamp. Why: Prisma creates the tables, and the constraints must run after them.
12. The hand-written file holds the SQL from PRD 8.8:
    - the `btree_gist` extension
    - `booking_no_overlap`: an exclusion constraint on `apartmentId` with `=` and `daterange(checkIn, checkOut, '[)')` with `&&`, applying only where status is ACTIVE
    - `booking_dates_valid`: check-out later than check-in
    - `booking_money_valid`: total and paid at or above 0, and paid not above total
    - `apartment_company_name_ci`: a unique index on company and lowercase name
    - `apartment_rooms_valid`: room count from 1 to 20

    Why: the database must refuse what the app should never send. Tell the person to run it on staging first, through `DIRECT_URL`, and to confirm `prisma migrate dev` reports no drift.
13. Flag the `onDelete: NoAction` relation between Booking and Apartment for review. Why: the PRD says to test it in staging, so it is unproven.
