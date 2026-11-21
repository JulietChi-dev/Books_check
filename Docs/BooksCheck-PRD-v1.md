# BooksCheck: Product Requirements Document (MVP)

Version: 2.0 (reviewed)
Date: 18 November 2026
Stack: Next.js, TypeScript, Prisma, PostgreSQL

This version replaces 1.0. It applies every correction from the live review of 1.0.

Items marked [ASSUMPTION] are my additions. Each one is listed in the Assumptions table at the end, with a way to check it.

---

## 1. Product Summary

BooksCheck is a web app that a hotel or service apartment manager uses on the company laptop to record bookings and see availability in a month calendar. The app blocks any booking that overlaps another active booking for the same apartment. Each booking shows total price, amount paid, and balance.

**MVP in one paragraph.** The manager signs up, registers the company and its apartments, then works from a month calendar. The manager creates, edits, cancels, and deletes bookings. A bookings list supports filtering by month, year, status, and unpaid balance, and searching by guest name or phone.

**Account model.** One account per company. The account belongs to the company, not to a person. The manager signs up with a company-owned email address. There are no staff accounts in the MVP.

**Booking unit.** The whole apartment. Room count is information only. A hotel registers each rentable room as an apartment. A business can register up to 50 apartments.

**Pilot.**
- Exactly 3 businesses for 4 weeks.
- At least 1 hotel and at least 1 service apartment business.
- Each business has 50 bookable units or fewer.
- The owner is available for the final interview.
- Pilot country: Nigeria (confirmed). Defaults: country Nigeria, currency NGN, time zone Africa/Lagos.

**Onboarding.** The developer onboards each pilot business in person, in one session (see 8.11 and Risk R1).

---

## 2. Problems

| # | Problem | Today's workaround | Cost to the manager |
|---|---|---|---|
| P1 | Two guests get booked for the same apartment on overlapping dates | Notebook, WhatsApp, Excel, memory | Angry guest, refund, lost trust, lost revenue |
| P2 | The manager loses track of who has paid in full | Notes in margins, scattered chats | Unpaid balances, awkward phone calls, lost income |
| P3 | Checking if an apartment is free takes minutes | Scroll chats or flip pages | Slow replies, lost enquiries |

**Root causes.**
1. No single place shows every booking by apartment and date.
2. Nothing enforces the "no overlap" rule.
3. Bookings made by phone or WhatsApp never reach the app, so a calendar can lie.

**Baseline.** At onboarding, the developer records these numbers for each pilot business. The pilot results are compared with them.

| Baseline item | How to record it |
|---|---|
| Double-bookings in the last 12 months | Ask the manager. Write the count. |
| Unpaid balances today | Count them with the manager. Write the count and total. |
| Seconds to answer "Is apartment X free on date Y?" | Time 3 trials with the current method. Write the median. |

---

## 3. Goals

**Product goals**

| ID | Goal | Target |
|---|---|---|
| G1 | Zero double-bookings in real life | (a) The database overlap count is 0. (b) Weekly reconciliation against the manager's WhatsApp and notebook shows at least 95% of real bookings are in the app, and no guest arrives to a taken apartment. The pilot must record at least 50 bookings in total for G1 to count. |
| G2 | Make money owed visible | The balance appears as text on the calendar bar and as a column in the list. A manager finds all unpaid balances in the list within 30 seconds. |
| G3 | Fast booking entry | Median under 60 seconds and 90th percentile under 120 seconds, from opening the form to saving. Ignore forms open longer than 10 minutes. |
| G4 | Easy to learn | In a test with 5 people outside the pilot, at least 4 save a first booking within 10 minutes of saving company registration, with no help. |
| G5 | Fast availability check | A manager answers "Is apartment X free on date Y?" in under 15 seconds, observed in the final interview. |
| G6 | Prove willingness to pay | At least 2 of 3 businesses pay a first invoice, or sign a dated commitment, at a price they named. Ask the buyer. If the buyer is not the manager, interview both. |

**Non-goals (MVP)**

- Staff accounts and roles
- Expense and sales tracking
- Quick walk-in form (Version 2). In the MVP, a walk-in is a normal booking with today's check-in date.
- Online payments by guests of any kind
- Room-level booking
- Guest-facing booking pages
- Offline mode
- Mobile-optimised layout
- Data export. It is required before the first paying customer. During the pilot, the developer exports on request.

---

## 4. Users and Personas

**Primary user: the manager.** Only one person per company logs in during the MVP. The owner is often the buyer, and may be a different person.

### Persona 1: Ngozi, owner-manager of a 6-apartment service apartment business

- Age 38. Runs the business herself.
- Uses a laptop at a desk and WhatsApp on her phone.
- Tracks bookings in an Excel sheet and a notebook.
- Has double-booked twice in the last year.
- Needs: see free dates fast, see who still owes, never double-book.
- Technical skill: comfortable with Excel and WhatsApp, not with software setup.

### Persona 2: Tunde, manager of a 20-apartment small hotel

- Age 45. Employed by the owner.
- Takes bookings by phone and WhatsApp throughout the day.
- Needs: answer "Is Apartment 12 free on the 24th?" while on the phone.
- Technical skill: moderate.
- Account note: Tunde signs up with an email address the company owns. If he leaves, the owner keeps access.

**Not served in MVP:** receptionists, accountants, and owners who want read-only access. They come in Version 2 with multiple accounts.

---

## 5. Scope

### 5.1 MVP in scope

| Area | Included |
|---|---|
| Auth | Sign up with email verification, login, logout, forgot password, reset password, change password, change login email |
| Company | One-time company registration, edit company details |
| Apartments | Create during registration. Rename, change room count, add, and remove an apartment that has no bookings. |
| Calendar | Month grid, navigation, jump to today, go to date, New booking button, click to book, click to open, automatic refresh |
| Booking | Create, view, edit, cancel, delete (only when nothing is paid), history of changes |
| List | Filter by year, month, status, and unpaid. Search by guest name or phone. |
| Rules | Clash check, same-day turnover, date and money validation, retry safety |
| Quality | Company data separation, hashed passwords, secure sessions, HTTPS, friendly errors on poor connections |
| Operations | Backups with a tested restore, error tracking, uptime check, staging database |

### 5.2 MVP out of scope

- Archiving apartments that have booking history
- Multiple users per company
- Payment history ledger per booking. The app keeps one running "amount paid" figure plus a history of changes to it.
- Expense and sales tracking
- Quick walk-in form
- Subscriptions and billing
- Receipts and printable confirmations
- SMS and WhatsApp reminders
- Mobile-optimised layout. The pages must not scroll sideways on a 1280 px wide laptop. On narrower screens the calendar scrolls inside its own area.
- Offline mode
- Multi-language support [ASSUMPTION]
- Data export
- Importing bookings from Excel
- Row-level security in the database

