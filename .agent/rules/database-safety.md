# database-safety.md

One job: keep the agent away from every database.

1. Never run a command that opens a database connection. Why: one command against a real connection string can destroy data, and the agent cannot undo it.
2. Treat all of these as connecting: any `prisma migrate` form (including `--create-only`, which uses a shadow database), `prisma db push`, `db pull`, `db execute`, `studio`, seed scripts, the dev server, `psql`, `pg_dump`, and any script that imports the data-access module or the Prisma client. Ask before `next build`, because it queries at build time when a page is prerendered. Why: the harm comes from the connection, whatever the command is called.
3. These are allowed: edit schema and migration files, `prisma format`, type checks, lint, and tests that mock the data-access module. Why: the agent must still be able to check its own work.
4. A test needs a database if it imports the data-access module or the Prisma client without a mock. Write such tests. Never run them. Why: running one is a connection.
5. Never open, print, copy, or create a file that holds a real connection string, such as `.env`. Refer to variables by name only. Why: a leaked string gives full access.
6. For every change the person must run, give four things: the exact command, the environment to use first (staging), what success looks like, and how to check it. Why: the person can run it without guessing.
7. Flag every database constraint change for human review at the end of the response. A constraint is a unique, check, foreign key, exclusion, not-null, or default rule. Name it, say what it blocks, and say why. Why: a wrong constraint blocks valid data or lets bad data in, and the fault shows up late.
8. Write no backup script or restore script, and provision no database, unless the person asks. Why: these are developer tasks that need credentials the agent should not hold.
9. If a task cannot finish without a connection, stop and say so. Why: a partial guess is worse than a clear stop.
