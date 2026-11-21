# dates-and-money.md

One job: how dates and money are held, moved, and shown.
Source: FR-49, FR-89, FR-90, and the design choices in PRD 8.7. Limits and messages are in validation-and-messages.md.

## Money

1. Use exact decimal arithmetic. Never use floating point numbers. Never run `Number` or `parseFloat` on money. Why: floats cause rounding errors in a product that tracks who owes what.
2. Balance is total price minus amount paid, using rule 1. Why: it must match the database to the cent.
3. Money moves between server and browser as plain decimal text. It has digits, a dot, and up to 2 decimals. It has no thousands separators and no currency code. Convert Prisma Decimal values to text before they leave the server. Why: Decimal objects cannot cross to client components, and separators break parsing.
4. Never round a typed amount to fit. Validation rejects it. Why: silent rounding changes what the person typed.
5. The live balance in the form needs exact arithmetic in the browser. If the method needs a new package, ask first (see stack-and-dependencies.md). Why: a careless choice brings floats back.
6. Display money with the company currency code and thousands separators, for example "NGN 150,000.00". Build the text from the decimal text, never through a float. Why: a float on the way to the screen undoes rule 1.

## Dates

1. Booking dates are calendar dates with no time. Add no time fields. Why: same-day turnover works on dates alone.
2. Dates move between server and browser as "YYYY-MM-DD" text. The month parameter moves as "YYYY-MM". Why: text carries no hidden time zone.
3. Build a date from its year, month, and day numbers with `Date.UTC`. Read it back with UTC getters. Never use local getters or a local-time constructor. Build the month start and next month start the same way. Why: a local-zone date can shift by a day on another laptop.
4. After parsing, check the numbers read back unchanged. Reject a date like 2026-02-30. The PRD gives no message for this. Ask before writing one. Why: JavaScript turns 30 Feb into 2 Mar without a warning.
5. Count nights as the difference of two UTC day counts, taken from the date numbers. Never subtract local date-time objects. Why: zone and daylight offsets corrupt the count.
6. "Today" is today in the company time zone, read with `Intl.DateTimeFormat` and the company `timeZone`. Never use the device or server zone. Why: it decides the default month and which bookings are walk-ins.
7. Display dates as "Wed, 24 Dec 2026" using a fixed UTC zone. [ASSUMPTION] Test the exact output string. Why: locale output differs between Node versions.

## Ask first (the PRD does not say)

- Whether the money field accepts typed thousands separators.
- How to treat currencies whose minor unit is not 2 decimals. The PRD stores 2 decimals for every currency.