### 5.3 Version 2 candidates

The order is set after the pilot. Staff accounts are an early candidate because of Risk R7.

- Staff accounts and roles
- Data export (required before the first paying customer)
- Expense and sales tracking with reports
- Quick walk-in form
- Archive apartments and manage rooms
- Subscription plans and payment
- Room-level booking
- Receipts and printable confirmations
- SMS and WhatsApp reminders for check-ins and balances
- Mobile layout, if pilot device data shows phone use
- Row-level security

---

## 6. Functional Requirements

### 6.1 Sign up

| ID | Requirement |
|---|---|
| FR-1 | The sign-up form has: full name, email, password, confirm password, and a checkbox "I accept the terms and privacy notice" with links. The checkbox is required. |
| FR-2 | Full name is required, 2 to 80 characters. |
| FR-3 | Email is required and must be a valid format. The app stores it in lowercase. Error: "Enter a valid email address." |
| FR-4 | Email must be unique across all users. Error: "An account with this email already exists." This message is an accepted trade-off for usability. Sign-up is limited to 10 attempts per hour per IP address. [ASSUMPTION] |
| FR-5 | Password must be 8 to 128 characters. There are no composition rules. [ASSUMPTION] Error: "Use 8 to 128 characters." |
| FR-6 | Confirm password must match. Error: "Passwords do not match." |
| FR-7 | On success, the app creates the user, sends a verification email, starts a session, and redirects to Company registration. |
| FR-8 | Until the email is verified, a banner reads "Verify your email" with a "Resend" link. The banner does not block any feature. The verification link expires after 24 hours. [ASSUMPTION] Resend is limited to 3 per hour. |
| FR-9 | A user with no company can only reach the Company registration page and logout. All other routes redirect there. |

### 6.2 Login

| ID | Requirement |
|---|---|
| FR-10 | The login form has email and password. |
| FR-11 | On wrong credentials, show one message: "Email or password is incorrect." Do not say which one is wrong. |
| FR-12 | After 5 failed attempts for the same email from the same IP address within 15 minutes, block that pair for 15 minutes. After 20 failed attempts for one email within one hour from any IP address, block that email for 15 minutes. Count attempts for unknown emails too. Message: "Too many attempts. Try again in 15 minutes." [ASSUMPTION] |
| FR-13 | On success, redirect to Home calendar. If the user has no company, redirect to Company registration. |
| FR-14 | A logged-in user who opens the login or sign-up page goes to Home. |
| FR-15 | A session ends after 7 days without activity, and never lasts longer than 30 days in total. Logout ends the session immediately. [ASSUMPTION] |

### 6.3 Forgot and reset password

| ID | Requirement |
|---|---|
| FR-16 | "Forgot password" asks for an email. The response is always "If this email has an account, we sent a reset link." The server sends the email after it returns the response, so response time does not reveal whether the account exists. The form is limited to 3 requests per hour per email and 10 per hour per IP address. [ASSUMPTION] |
| FR-17 | The reset link expires after 60 minutes and works once. [ASSUMPTION] |
| FR-18 | The reset form follows the same password rules as FR-5. |
| FR-19 | After a reset, all existing sessions for that user end. |

### 6.4 Company registration

Shown once after first sign-up.

| ID | Requirement |
|---|---|
| FR-20 | Required fields: company name (2 to 100 characters), country (select list), currency (select list of ISO 4217 codes), and time zone (select list). Defaults: country Nigeria, currency NGN, time zone Africa/Lagos. The manager can change them. Optional fields: address (up to 200 characters), city, phone, email. If an optional field has a value, it must pass its format rule. |
| FR-21 | Phone must contain 7 to 15 digits. The app accepts a leading "+", spaces, and hyphens, and stores digits with the "+". This rule applies to company and guest phones. |
| FR-22 | The apartment list starts with one row. An "Add apartment" button adds a row. Each row has a remove control. The list holds 1 to 50 rows. Each row has apartment name (required, 1 to 60 characters, trimmed) and number of rooms (required, whole number from 1 to 20). [ASSUMPTION on limits] |
| FR-23 | Apartment names must be unique within the company, ignoring upper and lower case. Error: "Two apartments share the name 'X'." |
| FR-24 | Saving creates the company and all apartments in one database transaction. If any step fails, nothing saves. |
| FR-25 | Currency can change in settings only while the company has no bookings. After the first booking, it is read-only, because existing amounts would lose meaning. [ASSUMPTION] |
| FR-26 | Helper text on the apartment list reads: "A hotel registers each rentable room as an apartment." |
| FR-27 | On success, redirect to Home calendar. |

### 6.5 Home calendar

| ID | Requirement |
|---|---|
| FR-28 | The page shows one month. The default month is the current month in the company time zone. |
| FR-29 | Rows are apartments, sorted by name. Columns are days of the month. Weekends have a slightly different background. The apartment name column and the day header row stay in view while the grid scrolls. |
| FR-30 | Each active booking shows as a bar from the check-in day to the check-out day. The bar starts in the middle of the check-in cell and ends in the middle of the check-out cell. This shows same-day turnover. |
| FR-31 | Bars use two colours and also use text. Green means balance is 0. It shows a "Paid" tick. Amber means balance is above 0. It shows the label "Owes" and the balance with the currency code, for example "Owes NGN 45,000.00". Each bar also shows the guest name. Long text is cut with an ellipsis, and the details panel shows the full text. The legend sits above the grid. [ASSUMPTION on colours] |
| FR-32 | A booking that spans two months shows in both months. |
| FR-33 | The page has Previous month, Next month, Today, and "Go to date" controls. It shows the month name and year. A "New booking" button opens New booking with no apartment or date filled. |
| FR-34 | Click rule. Clicking a bar opens that booking. Clicking any other part of a cell works by night. If the night starting on that day is booked, the click opens that booking. If the night is free, the click opens New booking with that apartment and date as check-in. Check-out defaults to the next day. |
| FR-35 | The booking details panel shows all fields, the history, and Edit, Cancel, and Delete buttons. |
| FR-36 | Cancelled bookings do not show on the calendar. |
| FR-37 | Speed. For 50 apartments and 31 days, at the 95th percentile, the calendar is visible within 1.5 seconds in the browser, and server time is under 400 ms. [ASSUMPTION] |
| FR-38 | The page shows an empty state when the month has no bookings: "No bookings this month. Click any date to add one." |
| FR-39 | Freshness. The calendar refreshes every 60 seconds while the tab is visible, and again when the tab regains focus. The page shows "Updated 14:02" with the last refresh time. [ASSUMPTION] |
| FR-40 | Bars are focusable buttons with a text label. The New booking button gives a keyboard path to create a booking. |
| FR-41 | On screens narrower than 1280 px, the grid scrolls inside its own area. The page body does not scroll sideways. |

