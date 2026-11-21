# BooksCheck

## Description

BooksCheck is a web app that a hotel or service apartment manager uses on the company laptop to record bookings and see availability in a month calendar. The app blocks any booking that overlaps another active booking for the same apartment. Each booking shows total price, amount paid, and balance.

The PRD file is BooksCheck-PRD-v1.md. Its header reads Version 2.0, which replaces 1.0. Treat it as current. Locate it by file name. If it is not found, or more than one exists, stop and ask. Before a change, read only the PRD sections named in the matching entry under Where the detailed rules live.

## Who uses it

- Manager: the only person who logs in for a company in the MVP. Uses the company laptop.
- Owner: often the buyer. May be a different person from the manager. Only one person per company logs in.
- Account model: one account per company. The account belongs to the company, not to a person.
- The manager is expected to sign up with a company-owned email address. The app does not check this.
- Not served in the MVP: receptionists, accountants, and owners who want read-only access.
- Guests do not use the app. There are no guest-facing booking pages and no online payments by guests.

## One thing that the agent must do well

Never allow two active bookings to overlap for the same apartment.

- A booking occupies the nights from check-in up to, but not including, check-out.
- Same-day turnover is not a clash.
- Only active bookings block. Cancelled bookings never block.
- The application checks the clash. The database enforces it too, through a hand-written migration file. Write the file. Never run it.
- Create and edit are the only code paths that write booking dates or apartments. Both call one shared clash function. Add no third path.
- When time runs short, follow the cut order in PRD 8.11. The clash rules are never cut.
- Success metric (PRD G1): the overlap count is 0. The developer measures it. The agent does not run the check.
- The clash rule is in PRD 6.7 and 8.6. rules/clash-rule.md does not exist yet.

## Defined scope for the MVP

Build only what is listed here. Anything not listed is out of scope. Ask first.

- Auth: sign up with email verification, login, logout, forgot password, reset password, change password, change login email.
- Company: one-time company registration, edit company details.
- Apartments: create during registration. Rename, change room count, add, and remove an apartment that has no bookings.
- Calendar: month grid, navigation, jump to today, go to date, New booking button, click to book, click to open, automatic refresh.
- Booking: create, view, edit, cancel, delete (only when nothing is paid), history of changes.
- List: filter by year, month, status, and unpaid. Search by guest name or phone.
- Rules: clash check, same-day turnover, date and money validation, retry safety.
- Quality: company data separation, hashed passwords, secure sessions, HTTPS, friendly errors on poor connections.
- Operations: backups with a tested restore, error tracking, uptime check, staging database. These are developer tasks. Write no backup or restore script, and provision no database, unless the person asks.

## Not in scope for the MVP

- Staff accounts, roles, and multiple users per company.
- Expense and sales tracking.
- Quick walk-in form. In the MVP a walk-in is a normal booking.
- Online payments by guests, subscriptions, and billing.
- Room-level booking.
- Archiving apartments that have booking history.
- Payment history ledger per booking.
- Receipts and printable confirmations.
- SMS and WhatsApp reminders.
- Guest-facing booking pages.
- Mobile-optimised layout is out of scope. The page body still never scrolls sideways. On narrow screens the calendar grid scrolls inside its own area.
- Offline mode.
- The app is English only. The PRD marks this as an assumption.
- Data export is out of scope for the MVP. Do not build it.
- Importing bookings from Excel.
- Row-level security in the database.
- One currency per company. Add no tax fields.
- No AI feature is in the MVP.
- Version 2 candidates are listed in PRD 5.3. Do not build them.

## Stack

- Next.js, App Router.
- TypeScript, strict mode.
- Prisma. Constraints that Prisma cannot express go in a hand-written migration file.
- PostgreSQL.
- Gemini free tier is a fixed stack choice from the project context. Write no Gemini client, key, or dependency unless the person names an AI feature to build.
- Pin exact versions of Next.js, Prisma, and Node at project start. Run password hashing on the Node runtime.
- Undecided. Ask once, before the first use, for each of: validation library, CSS framework, email service, hosting, and password hashing library. The PRD suggests Zod, Tailwind CSS, a transactional email service such as Resend, Vercel with Neon, and Argon2id. The PRD marks all of them as assumptions.

## Folder map

Page and route files follow the Next.js App Router convention and the route list in PRD 8.2. Ask only where that does not cover a file. Do not invent other paths.

```
project root
  AGENTS.md              this file
  BooksCheck-PRD-v1.md   the PRD, found by file name
  rules/                 not created yet, see Where the detailed rules live
```

Code the PRD names, with no path set:

- Create one data-access module. It is the only module that imports the Prisma client. Add an ESLint restricted-import rule that fails the build for any other import.
- Middleware. It makes fast redirects only. It is not the security check.
- One hand-written migration file for the constraints Prisma cannot express. Do not apply it.
- prisma.config.ts. Check the pinned Prisma version's documentation. Create it only if that version requires it.

## How to work in this codebase

