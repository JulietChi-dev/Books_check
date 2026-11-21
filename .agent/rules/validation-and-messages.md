# validation-and-messages.md

One job: field limits and the exact words shown to the person.
Source: PRD FR-1 to FR-23, FR-25, FR-26, FR-38, FR-42 to FR-48, FR-51 to FR-53, FR-56, FR-61, FR-65, FR-67, FR-78, FR-91.
Date and money formats are in dates-and-money.md.

1. Use the limits and messages below exactly. Why: the PRD sets them, the agent may not invent them, and tests compare the words.
2. Where the database also checks a rule (check-out after check-in, money range, room count, unique apartment name), the form and the database must say the same. Why: a form that passes what the database refuses gives the person a server error instead of a clear message.
3. If a limit or message you need is not here, stop and ask. Why: a guessed message becomes product behaviour.

## Field limits

| Field | Rule | Source |
|---|---|---|
| Full name | Required, 2 to 80 characters | FR-2 |
| Email | Required, valid format, stored lowercase, unique across users | FR-3, FR-4 |
| Password | 8 to 128 characters, no composition rules. [ASSUMPTION] Confirm password must match | FR-5, FR-6 |
| Terms checkbox | Required. Label: "I accept the terms and privacy notice", with links | FR-1 |
| Company name | Required, 2 to 100 characters | FR-20 |
| Country, currency, time zone | Required select lists. Currency is an ISO 4217 code. Defaults: Nigeria, NGN, Africa/Lagos | FR-20 |
| Company address | Optional, up to 200 characters | FR-20 |
| Company city, phone, email | Optional. If filled, each must pass its format rule | FR-20 |
| Phone (company and guest) | Count only digits: 7 to 15. Accept spaces and hyphens, then remove them. Keep a leading plus. Store the rest | FR-21 |
| Apartment list | 1 to 50 rows. [ASSUMPTION on limits] | FR-22, FR-82 |
| Apartment name | Required, 1 to 60 characters, trimmed. Unique per company, ignoring case | FR-22, FR-23 |
| Room count | Required whole number, 1 to 20. [ASSUMPTION on limits] | FR-22 |
| Currency change | Allowed only while the company has no bookings. [ASSUMPTION] | FR-25 |
| Guest name | Required, 2 to 80 characters | FR-43 |
| Guest phone | Required, same rule as phone above | FR-44 |
| Check-out | Must be later than check-in | FR-45 |
| Past check-in | Allowed. [ASSUMPTION] | FR-46 |
| Unusual stay | Ask for confirmation if check-in is more than 365 days from today, or the stay is over 60 nights. [ASSUMPTION] | FR-46 |
| Total price | 0 to 9,999,999,999.99, up to 2 decimals. [ASSUMPTION] | FR-47 |
| Amount paid | 0 or more, never above total price. Default 0 | FR-48 |
| Notes | Optional, up to 500 characters | FR-42 |

## Exact messages

| Where | Text | Source |
|---|---|---|
| Invalid email | Enter a valid email address. | FR-3 |
| Email taken | An account with this email already exists. | FR-4 |
| Password length | Use 8 to 128 characters. | FR-5 |
| Password mismatch | Passwords do not match. | FR-6 |
| Wrong login | Email or password is incorrect. | FR-11 |
| Login blocked | Too many attempts. Try again in 15 minutes. | FR-12 |
| Forgot password reply | If this email has an account, we sent a reset link. | FR-16 |
| Unverified banner | Verify your email (with a "Resend" link) | FR-8 |
| Duplicate apartment | Two apartments share the name 'X'. | FR-23 |
| Apartment helper text | A hotel registers each rentable room as an apartment. | FR-26 |
| Notes helper text | Do not enter ID or card numbers. | FR-42 |
| Dates out of order | Check-out must be after check-in. | FR-45 |
| Unusual dates | Check the dates. This stay starts on DATE and lasts N nights. Save anyway? | FR-46 |
| Paid above total | Amount paid cannot be more than the total price. | FR-48 |
| Edit lowers total below paid | Total price cannot be less than the amount already paid. Lower the amount paid first. | FR-48 |
| Clash | Apartment X is already booked from DATE to DATE (Guest NAME). | FR-56 |
| Edit conflict | This booking changed. Reload and try again. | FR-61 |
| Save in progress | Saving... (on the Save button) | FR-52 |
| Saved | Booking saved. | FR-51 |
| Network failure | Could not save. Check your connection and try again. | FR-53 |
| Server error | Something went wrong. Try again. | FR-91 |
| Cancel confirm | Cancel this booking? It will leave the calendar but stay in your list as Cancelled. | FR-65 |
| Delete confirm | Delete permanently? This cannot be undone. | FR-67 |
| Delete disabled | Cancel instead. Bookings with payments cannot be deleted. | FR-67 |
| Calendar empty | No bookings this month. Click any date to add one. | FR-38 |
| List empty | No bookings match your filters. | FR-78 |

## Ask first (the PRD has no text or rule)

- Field error text for name length, phone format, company name, apartment name length, room count, and price range.
- Whether "more than 365 days from today" means past, future, or both.
- Text for an expired or used reset or verification link.
- Text for the sign up, resend, and forgot password rate limits.
- Text for an unticked terms checkbox.
- The not found page text.
- Success text for cancel, delete, settings saves, password change, and email change.
- The apartment removal confirmation (FR-83).