### 6.6 New booking

| ID | Requirement |
|---|---|
| FR-42 | Fields: apartment (select), guest name, guest phone, check-in date, check-out date, total price, amount paid, balance (read-only, calculated), notes (optional, up to 500 characters). Helper text under notes: "Do not enter ID or card numbers." |
| FR-43 | Guest name is required, 2 to 80 characters. |
| FR-44 | Guest phone is required and follows the rule in FR-21. |
| FR-45 | Check-in and check-out are calendar dates with no time. Check-out must be later than check-in. Error: "Check-out must be after check-in." |
| FR-46 | Past check-in dates are allowed, so the manager can record bookings after the fact. [ASSUMPTION] If check-in is more than 365 days from today, or the stay is longer than 60 nights, the form asks for confirmation: "Check the dates. This stay starts on DATE and lasts N nights. Save anyway?" [ASSUMPTION] |
| FR-47 | Total price must be a number from 0 to 9,999,999,999.99, with up to 2 decimals. [ASSUMPTION] |
| FR-48 | Amount paid must be 0 or more and no more than total price. Error: "Amount paid cannot be more than the total price." Default is 0. When an edit lowers the total below the amount paid, the error is: "Total price cannot be less than the amount already paid. Lower the amount paid first." |
| FR-49 | Balance equals total price minus amount paid. It updates live as the manager types. The calculation uses exact decimal arithmetic. It never uses floating point numbers. |
| FR-50 | The clash check runs on the server when the manager saves (see 6.7). On a clash, the form stays open with all values kept and shows the message in FR-56. |
| FR-51 | On success, the app opens the calendar on the check-in month, shows the new bar, and shows a confirmation: "Booking saved." |
| FR-52 | The form blocks double-clicks on Save. The button shows "Saving..." until the server replies. The form creates a request ID when it opens. The server stores the ID with the booking. A repeat request with the same ID returns the saved booking as a success. A retry after a lost reply never shows a clash with its own booking. |
| FR-53 | If the network fails, the form keeps its values and shows: "Could not save. Check your connection and try again." |
| FR-54 | The form records the seconds from opening to the first click on Save. The server stores this in `entrySeconds`. The app uses it only for the G3 metric. |

### 6.7 Clash check (exact rule)

| ID | Requirement |
|---|---|
| FR-55 | Each booking occupies the nights from check-in up to, but not including, check-out. The date range is half-open: `[checkIn, checkOut)`. |
| FR-56 | Two active bookings for the same apartment clash if `new.checkIn < existing.checkOut` AND `new.checkOut > existing.checkIn`. Error text: "Apartment X is already booked from DATE to DATE (Guest NAME)." |
| FR-57 | Only bookings with status ACTIVE count. Cancelled bookings never block. |
| FR-58 | When editing, the check ignores the booking being edited. |
| FR-59 | Create and edit are the only paths that write booking dates or apartments. Any future path must call the same clash function. The check applies on create and on edit of dates or apartment. |
| FR-60 | The database enforces the rule as well, so two simultaneous requests cannot both succeed (see 8.6). |
| FR-61 | Edit conflict. The edit form sends the `updatedAt` value it loaded. The server saves only if that value still matches. Otherwise it returns: "This booking changed. Reload and try again." |

**Examples.** Existing booking: Apartment A, 10 Dec to 14 Dec (nights of 10, 11, 12, 13).

| New booking (Apartment A) | Clash? | Why |
|---|---|---|
| 14 Dec to 17 Dec | No | Same-day turnover. New check-in equals existing check-out. |
| 7 Dec to 10 Dec | No | New check-out equals existing check-in. |
| 12 Dec to 15 Dec | Yes | Overlaps nights 12 and 13. |
| 8 Dec to 16 Dec | Yes | Fully contains the existing stay. |
| 11 Dec to 13 Dec | Yes | Sits inside the existing stay. |
| 10 Dec to 14 Dec, Apartment B | No | Different apartment. |
| 12 Dec to 15 Dec, existing is Cancelled | No | Cancelled bookings never block. |
| Edit the existing booking to 10 Dec to 13 Dec | No | The check ignores the booking being edited. |
| Edit another booking in Apartment B to Apartment A, 12 Dec to 15 Dec | Yes | Overlaps nights 12 and 13 in Apartment A. |
| Edit another booking in Apartment B to Apartment A, 14 Dec to 16 Dec | No | Same-day turnover. |

### 6.8 Booking details, edit, cancel, delete

| ID | Requirement |
|---|---|
| FR-62 | The details view shows every field, the status, the created and last updated times, and a History list. Each History line shows the time and the change, for example "Amount paid: 50,000.00 to 80,000.00". |
| FR-63 | Edit opens the same form as New booking, filled with current values. All rules in 6.6 and 6.7 apply. |
| FR-64 | To record a later payment, the manager edits "amount paid" to the new running total. The History list records each change, so the manager can see when each payment arrived. |
| FR-65 | Cancel asks for confirmation: "Cancel this booking? It will leave the calendar but stay in your list as Cancelled." On confirm, status becomes CANCELLED and the app stores the cancel time. |
| FR-66 | A cancelled booking cannot be edited. The details view shows it as read-only. To rebook, the manager creates a new booking. [ASSUMPTION] |
| FR-67 | Delete is available from the details view only when amount paid is 0. It asks: "Delete permanently? This cannot be undone." On confirm, the app removes the booking, including guest name, phone, and notes. When amount paid is above 0, the button is disabled and shows: "Cancel instead. Bookings with payments cannot be deleted." |
| FR-68 | Cancel keeps the amount paid on the record. The app does not calculate refunds. A cancelled booking shows its balance as "n/a" and does not count in owed totals. |
| FR-69 | The app writes a History record on create, update, cancel, and delete, in the same database transaction as the change. History records hold changes to dates, apartment, amounts, and status. They never hold guest name, phone, or notes. After a delete, only the booking ID, apartment, dates, and deletion time remain. |

### 6.9 Bookings list

| ID | Requirement |
|---|---|
| FR-70 | The list has four filters. Year (default current year, with an "All years" option). Month (default "All months"). Status: All, Active, Cancelled (default Active). Payment: All, or "Unpaid only". "Unpaid only" shows active bookings with a balance above 0, and sets Year to "All years" unless the manager changes it. |
| FR-71 | A booking appears in a month if any night of its stay falls inside that month. |
| FR-72 | The search box matches guest name or phone digits, case-insensitive, partial match. |
| FR-73 | Columns: apartment, guest, phone, check-in, check-out, nights, total, paid, balance, status. Balance shows "n/a" for cancelled bookings. |
| FR-74 | Default sort is check-in date, newest first. The manager can sort by check-in or by balance. [ASSUMPTION] |
| FR-75 | The list shows 25 rows per page. [ASSUMPTION] |
| FR-76 | A summary line above the list covers all pages of the filtered results. For Active bookings it shows: count, total price, total paid, total balance. A second figure shows "Held on cancelled bookings": the total paid on matching Cancelled bookings. |
| FR-77 | Clicking a row opens the details view. |
| FR-78 | Empty state: "No bookings match your filters." |
| FR-79 | The page has a "New booking" button. |

