# screens.md

One job: how the screens behave. Visual styling belongs to the frontend-design skill. Where a PRD value is a visual fact (colour meaning, contrast), it is stated here as a requirement.
Source: PRD 6.4, 6.5, 6.6, 6.8, 6.9, 6.10. Message text is in validation-and-messages.md. What each write does is in write-rules.md.

## Company registration

1. The apartment list starts with one row. An "Add apartment" button adds a row. Each row has a remove control. Limits are in validation-and-messages.md. Why: a single-apartment business can register with no extra clicks (FR-22).
2. On success, go to Home (FR-27).

## Home calendar

1. Show one month. The default is the current month in the company time zone. Why: managers think in the month they are in (FR-28).
2. Rows are apartments sorted by name. Columns are days. Weekends look different from weekdays. Keep the apartment name column and the day header row in view while scrolling. Why: a manager must always know which apartment and day a cell is (FR-29).
3. Draw each active booking as a bar from the middle of the check-in cell to the middle of the check-out cell. Why: it shows same-day turnover (FR-30).
4. Bar content: green with a "Paid" tick when balance is 0. Amber with "Owes" and the balance with currency code when balance is above 0, for example "Owes NGN 45,000.00". Always show the guest name. Cut long text with an ellipsis. Put the legend above the grid. [ASSUMPTION on colours] Why: meaning must never depend on colour alone, and the manager must see who owes at a glance (FR-31).
5. A booking that spans two months shows in both. Cancelled bookings never show. Why: the manager scans one month at a time, and cancelled stays free the nights (FR-32, FR-36).
6. Controls: Previous month, Next month, Today, Go to date, the month and year, and a New booking button that opens with nothing filled. Why: these are the ways to answer "is it free on this date" (FR-33).
7. Click rule. Clicking a bar opens that booking. Clicking elsewhere in a cell works by night. If the night starting on that day is booked, open that booking. If it is free, open New booking with that apartment and that date as check-in, and check-out set to the next day. In a turnover cell, the night starting that day belongs to the booking that checks in. Why: one click answers "free or taken" and then acts on it (FR-34).
8. Refresh every 60 seconds while the tab is visible, and when the tab regains focus. Show "Updated 14:02" with the last refresh time. [ASSUMPTION] Why: a stale tab can show "free" for a taken apartment. The server still blocks the clash (FR-39).
9. Bars are focusable buttons with a text label. Why: keyboard users need a way to open a booking (FR-40).
10. On screens narrower than 1280 px, the grid scrolls inside its own area. The page body never scrolls sideways. Why: the PRD requires it (FR-41).
11. With no bookings in the month, show the calendar empty text. Why: an empty grid looks broken (FR-38).
12. Target, at the 95th percentile for 50 apartments and 31 days: visible in 1.5 seconds in the browser, server time under 400 ms. [ASSUMPTION] Why: a slow calendar loses to the notebook (FR-37).

## New and edit booking form

1. Fields: apartment (select), guest name, guest phone, check-in, check-out, total price, amount paid, balance (read-only, updates live as the person types), and notes. Edit opens the same form, filled in. Why: one form means one set of rules (FR-42, FR-49, FR-63).
2. The Save button blocks a second click and shows "Saving..." until the server replies. Why: it prevents double saves (FR-52).
3. On a clash or a network failure, the form stays open and keeps every value. Why: retyping a booking on a poor connection is the failure this app exists to remove (FR-50, FR-53).
4. On a successful create, open the calendar on the check-in month, show the new bar, and show the saved message. Why: the person sees the proof that it saved (FR-51).
5. On New booking, record the seconds from opening the form to the first click on Save, and send them with the booking. Use them for the G3 metric only. Why: G3 needs real entry times (FR-54).

## Booking details

1. Show every field, the status, the created and last updated times, and the History list. Each History line shows the time and the change, for example "Amount paid: 50,000.00 to 80,000.00". Offer Edit, Cancel, and Delete. Why: the manager sees when each payment arrived, since there is no ledger (FR-35, FR-62, FR-64).
2. Cancel and Delete ask for the confirmation texts. Delete is disabled when amount paid is above 0, with the PRD text. Why: it avoids accidental loss. The server enforces the rule in write-rules.md.
3. A cancelled booking shows as read-only. Why: cancelled bookings cannot be edited (FR-66).
4. A cancelled booking shows its balance as "n/a" everywhere, and is left out of owed totals. Why: a cancelled booking owes nothing, and "n/a" avoids a false figure (FR-68).

## Bookings list

1. Filters: Year (default current year, plus "All years"), Month (default "All months"), Status (All, Active, Cancelled, default Active), Payment (All, or "Unpaid only"). "Unpaid only" shows active bookings with a balance above 0 and sets Year to "All years" unless the manager changes it. Why: unpaid money is rarely in the current year only (FR-70).
2. A booking appears in a month if any night of its stay falls in that month. Why: a stay over a month end belongs to both months (FR-71).
3. Search matches guest name or phone digits, case-insensitive, partial. Why: managers search by whatever the caller gave them (FR-72).
4. Columns: apartment, guest, phone, check-in, check-out, nights, total, paid, balance, status. Why: each answers a question the manager asks on a call (FR-73).
5. Default sort is check-in date, newest first. The manager can sort by check-in or by balance. [ASSUMPTION] Show 25 rows per page. [ASSUMPTION] Why: it balances speed and scanning (FR-74, FR-75).
6. A summary line above the list covers all pages of the filtered results. For Active bookings it shows count, total price, total paid, and total balance. A second figure, "Held on cancelled bookings", shows the total paid on matching Cancelled bookings. Why: unpaid money must be visible at a glance (FR-76).
7. Clicking a row opens the details view. The page has a New booking button. Show the list empty text when nothing matches. Why: they are the shortest paths to the next action (FR-77 to FR-79).

## Settings

1. The manager can edit company name, address, city, country, phone, email, and time zone. Why: companies move and correct typos (FR-80).
2. The manager can rename an apartment, change its room count, and add an apartment. The remove control asks for confirmation. Why: developer database edits would otherwise be needed (FR-81 to FR-83).
3. Renaming an apartment changes no booking. Bookings link by ID. Why: history must not change when a name does (FR-86).

## Targets for every screen

1. Keyboard use works for the booking form and the calendar bars. Text contrast is at least 4.5 to 1. Why: this is the PRD accessibility rule.
2. Target the latest Chrome, Edge, Firefox, and Safari on laptops. [ASSUMPTION] Why: it sets which browser features the code may use.

## Ask first (the PRD does not say)

- A conflict in the PRD. FR-30 draws the bar ending mid-cell on the check-out day. But the PRD 8.9 calendar query drops a booking whose check-out is the first day of the month, so that day's half cell would be missing. Ask which one wins.
- What the Go to date control does.
- What to do with an invalid `month` parameter.
- Which time zone and format the "Updated" time uses.
- Whether an edit sets `entrySeconds`.
- Where to go after edit, cancel, and delete. The PRD only states it for create.
