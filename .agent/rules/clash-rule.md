# clash-rule.md

One job: the booking overlap rule. How writes behave is in write-rules.md.
Source: PRD 6.7 (FR-55 to FR-60), 8.6, and the pre-check query in 8.9.

1. A booking occupies the nights from check-in up to, but not including, check-out. The range is `[checkIn, checkOut)`. Why: this is what makes same-day turnover legal.
2. Two bookings clash when they share an apartment and `new.checkIn < existing.checkOut` AND `new.checkOut > existing.checkIn`. Use strict comparisons only. Why: `<=` blocks same-day turnover, and the fault is silent.
3. Only ACTIVE bookings block. Cancelled bookings never do. Why: a cancelled stay frees its nights.
4. When editing, ignore the booking being edited. Why: a booking must not clash with its own old dates.
5. Write one shared clash function. Create and edit are its only callers, and they are the only paths that write booking dates or apartment. Add no third path. Any future path must call it. It runs on create, and on edit of dates or apartment. It reads through the data-access module. Why: two copies of the rule drift apart, and only the data-access module may use Prisma.
6. The database is the real guard. The application pre-check exists to build a clear message with the conflicting guest and dates. Use the query shape in PRD 8.9. Why: two simultaneous requests can both read "free".
7. If the database constraint fires, Prisma wraps the error. Read the underlying code `23P01` from the wrapped error, look up the conflicting booking, and return the FR-56 message (text in validation-and-messages.md). Why: the person must see the same clear message whichever check caught the clash.
8. Use the table below as the source for the overlap tests. Why: it is the PRD's own definition of correct, so a test that disagrees with it is wrong.

Existing booking: Apartment A, 10 Dec to 14 Dec (nights of 10, 11, 12, 13).

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

## Ask first (the PRD does not say)

- Which booking the message names when more than one clashes.
- Which error wins when an edit is both stale and clashing.