### 6.10 Basic settings

| ID | Requirement |
|---|---|
| FR-80 | The manager can edit company name, address, city, country, phone, email, and time zone. Currency follows FR-25. |
| FR-81 | The manager can rename an apartment and change its room count. The same limits as FR-22 apply. Names stay unique (FR-23). |
| FR-82 | The manager can add an apartment, up to 50 in total. The same rules as FR-22 and FR-23 apply. |
| FR-83 | The manager can remove an apartment only when it has no bookings of any status. The app asks for confirmation. |
| FR-84 | The manager can change their password. It needs the current password. All other sessions for that user end. |
| FR-85 | The manager can change the login email. It needs the current password. The app sends a verification link to the new address. The old address stays active until the new one is verified. |
| FR-86 | Renaming an apartment does not change any booking. Bookings link to the apartment by ID. |

### 6.11 General behaviour

| ID | Requirement |
|---|---|
| FR-87 | Every page except sign up, login, password reset, and email verification needs a valid session. Otherwise redirect to login. Middleware may redirect for speed, but every page, server action, and data query checks the session again on the server. |
| FR-88 | Every database read and write for company data uses the company ID from the session user, never from the request. |
| FR-89 | Money displays with the company currency code and thousands separators, for example "NGN 150,000.00". Money moves between server and browser as decimal text. |
| FR-90 | All dates display as "Wed, 24 Dec 2026". [ASSUMPTION] Dates move between server and browser as "YYYY-MM-DD" text. The code never builds a date from text in a local time zone. Display uses a fixed UTC zone. "Today" uses the company time zone. |
| FR-91 | Server errors show: "Something went wrong. Try again." The app logs the detail and sends it to error tracking. |

---

## 7. AI and AI-Related Tools and Solutions

**Recommendation: no AI features in the MVP.** The core promise is a strict rule (no overlap) and simple arithmetic (balance). Code handles both exactly. A language model adds cost and the risk of wrong answers to a product whose value is "never wrong about availability."

### 7.1 AI product features (all Version 2 or later)

| Idea | Problem it solves | User benefit | Cost and risk | Phase |
|---|---|---|---|---|
| Natural language availability search ("Is Apartment 3 free next weekend?") | Managers on the phone want an answer in one sentence | Faster than clicking dates | Model cost per query. Risk: it misreads a date and gives a wrong "free". Mitigation: the model only converts text to a date range. Code runs the real availability query. The answer always shows the dates it used, for example "Checking Sat 22 Nov to Mon 24 Nov". | Version 2 |
| Draft reminder messages for check-ins and balances | Writing the same WhatsApp text many times | Saves typing | Low cost. Risk: tone errors. A fixed template does most of the job without AI. | Version 2, template first |
| Read an expense receipt photo into fields | Typing expenses is slow | Faster expense entry | Per-image cost. Risk: misread amounts. The manager must confirm every field. | Version 2, only after expense tracking exists |
| Plain-language monthly summary of sales and unpaid balances | Managers do not read tables | Quick insight | Low cost. Risk: wrong numbers in text. Code computes every number. The model only words it. | Version 2 or later |

**Rules for any AI feature.**
1. Code computes facts (availability, balances, totals). A model may only translate input or word output.
2. A person confirms before anything saves.
3. Any AI answer about availability shows the dates it interpreted.
4. No guest personal data goes to a model provider without a privacy review.

### 7.2 AI-assisted development

Teams may use AI coding tools. A person reviews every line of authentication and database constraint code. The overlap table in 6.7 is the source of truth for tests. These practices belong in the engineering handbook, not in this PRD.

---

## 8. Technical Architecture

### 8.1 Overview

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | Server components and server actions keep one codebase for UI and server logic. |
| Language | TypeScript, strict mode | Catches type errors in money and date handling. |
| Database | PostgreSQL | Supports exclusion constraints, which block overlapping bookings at the database level. |
| ORM | Prisma | Typed queries and migrations. Raw SQL covers what Prisma cannot express. |
| Validation | Zod [ASSUMPTION] | One schema per form, shared by client and server. |
| Styling | Tailwind CSS [ASSUMPTION] | Fast, consistent layout work. |
| Email | A transactional email service such as Resend [ASSUMPTION] | Needed for password reset and email verification. |
| Hosting | Vercel for the app and a managed PostgreSQL such as Neon [ASSUMPTION] | Low setup effort for a small team and a small pilot. |

**Hosting rules.**
1. Pin exact versions of Next.js, Prisma, and Node at project start.
2. In week 1 of the build, measure round-trip time from the pilot country to candidate regions. Pick the nearest region that works.
3. Run the app and the database in the same region.
4. Do not let the database suspend when idle during the pilot. If the plan cannot do this, send a keep-warm request every 4 minutes.
5. Use a pooled connection string as `DATABASE_URL` for the app and a direct connection string as `DIRECT_URL` for migrations.
6. If the pinned Prisma version moves the datasource URL into `prisma.config.ts`, follow that layout.
7. Run password hashing on the Node runtime, never on the edge runtime.

### 8.2 Routes and pages

| Route | Page | Access |
|---|---|---|
| `/signup` | Sign up | Public |
| `/login` | Login | Public |
| `/forgot-password` | Request reset link | Public |
| `/reset-password/[token]` | Set new password | Public, valid token |
| `/verify-email/[token]` | Verify email | Public, valid token |
| `/register-company` | Company registration | Logged in, no company |
| `/` | Home calendar (accepts `?month=YYYY-MM`) | Logged in, has company |
| `/bookings` | Bookings list (accepts `year`, `month`, `q`, `status`, `payment`, `page`) | Logged in, has company |
| `/bookings/new` | New booking (accepts `apartmentId`, `checkIn`) | Logged in, has company |
| `/bookings/[id]` | Booking details | Logged in, has company |
| `/bookings/[id]/edit` | Edit booking | Logged in, has company |
| `/settings` | Company, apartments, password, login email | Logged in, has company |

Middleware makes fast redirects based on the session cookie and company state (FR-9, FR-87). Middleware is not the security check. Every page, action, and query checks the session again on the server (FR-87).

### 8.3 Server actions

All actions validate input with Zod, read the session, and scope by company ID.

