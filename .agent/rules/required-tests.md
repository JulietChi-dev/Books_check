# required-tests.md

One job: the tests the PRD requires, as a checklist.
Source: the testing row of PRD 8.10.

Do not weaken, skip, or delete a listed test to make a change pass. Why: these tests guard the product's one promise. Tests that need a database follow database-safety.md. The PRD names no test framework. Ask before choosing one (see stack-and-dependencies.md).

1. **Overlap unit tests.** One test for every row of the table in clash-rule.md. Why: the table is the source of truth for the rule.
2. **Simultaneous bookings.** Fire 10 bookings for the same apartment and dates together. Expect exactly 1 success. Why: it proves the database constraint, not only the pre-check.
3. **Clash error mapping.** Make the database constraint fire. Prove the action returns the FR-56 message with the pinned Prisma version. Why: the wrapped error shape can change between versions.
4. **Retry.** Send the same request ID twice. Expect one booking and a success both times. Why: a lost reply must not create a clash with itself.
5. **Edit conflict.** Save an edit with an old `updatedAt`. Expect the FR-61 message and no change. Why: the last writer must not overwrite silently.
6. **Cross-company access.** For every action and read query in PRD 8.3 that touches company data, user A requests a booking ID, an apartment ID, and a list filter that belong to company B. Every one returns "not found". Why: a leak between companies ends the business.
7. **Dates and money across time zones.** Run the whole date and money suite once per zone: `Africa/Lagos`, `Pacific/Auckland`, and `America/Los_Angeles`. Set the `TZ` environment variable when the test process starts. Never change it inside a running test. Why: Node can cache the zone, and date bugs appear only on another person's laptop.
8. **Money round trip.** Send a money value from the database to the browser and back. It must show no rounding change. Why: it proves the decimal text path works end to end.
9. **Company deletion.** Delete a company in staging and confirm the cascade is clean. The person runs this. Why: the Booking to Apartment relation uses `NoAction` and is unproven (see data-model.md).

The overlap count of 0 (PRD G1) is measured by the developer. The agent does not run that check.
