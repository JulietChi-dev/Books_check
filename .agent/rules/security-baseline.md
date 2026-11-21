# security-baseline.md

One job: security principles that hold in every project. Product values (limits, lifetimes, cookie settings) live in each project's own auth file.

1. Check the session on the server in every page, every action, and every data-access function. Each data-access function takes the session user as an input and refuses to run without one. Middleware may redirect for speed. It never counts as the check. Why: middleware can be skipped or misconfigured, and a function with no check of its own is open.
2. Take the owner scope (company, tenant, user) from the session. Never take it from a form field, URL, request body, or header. Why: anything from the browser can be edited by the person using it.
3. An ID that belongs to another owner returns "not found", whether it arrives in a URL or a form. Treat it the same as an ID that does not exist. Why: "forbidden" confirms the thing exists.
4. Validate every input on the server. Browser checks are for the person's comfort only. Why: a browser check can be bypassed.
5. Hash passwords, session tokens, and one-time tokens before storing them. The raw token appears only in the cookie or the email link. Why: a database leak should not hand over usable credentials.
6. Session tokens and one-time tokens expire. One-time tokens also work once. Why: an old link in an inbox must not stay dangerous.
7. Rate limit any endpoint that can be used to guess credentials or to send email. Why: this stops guessing and email abuse.
8. Login and reset responses must not show whether an account exists, unless the project's PRD accepts that as a stated trade-off. Why: attackers use the difference to list accounts.
9. Read secrets from environment variables. Keep them out of code, logs, and error messages. Why: code and logs get copied and shared.
10. Keep personal data out of logs and error tracking. This covers names, phones, emails, notes, passwords, and tokens. Why: logs are copied and read far more widely than the database.
11. Flag every authentication change for human review. This means any change to sign up, login, sessions, passwords, tokens, rate limits, cookies, or the session check. Why: a small mistake here can expose every account.