| Action | Does |
|---|---|
| `signUp` | Creates user, sends verification email, starts session |
| `verifyEmail`, `resendVerification` | Email verification |
| `logIn`, `logOut` | Manage session, apply rate limits |
| `requestPasswordReset`, `resetPassword`, `changePassword` | Password flows |
| `changeEmail` | Starts and completes a login email change |
| `registerCompany` | Creates company and apartments in one transaction |
| `updateCompany`, `updateApartment`, `createApartment`, `deleteApartment` | Settings edits |
| `createBooking`, `updateBooking` | Validate, then insert or update, then map a database clash error to FR-56 |
| `cancelBooking`, `deleteBooking` | Status change and removal, with a History record |

Read queries (`getMonthBookings`, `listBookings`, `getBooking`) run in server components.

### 8.4 Authentication

- Email and password only.
- Hash passwords with Argon2id on the Node runtime. [ASSUMPTION] A spike in week 1 proves the chosen library deploys. If it does not, use scrypt from Node's built-in crypto.
- On login, generate a random 32-byte token. Store its SHA-256 hash in the `Session` table. Send the raw token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- Update `lastSeenAt` on a session at most once per hour.
- Server actions in Next.js carry built-in origin checks. Also check the `Origin` header on all state-changing requests. [ASSUMPTION]
- Reset and verification tokens work the same way: store only the hash, expire on time, one use.
- Send these headers on every response: HSTS, `X-Content-Type-Options: nosniff`, a basic content security policy, and `Referrer-Policy: no-referrer`. The reset and verification pages load no third-party scripts.
- Rate limits use the `RateLimitHit` table. The `bucket` value holds a SHA-256 hash of its key, so the table stores no raw emails.

### 8.5 Data separation between companies

1. Every company-owned table has a `companyId` column.
2. The server reads `companyId` from the session user. It never trusts an ID from the browser.
3. Every query filters by `companyId`. Wrap Prisma in one data-access module. An ESLint restricted-import rule fails the build if any file outside that module imports the Prisma client.
4. A composite foreign key on `Booking` ties `apartmentId` and `companyId` to the same apartment row. The database then rejects a booking that points to another company's apartment.
5. Add tests: user A requests a booking ID, apartment ID, and list filter that belong to company B. Every test must return "not found". The tests cover every server action, not only bookings.

### 8.6 How the clash check stays safe under simultaneous requests

An application check alone fails when two requests arrive together. Both read "free", and both insert.

Fix: add a PostgreSQL exclusion constraint. The database rejects the second insert, even under heavy timing overlap.

- The constraint uses `daterange("checkIn", "checkOut", '[)')` and applies only to rows with status `ACTIVE`.
- The app still runs a friendly pre-check to build a clear error message with the conflicting guest and dates.
- If the constraint fires anyway, Prisma wraps the database error. The action reads the underlying code `23P01` from that wrapped error, looks up the conflicting booking, and returns the same message as FR-56. An integration test proves this mapping works with the pinned Prisma version.
- The same constraint covers edits and any future path that writes bookings.

Prisma cannot declare an exclusion constraint. Add it in a hand-written migration (see 8.8). After the migration, `prisma migrate dev` must report no drift.

### 8.7 Prisma data model

```prisma
// Pin Prisma at project start. See 8.1, hosting rule 6.
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // pooled connection for the app
  directUrl = env("DIRECT_URL")   // direct connection for migrations
}

enum BookingStatus {
  ACTIVE
  CANCELLED
}

enum BookingEventKind {
  CREATED
  UPDATED
  CANCELLED
  DELETED
}

enum EmailTokenKind {
  VERIFY_EMAIL
  CHANGE_EMAIL
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique // stored lowercase
  emailVerifiedAt DateTime?
  fullName        String
  passwordHash    String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // MVP: one user per company. The unique constraint enforces it.
  // Version 2: drop @unique and add a role field for multiple accounts.
  companyId String?  @unique
  company   Company? @relation(fields: [companyId], references: [id], onDelete: Cascade)

  sessions    Session[]
  resetTokens PasswordResetToken[]
  emailTokens EmailToken[]
}

model Session {
  id         String   @id // SHA-256 hash of the cookie token
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt  DateTime // idle expiry, 7 days from last activity
  lastSeenAt DateTime @default(now())
  deviceClass String? // "laptop" or "phone", for pilot analysis
  createdAt  DateTime @default(now()) // absolute limit is 30 days from here

  @@index([userId])
  @@index([expiresAt])
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
}

model EmailToken {
  id        String         @id @default(cuid())
  kind      EmailTokenKind
  email     String         // the address being verified
  tokenHash String         @unique
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime       @default(now())

  @@index([userId])
}

// Counts attempts for login, sign-up, reset, and resend limits.
// "bucket" holds a SHA-256 hash of the limit key. A daily job deletes rows older than 24 hours.
model RateLimitHit {
  id        String   @id @default(cuid())
  bucket    String
  createdAt DateTime @default(now())

  @@index([bucket, createdAt])
}

model Company {
  id        String   @id @default(cuid())
  name      String
  address   String?
  city      String?
  country   String   @db.Char(2) // ISO 3166-1 alpha-2
  phone     String?
  email     String?
  currency  String   @db.Char(3) // ISO 4217, editable until the first booking
  timeZone  String   // IANA name, for example "Africa/Lagos"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user       User?
  apartments Apartment[]
  bookings   Booking[]
  events     BookingEvent[]
}

model Apartment {
  id        String   @id @default(cuid())
  companyId String
  company   Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  name      String
  roomCount Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings Booking[]

  // Needed so Booking can reference (id, companyId) together.
  @@unique([id, companyId])
  @@index([companyId])
  // Case-insensitive unique name per company is added in raw SQL (8.8).
}

model Booking {
  id          String        @id @default(cuid())
  companyId   String
  company     Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  apartmentId String
  // NoAction lets a company delete cascade cleanly. Test it in staging.
  apartment   Apartment     @relation(fields: [apartmentId, companyId], references: [id, companyId], onDelete: NoAction)

  guestName   String
  guestPhone  String
  notes       String?       @db.VarChar(500)

  // Calendar dates with no time. In code, always move them as "YYYY-MM-DD" text (FR-90).
  checkIn     DateTime      @db.Date
  checkOut    DateTime      @db.Date

  // Money as exact decimals. Never use floats for money.
  // Balance is NOT stored. It is totalPrice minus amountPaid.
  // In code, move money as decimal text (FR-89).
  totalPrice  Decimal       @db.Decimal(12, 2)
  amountPaid  Decimal       @default(0) @db.Decimal(12, 2)

  status      BookingStatus @default(ACTIVE)
  cancelledAt DateTime?

  requestId    String?      // makes a retried save safe (FR-52)
  entrySeconds Int?         // client-reported, used only for the G3 metric (FR-54)

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt // also the edit conflict token (FR-61)

  @@unique([companyId, requestId])
  @@index([companyId, checkIn])
  @@index([apartmentId, checkIn])
  @@index([companyId, status])
}

// History of booking changes. No foreign key on bookingId, so rows survive a delete.
model BookingEvent {
  id        String           @id @default(cuid())
  companyId String
  company   Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)
  bookingId String
  kind      BookingEventKind
  changes   Json             // never holds guest name, phone, or notes
  createdAt DateTime         @default(now())

  @@index([companyId, bookingId, createdAt])
}
```