- One change is one PRD requirement ID or one fix. Report it, then wait for the person's reply before the next.
- Follow the build order in PRD 8.11 unless the person says otherwise.
- Ask before adding or upgrading any dependency, including dev dependencies. Next.js, TypeScript, and Prisma are pre-approved.
- Never touch the database. You may edit schema and migration files. Run no command that connects to any database, including prisma migrate, prisma db push, prisma studio, seed scripts, the dev server, and tests that need a database. Write the change and tell the person what to run.
- Write the tests that need a database. The person runs them.
- List assumptions about the environment or the request at the end of every response. Write "None" when there are none. Never assume a PRD requirement. Stop and ask.
- Stop and ask when a change needs a product behaviour, rule, limit, message, or data field that the PRD does not state. Local variable names do not need a question.
- Take field names, limits, and messages from the PRD. Do not invent them.
- PRD items marked [ASSUMPTION] are unconfirmed. Use them only after the person confirms. PRD open questions O1 to O7 are unresolved. Do not decide them.
- Company data is every company-owned table. Every read and write of it takes the company ID from the session user, never from a form field, URL, or request.
- A request for another company's booking, apartment, or list returns not found.
- Every page except sign up, login, password reset, and email verification needs a valid session, checked on the server in the page, the action, and the query. Middleware alone is not enough.
- Money uses exact decimal arithmetic and never floating point numbers. Money moves between server and browser as decimal text.
- Booking dates are calendar dates with no time. Check-out must be later than check-in. Add no time fields.
- Dates move between server and browser as text. Never build a date from text in a local time zone. Today uses the company time zone.
- Delete removes the booking, including guest name, phone, and notes. Do not use soft delete.
- Tests required by the PRD: every row of the PRD 6.7 table, simultaneous bookings for the same dates where exactly one succeeds, cross-company access, retry, edit conflict, and date and money tests under several system time zones. Details are in PRD 8.10.
- Flag every authentication and database constraint change for human review.
- The rules files do not exist yet. Do not stop because of that. Use the PRD sections named below.

## Where the detailed rules live

The rules files do not exist yet. Until they do, read the PRD sections named below. Create a rules file only when the person asks. Each rules file lists PRD requirements with their PRD IDs and keeps the [ASSUMPTION] marker on any item that has it.

- rules/clash-rule.md: exact clash rule, examples table, database enforcement, simultaneous requests. PRD 6.7 and 8.6.
- rules/data-model.md: schema, constraints, hand-written migration, design choices. PRD 8.7 and 8.8.
- rules/validation-and-messages.md: field rules, limits, exact error messages. PRD 6.1 to 6.9 and 6.11.
- rules/auth-and-security.md: sessions, tokens, rate limits, security headers, hashing, company data separation. PRD 6.1 to 6.3, 8.4, 8.5, and the security row of 8.10.
- rules/screens.md: calendar, bookings list, booking details, settings behaviour. PRD 6.5 and 6.8 to 6.10.
- rules/routes-and-actions.md: routes, access levels, server actions. PRD 8.2 and 8.3.
- rules/dates-and-money.md: date and money formats and arithmetic. PRD FR-49, FR-89, FR-90, and the design choices in 8.7.
- rules/hosting-and-env.md: hosting rules, pinned versions, environment variable names. PRD 8.1.
- rules/testing-and-ops.md: key queries, required tests, backups, error tracking, accessibility, browser support, performance, build order, cut order. PRD 8.9, 8.10, and 8.11.
- rules/ai-rules.md: applies only if the person later adds an AI feature. Do not create it now. PRD 7.1.

## Definitions

- The person: the human giving you instructions in this session.
- The developer: the person who onboards each pilot business in person.
- Account: one per company. It belongs to the company, not to a person.
- Booking unit: the whole apartment. Room count is information only. A hotel registers each rentable room as an apartment.
- Night: a booking occupies the nights from check-in up to, but not including, check-out.
- Clash: two active bookings for the same apartment whose nights overlap.
- Same-day turnover: one booking's check-in equals another booking's check-out for the same apartment, in either order. It is not a clash.
- Active booking: a booking whose status is active. A new booking starts active. Cancel changes the status to cancelled.
- Cancelled booking: it leaves the calendar and never blocks. It is hidden from the list by default and appears under the All and Cancelled status filters. It cannot be edited. It keeps its amount paid. Its balance shows as n/a and is left out of owed totals.
- Balance: total price minus amount paid. It is calculated and never stored.
- Unpaid: an active booking whose balance is above zero.
- History: a record written in the same transaction as each create, update, cancel, and delete. It holds changes to dates, apartment, amounts, and status. It never holds guest name, phone, or notes. After a delete, only the booking ID, apartment, dates, and deletion time remain.
- Retry safety: the form creates a request ID. A repeat request with the same ID returns the saved booking and never shows a clash with itself.
- Edit conflict: the edit form sends the last-updated value it loaded. The server saves only if it still matches. Otherwise it returns the PRD message.
- Walk-in: in the MVP, a normal booking whose check-in is today's date in the company time zone.
- Pilot: the trial with real businesses before paid use.
- MVP: the scope in PRD 5.1.
- Version 2: the candidates in PRD 5.3. Their order is set after the pilot.
