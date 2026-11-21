# auth-and-security.md

One job: the numbers and mechanisms that apply security-baseline.md to BooksCheck. The generic rules (server checks, scope from the session, hashing, "not found") are there and are not repeated here.
Source: PRD FR-7 to FR-19, FR-84, FR-85, FR-87, 8.4, 8.5. Message text is in validation-and-messages.md.

## Access

1. Public pages: sign up, login, forgot password, reset password, verify email. Every other page needs a session. Why: the public pages must work with no session, or nobody could log in (FR-87).
2. A user with no company can reach only company registration and logout. Everything else redirects there. Why: with no company there is no data to show (FR-9).
3. A logged-in user who opens login or sign up goes to Home. After login, go to Home, or to company registration if there is no company. Why: it keeps the flow short for the one person who uses the app (FR-13, FR-14).

## Sign up and verification

1. On sign up, create the user, send a verification email, start a session, and go to company registration. Why: the manager reaches work at once (FR-7).
2. The unverified banner never blocks a feature. Why: a manager must not lose bookings access over an email delay (FR-8).
3. The verification link expires after 24 hours. [ASSUMPTION] Why: it limits how long a stolen link is useful.

## Rate limits

Counters use the `RateLimitHit` table. The `bucket` holds a SHA-256 hash of its key, so no raw email is stored. Why: serverless instances share no memory, and the table must hold no personal data.

| Limit | Key | Rule | Source |
|---|---|---|---|
| Sign up | IP address | 10 attempts per hour. [ASSUMPTION] | FR-4 |
| Verification resend | User. The PRD names no key. Confirm | 3 per hour. [ASSUMPTION] | FR-8 |
| Login, pair | Email plus IP address | 5 failures in 15 minutes, then block 15 minutes. [ASSUMPTION] | FR-12 |
| Login, email | Email | 20 failures in 1 hour from any IP address, then block 15 minutes. [ASSUMPTION] | FR-12 |
| Forgot password | Email, and IP address separately | 3 per hour per email, 10 per hour per IP address. [ASSUMPTION] | FR-16 |

1. Count failures for unknown emails too. Why: otherwise attackers can tell which emails exist.
2. A block refuses every login attempt for that key, even with the right password. Why: otherwise the guess limit limits nothing.
3. Hosting is undecided. Ask how to read the client IP before writing any limit that uses it. Why: a spoofable header defeats the limit.

## Sessions

1. On login, create a random 32-byte token. Store its SHA-256 hash as the `Session` ID. Send the raw token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Why: a database leak yields no usable session.
2. A session ends after 7 days idle and never lasts more than 30 days from `createdAt`. Logout ends it at once. [ASSUMPTION] Update `lastSeenAt` at most once per hour. When you do, set `expiresAt` to 7 days after it, but never later than 30 days after `createdAt`. Why: the two limits must both hold, and one write per hour avoids a write on every request.
3. After a password reset, end all sessions for that user. After a password change, end all other sessions. Why: a stolen session must not survive a password change.
4. The cookie name is not in the PRD. Ask before choosing one.

## Passwords and email flows

1. Hash with Argon2id on the Node runtime, never the edge runtime. [ASSUMPTION] If the chosen library does not deploy, the fallback is scrypt from Node's built-in crypto. The person decides after the week 1 spike (open question O3). Why: the edge runtime cannot run this library.
2. The PRD gives no cost parameters. Use the library's documented defaults, and list them in the assumptions. Why: the person must be able to review them.
3. Forgot password always shows the same reply. Send the email after the response returns, using the pinned Next.js version's supported after-response method. Read its documentation first. Never fire and forget. Why: response time must not reveal whether the account exists, and a serverless host can cut off unfinished work.
4. The reset link expires after 60 minutes and works once. [ASSUMPTION] Why: it limits how long a stolen link is useful (FR-17).
5. Changing the password needs the current password (FR-84). Changing the login email needs the current password. Send a verification link to the new address. The old address stays active until the new one is verified (FR-85). Why: a typo must not lock the manager out.

## Request and response hardening

1. Check the `Origin` header on every state-changing request, in addition to the built-in server action origin checks. Reject the request on a mismatch. [ASSUMPTION] Why: it is extra protection against cross-site request forgery.
2. Send on every response: HSTS, `X-Content-Type-Options: nosniff`, a content security policy, and `Referrer-Policy: no-referrer`. The reset and verification pages load no third-party scripts. Why: these pages carry tokens in the URL.
3. The PRD gives no HSTS value and no policy text. Propose exact values and wait for approval before adding them. Why: a wrong policy breaks the app or protects nothing.

## Company separation

1. Create one data-access module. It is the only module that imports the Prisma client. Ask the person for its path before creating it. Why: AGENTS.md sets no path and forbids inventing one.
2. Add an ESLint restricted-import rule that fails the build for any other import of the Prisma client. If ESLint is not installed, ask first (see stack-and-dependencies.md). Why: one gate is the only place a missing company filter can hide.
3. A request for another company's booking, apartment, or list returns "not found" (see security-baseline.md). Tests are listed in required-tests.md.

## Ask first (the PRD does not say)

- Whether a successful login clears the failure count.
- Whether the agent writes the daily job that deletes old `RateLimitHit` rows and expired tokens.
- How `Session.deviceClass` is decided.
