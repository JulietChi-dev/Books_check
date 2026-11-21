# write-rules.md

One job: what each write does, and how repeats and failures are handled.
Source: PRD FR-24, FR-52, FR-61, FR-65 to FR-69, FR-83, FR-91, and 8.9.
Message text is in validation-and-messages.md.

1. An action that writes more than one row runs in one transaction. Registration creates the company and all apartments in one transaction. If any step fails, nothing saves. Why: a half-created company would block the manager.
2. Write a `BookingEvent` row in the same transaction as each create, update, cancel, and delete. Write it only when the change itself succeeded. It holds changes to dates, apartment, amounts, and status. It never holds guest name, phone, or notes. After a delete, only the booking ID, apartment, dates, and deletion time remain. Why: a change and its record must stand or fall together, and personal data must not outlive a delete.
3. Retry safety. The form creates a request ID when it opens. Create stores it with the booking. A repeat request with the same ID, for the same company, returns the saved booking as a success. It never reports a clash with itself. Why: a lost reply followed by a retry must not look like a double booking.
4. Two requests with the same ID can arrive together. When the unique rule on company and request ID fires, look up the saved booking and return it as a success. The PRD does not spell out this case. State it in the assumptions. Why: otherwise the person sees an error for a booking that saved.
5. Edit conflict. The edit form sends the `updatedAt` it loaded. Save with a conditional update on `id`, `companyId`, and `updatedAt`. If the count is 0, return the FR-61 message and change nothing. Why: it stops the last writer overwriting another save without notice.
6. Cancel sets status to CANCELLED and stores `cancelledAt`. It keeps the amount paid. It calculates no refund. Why: the money record stays honest.
7. A cancelled booking accepts no edit and no second cancel. The PRD gives no message for this. Ask before writing one. Why: cancelled bookings are read-only, so history stays fixed.
8. Delete works only when amount paid is 0. Enforce it on the server in the delete itself, with a conditional delete on `amountPaid = 0`. Do not rely on the disabled button. Remove the whole row, including guest name, phone, and notes. Do not use soft delete. Why: a payment could be saved between page load and click, and no guest data should remain.
9. An apartment can be removed only when it has no bookings of any status. Check on the server in the same transaction as the delete. The database refuses it too, through the `NoAction` foreign key. Why: it avoids orphaned booking history.
10. On an unexpected error, return the FR-91 message and log the detail on the server. Send it to error tracking. No error tracking service is chosen. Ask before adding one. Keep personal data out of the log (see security-baseline.md). Why: the person needs a calm message and the developer needs the cause.
11. Target a booking save under 500 ms on the server with a warm database. The developer measures it. Why: this is the PRD's speed target, and a save with few queries is the way to reach it.

## Ask first (the PRD does not say)

- The shape of the `changes` JSON in `BookingEvent`. FR-62 only gives the example line "Amount paid: 50,000.00 to 80,000.00".