**Design choices**

| Choice | Reason |
|---|---|
| `@db.Date` for check-in and check-out | A stay is a range of calendar days. A time value would add timezone errors in the database. The code also treats dates as text at every boundary (FR-90). |
| `Decimal(12, 2)` for money | Exact arithmetic. Floats cause rounding errors. Prisma returns Decimal objects that cannot cross to client components, so code converts them to text. |
| Balance not stored | A stored balance can drift out of sync with price and paid. A computed value cannot. |
| `status` enum plus `cancelledAt` | Keeps history and lets the exclusion constraint ignore cancelled rows. |
| `companyId` on `Booking` | Lets every query filter by company without a join. |
| Composite foreign key `(apartmentId, companyId)` | Blocks cross-company references at the database level. |
| `User.companyId` unique | Enforces one account per company in the MVP. Removing it is a small Version 2 migration. |
| Session ID is a token hash | A database leak does not expose usable session tokens. |
| `BookingEvent` without a foreign key | History survives a delete and holds no guest personal data. |
| `requestId` unique per company | A retry after a lost reply returns the saved booking. |
| `RateLimitHit` table | Serverless instances do not share memory, so limits need shared storage. |
| No index on guest name | A partial-match search cannot use it. Data volumes in the MVP do not need one. |
| Apartment delete only when no bookings | Avoids orphaned booking history. Version 2 should add archive. |

### 8.8 Raw SQL migration (constraints Prisma cannot express)

Run this through a direct connection (`DIRECT_URL`).

```sql
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
```

### 8.9 Key queries

**Month calendar.** Fetch all active bookings for the company that overlap the month:

```ts
// monthStart = first day of month, monthEnd = first day of next month
// Both are built from "YYYY-MM-DD" text, never from local time.
prisma.booking.findMany({
  where: {
    companyId,
    status: "ACTIVE",
    checkIn: { lt: monthEnd },
    checkOut: { gt: monthStart },
  },
  orderBy: { checkIn: "asc" },
});
```

**Clash pre-check** (for the friendly message; the constraint is the real guard):

```ts
prisma.booking.findFirst({
  where: {
    companyId,
    apartmentId,
    status: "ACTIVE",
    id: excludeBookingId ? { not: excludeBookingId } : undefined,
    checkIn: { lt: newCheckOut },
    checkOut: { gt: newCheckIn },
  },
});
```

**Edit with conflict check** (FR-61):

```ts
// count is 0 when another save changed the booking first
const result = await prisma.booking.updateMany({
  where: { id, companyId, updatedAt: loadedUpdatedAt },
  data: changes,
});
if (result.count === 0) {
  // return "This booking changed. Reload and try again."
}
```

### 8.10 Non-functional requirements

| Area | Requirement |
|---|---|
| Security | HTTPS only. HSTS enabled. Argon2id passwords. Hashed tokens. Rate limits in the database. Input validation on every action. Security headers from 8.4. |
| Performance | Calendar targets in FR-37. Booking save under 500 ms on the server, measured with a warm database. |
| Reliability | Provider backups plus a daily `pg_dump` kept 14 days in separate storage. One tested restore before the pilot starts. [ASSUMPTION] |
| Operations | Error tracking on the server and browser. An uptime check on the login page. A separate staging database where every migration runs first. A daily job deletes old `RateLimitHit` rows and expired tokens. |
| Errors | No lost form data on a network or server error. Clear messages. |
| Privacy | Guest names and phones are personal data. Store only what the form needs. Restrict database access. Complete the local legal check in Open Question O1 before the pilot. |
| Browser support | Latest Chrome, Edge, Firefox, and Safari on laptops. [ASSUMPTION] |
| Accessibility | Keyboard use for the booking form and calendar bars. Text contrast of at least 4.5 to 1. Meaning never depends on colour alone. |
| Testing | Unit tests for the overlap rule (every row in 6.7). An integration test that fires 10 simultaneous bookings for the same dates and expects exactly 1 success. Cross-company access tests for every action (8.5). A retry test: the same `requestId` twice returns one booking. An edit conflict test. A test that maps a database clash to the FR-56 message. Date and money tests that run under three system time zones (for example `Africa/Lagos`, `Pacific/Auckland`, `America/Los_Angeles`). A money round trip from database to browser with no rounding change. A company deletion test in staging. |

### 8.11 Build order and cut order

**Build order.**
1. Project setup, pinned versions, region test, hashing spike, staging database.
2. Data model, raw SQL migration, and the clash and cross-company tests.
3. Sign up, login, sessions, rate limits, password reset, email verification.
4. Company registration.
5. New booking with the clash check, idempotent save, and History.
6. Calendar, including refresh and click rules.
7. Booking details, edit, cancel, and delete.
8. Bookings list.
9. Settings.
10. Operations: backups with a restore drill, error tracking, uptime check.

**Cut order if time runs short.** Cut in this order, and never cut the clash rules.
1. Month and status filters in the list (keep search and "Unpaid only").
2. Go to date control.
3. Phone-number search.
4. Change login email.

---

## 9. Business Model

### 9.1 Who pays

The hotel or service apartment company pays. The manager is the user. The owner is often the buyer. Pricing questions go to the buyer.

### 9.2 Pilot (MVP phase)

- Free for 3 pilot businesses for 4 weeks.
- Cost to you in the pilot: hosting, email, error tracking, and backup storage. Measure it in week 1 and replace the estimate. Estimate: 0 to 25 USD per month. [ASSUMPTION]
- Purpose: prove G1 to G3, and learn what the buyer will pay.

### 9.3 Price test for the first paying customers

The MVP offers one feature set. Test price by apartment count. The prices are illustrative.

| Band | Price (illustrative) | Includes |
|---|---|---|
| Up to 10 apartments | 9 USD per month, or 90 USD per year | All MVP features, 1 account |
| 11 to 30 apartments | 19 USD per month, or 190 USD per year | All MVP features, 1 account |
| More than 30 apartments | Set after the pilot | |

All prices are [ASSUMPTION]. Validate them with the buyer. Set plan contents again after Version 2 features exist. Charge in local currency where payment providers support it.

### 9.4 Rough unit economics (assumptions, 9 USD band)

