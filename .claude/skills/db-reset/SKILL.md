---
name: db-reset
description: Reset the local Postgres database for the Dr. Newman portal — drop all data, re-apply migrations, and re-seed. Use when iterating on prisma/schema.prisma or when local data is in a bad state.
disable-model-invocation: true
---

Reset the local dev database to a clean, seeded state. **Destructive — local data is dropped.** Confirm with the user before running if they have local data they care about.

1. Ensure Postgres is up: `docker compose up -d`.
2. Reset + re-migrate + re-seed in one step: `npx prisma migrate reset` (this drops the DB, re-applies all migrations, then runs the configured seed `prisma/seed.ts`). Pass `--force` to skip the interactive prompt only if the user has confirmed.
3. Confirm the seed ran (admin user `anewman` exists; sample categories/files/comments present).

If the user only changed `schema.prisma` and wants to keep data, prefer `npm run db:migrate:dev` (creates a new migration) instead of a full reset.