| Item | Number |
|---|---|
| Monthly revenue per customer | 9 USD |
| Variable cost per customer (database, email, payment fees at about 3%) | about 1 USD |
| Gross margin per customer | about 8 USD (89%) |
| Fixed monthly cost (hosting, domain, tools) | about 40 USD |
| Break-even for hosting and tools only | 40 / 8 = 5 paying customers. This does not cover the developer's time or support. |
| Monthly churn | 5% [ASSUMPTION], so an average customer stays about 20 months |
| Gross profit per customer over its life | about 160 USD |
| Customer acquisition cost target | under 30 USD |
| Support time per customer | Measure in the pilot. Record hours per month. |
| Target at month 12 after launch | 100 paying customers, about 800 USD gross profit per month before labour |

These numbers test the idea. They are not forecasts.

### 9.5 Go-to-market for the first 100 customers [ASSUMPTION]

Direct outreach to local hotel and apartment managers, referrals from pilot users, and short demo videos. Avoid paid ads until the pilot proves retention.

---

## 10. Success Metrics

| Metric | Definition | Target | How to measure |
|---|---|---|---|
| Overlap count | Overlapping active bookings for one apartment in the database | 0 | The constraint, plus a nightly SQL check |
| Booking coverage (G1) | Share of real bookings, taken from the manager's WhatsApp and notebook, that are in the app. Count them in a weekly 10-minute reconciliation with the developer. | At least 95%, with at least 50 bookings in total across the pilot | Weekly reconciliation sheet |
| Real clashes (G1) | Guests who arrive to a taken apartment | 0 | Weekly question to each manager |
| Booking entry time (G3) | `entrySeconds` on bookings created after the onboarding session. Ignore values over 600. | Median under 60. 90th percentile under 120. | `Booking.entrySeconds` |
| Time to first booking (G4) | Minutes from saving company registration to saving the first booking, in a test with 5 outsiders | At least 4 of 5 under 10 minutes | Observed test before the pilot |
| Balance visibility (G2) | Managers who find all unpaid balances using the list within 30 seconds | 3 of 3 | Observed task in the final interview |
| Availability check (G5) | Seconds to answer "Is apartment X free on date Y?" | Under 15 seconds, and faster than the baseline | Observed task in the final interview, compared with the baseline in section 2 |
| Pilot retention | Pilot businesses with a session `lastSeenAt` in the final week | 3 of 3 | `Session.lastSeenAt` |
| Willingness to pay (G6) | Businesses that pay a first invoice, or sign a dated commitment, at a named price | At least 2 of 3 | Payment record or signed note. Interview the buyer. |
| Data entry errors | Support requests about wrong dates, amounts, or clashes | Fewer than 3 per business | Support log |
| Calendar speed | Browser time to a visible calendar, and server time | 95th percentile under 1.5 s in the browser and under 400 ms on the server | Browser and server timing |
| Device use | Share of sessions from phones | Report only. Use it to decide on mobile layout. | `Session.deviceClass` |

Metrics exclude bookings entered during the onboarding session.

**Pilot decision gates**

| Decision | Rule |
|---|---|
| Go | G1, G2, and G3 are met, and at least 2 of 3 businesses pay or sign a dated commitment |
| Extend by 2 weeks | One gate is missed for a cause the team can fix in 2 weeks |
| Stop | Any other result |

---

## 11. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Managers keep using notebooks and WhatsApp out of habit | High | High | Make the calendar faster than the notebook. Onboard in person. In one session, the developer enters current and future bookings through the app, on the manager's account. Past history is not entered. |
| R2 | A clash slips through under simultaneous requests | Low | Very high | Database exclusion constraint (8.6). Concurrency integration test. |
| R3 | Bookings made outside the app (phone, walk-in, WhatsApp) never get entered, so the calendar lies | High | High | Keep the "new booking" flow under 60 seconds. Ask managers to enter every booking the same day, including walk-ins. Run the weekly reconciliation (section 10). Plan a quick walk-in form for Version 2. |
| R4 | Pilot businesses will not pay after the pilot | Medium | High | Ask the buyer about price during the pilot. Test the first price band early. |
| R5 | Cross-company data leak | Low | Very high | Company-scoped data layer, composite foreign key, import lint rule, cross-company tests (8.5). |
| R6 | Poor internet at hotels loses a booking mid-save | Medium | Medium | Keep form values on failure. Make retries safe (FR-52). Show clear errors. Decide on offline support after the pilot. |
| R7 | Single account means the manager shares one login with staff | Medium | Medium | State the rule in onboarding. Keep the History list (FR-62) so changes are visible. Treat staff accounts as an early Version 2 candidate. |
| R8 | Account lockout or lost password stops a business for a day | Medium | Medium | Working reset flow. Lockouts keyed on email plus IP address (FR-12). Manual support path during the pilot. |
| R9 | Wrong dates entered by mistake | Medium | Medium | Show nights count and a clear date format. Confirm unusual dates (FR-46). Allow edits. Confirm cancels and deletes. |
| R10 | Guest personal data is mishandled | Low | High | Collect only name and phone, plus optional notes with a warning. Use encrypted storage and access controls. Complete the legal check (O1) before the pilot. |
| R11 | Scope grows before the pilot ends | Medium | Medium | Hold the Version 2 list firm. Log requests under Open Questions. |
| R12 | Single developer or small team misses the timeline | Medium | Medium | Follow the build order in 8.11. Use the cut order in 8.11. |
| R13 | Email delivery fails in the pilot country, so reset and verification emails do not arrive | Medium | Medium | Test delivery to the pilot's email providers in week 1. Keep a manual reset path during the pilot. |
| R14 | A stale calendar tab shows "free" when the apartment is taken | Medium | Medium | Refresh every 60 seconds and on focus (FR-39). The server still blocks the clash. |
| R15 | Hosting latency or database cold starts make the app slow | Medium | Medium | Region test, same region for app and database, no idle suspend (8.1). |
| R16 | Data loss from a failed database or a bad migration | Low | Very high | Provider backups, daily dump to separate storage, a tested restore, and a staging database (8.10). |
| R17 | The buyer is not the user, so the person who tries the product cannot say yes | Medium | High | Interview the owner and the manager. Count a payment or a signed commitment (G6). |

---

## 12. Open Questions and Decisions

### 12.1 Decisions made (confirm at pilot end)

| # | Decision | Why | Review at pilot end |
|---|---|---|---|
| D1 | A cancelled booking keeps its amount paid. The app shows it as "Held on cancelled bookings" and does not calculate refunds. | Keeps the money record honest | Do managers need refund handling? |
| D2 | No restore of a cancelled booking. The manager creates a new booking. | A restore needs a fresh clash check | Do managers cancel by mistake often? |
| D3 | The booking unit is the whole apartment. Hotels register each room as an apartment. | Keeps the clash rule simple | Do hotels need room-level booking sooner? |
| D4 | One running "amount paid" plus a History list of changes. | Shows when payments arrived without a ledger | Do managers need a full payment ledger? |
| D5 | Dates only. The app stores no check-in or check-out time. | Same-day turnover works with dates | Is a standard check-in time needed? |
| D6 | One currency per company. No tax fields. | Keeps price fields simple | Which tax rules apply to receipts? |
| D7 | A notes field is in the MVP. | Managers need a place for details | Do notes hold data that should be fields? |
| D8 | Managers can add apartments and remove apartments with no bookings. | Typos and growth would otherwise need developer database edits | Do managers need archive? |
| D9 | No Excel import. The developer enters current and future bookings in one onboarding session. | Keeps the MVP small | How long did onboarding take per business? |
| D10 | The pilot country is Nigeria. Defaults are NGN and Africa/Lagos. | Confirmed by the product owner | Do pilot businesses all operate in Nigeria, and do they need other currencies? |

### 12.2 Open questions

| # | Question | Why it matters | Owner | Answer by |
|---|---|---|---|---|
| O1 | Which data protection law applies, and what does it require? For Nigeria, check the Nigeria Data Protection Act 2023. | Legal duties on storing names and phones | Product owner, local legal advice | Before the pilot starts |
| O2 | Which region gives the best round-trip time from the pilot country? | Decides if FR-37 is reachable | Developer | Week 1 of the build |
| O3 | Does the chosen hashing library deploy on the chosen host? | Decides Argon2id or the scrypt fallback | Developer | Week 1 of the build |
| O4 | What restore window does the chosen database plan give? | Decides if the daily dump is enough | Developer | Week 1 of the build |
| O5 | Do managers use phones for the calendar? | Decides on mobile layout | Pilot managers, device data | Pilot end |
| O6 | Is offline mode needed? | Poor connections could block bookings | Pilot managers | Pilot end |
| O7 | Should the app show total revenue per month? | Moves toward sales tracking. The summary line (FR-76) covers the MVP. | Pilot managers | Pilot end |

---

## Assumptions

| # | Assumption | Why I made it | Risk if wrong | How we check |
|---|---|---|---|---|
| A1 | All pilot businesses operate in Nigeria, with NGN and Africa/Lagos as defaults | The product owner confirmed Nigeria as the pilot country | A pilot business uses another currency or time zone | Check each business's country, currency, and time zone at onboarding |
| A2 | Mobile layout is out of scope. The app targets laptops. | The product runs on the company laptop | Managers try it on a phone and find it hard to use | Log device class. Report at pilot end (O5). |
| A3 | Single language (English) | No other language was requested | Pilot users need another language | Ask at onboarding |
| A4 | Password length 8 to 128 characters, no composition rules | Fits Argon2id | Users complain or pick weak passwords | Support log. Review at pilot end. |
| A5 | Login limits in FR-12 | Stops password guessing without easy lockout abuse | Legitimate users get blocked | Count blocks in the pilot |
| A6 | Sessions last 7 days idle and 30 days in total | Balance between convenience and safety | Shared laptops stay signed in too long | Ask managers at the final interview |
| A7 | 1 to 50 apartments, 1 to 20 rooms | Fits small hotels and keeps the calendar readable | A larger business cannot register | Check pilot sizes before signing them up |
| A8 | Currency is editable until the first booking | Existing amounts would lose meaning after that | A manager needs a change later and asks support | Count support requests |
| A9 | Past check-in dates are allowed, with a warning for unusual dates | Managers record bookings after the fact | Typos create stray bookings | Count date edits within 24 hours of creation |
| A10 | Green with a "Paid" tick and amber with "Owes" text | Fast cue for "who owes", and not colour only | Bar text is too crowded | Observed task in the final interview |
| A11 | Cancelled bookings are read-only | Protects history | Managers want to fix a typo on a cancelled booking | Support log |
| A12 | List defaults: Active status, newest check-in first, 25 rows per page | Reasonable defaults | Managers want other defaults | Ask at the final interview |
| A13 | Dates display as "Wed, 24 Dec 2026" | Unambiguous across regions | Managers prefer another format | Ask at onboarding |
| A14 | Zod validation | Shares one schema between client and server | None significant | Code review |
| A15 | Tailwind CSS | Speed of building | None significant | Code review |
| A16 | A transactional email service (for example Resend) delivers to pilot email providers | Reset and verification need email | Delivery problems in the pilot country | Send test emails in week 1 (R13) |
| A17 | Vercel and Neon in a region near the pilot country | Low setup cost | Latency or cost issues | Region test in week 1 (O2) |
| A18 | Argon2id deploys on the Node runtime. Built-in scrypt is the fallback. | Current best practice | Library compatibility problems | Hashing spike in week 1 (O3) |
| A19 | Origin-header check on state-changing requests | Extra protection against cross-site request forgery | Blocks a legitimate proxy setup | Test on staging |
| A20 | Provider backups plus a daily dump kept 14 days | Basic protection for a booking business | A problem goes unnoticed for over 14 days | Restore drill before the pilot |
| A21 | Supported browsers: latest Chrome, Edge, Firefox, Safari on laptops | Covers most laptop users | A pilot user runs an old browser | Check each pilot laptop at onboarding |
| A22 | Pilot hosting cost of 0 to 25 USD per month | Free and starter tiers | Always-on database costs more | Measure the real bill in week 1 and week 4 |
| A23 | Price bands of 9 and 19 USD per month | Placeholder pricing to test unit economics | Local willingness to pay is much lower | Ask the buyer in the final interview (G6) |
| A24 | Payment processing fees of about 3% | Typical card fee level | Local payment methods cost more | Check provider price pages before launch |
| A25 | First-100-customers plan: direct outreach and referrals | Low cost for a small product | Slow growth | Track leads from each pilot referral |
| A26 | Fixed monthly cost of about 40 USD after the pilot | Estimate for hosting, domain, and tools | The real cost is higher | Compare with the pilot bill |
| A27 | Monthly churn of 5% | Placeholder for the lifetime estimate | Churn is higher, so lifetime profit drops | Track retention after launch |
| A28 | Support time of about 1 hour per customer per month | Placeholder for margin checks | Support costs more | Log support hours in the pilot |
| A29 | The calendar refreshes every 60 seconds | Balances freshness and load | Too slow for busy hotels | Ask Tunde at the final interview |
| A30 | The time zone defaults to Africa/Lagos | Pilot country is Nigeria | A pilot business sits in another zone | Check each pilot company's setting at onboarding |
| A31 | Unusual-date warning at 365 days away or 60 nights | Catches typos without nagging | Warning fires on normal long stays | Count warnings and confirmations in the pilot |
| A32 | Verification link lasts 24 hours | Common baseline | Email delays make links expire | Count resend requests |
| A33 | Reset link lasts 60 minutes | Common baseline | Email delays make links expire | Count reset requests that fail |
