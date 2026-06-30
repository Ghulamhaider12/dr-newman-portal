---
name: local-setup
description: Bootstrap or restart the local dev environment for the Dr. Newman portal — start Postgres, apply migrations, seed data, run the dev server in the correct order.
disable-model-invocation: true
---

Bring the local environment up. Run from the project root.

1. Ensure deps are installed: if `node_modules` is missing, run `npm install`.
2. Ensure `.env` exists: if not, `cp .env.example .env` (it's pre-filled for localhost).
3. Start Postgres: `docker compose up -d`. Confirm the container is healthy before continuing (`docker compose ps`). If Docker isn't running, tell the user to start Docker Desktop.
4. Apply schema: `npm run db:migrate:dev`. (Use this, not `db:migrate`, for local.)
5. Seed data: `npm run db:seed` (admin user + sample categories/files/comments).
6. Start the app: `npm run dev`.

Then report: app at http://localhost:3000, admin at http://localhost:3000/admin (login `anewman` / `changeme123`). Steps 3–5 are first-run-only; on a repeat just do `docker compose up -d` (if stopped) and `npm run dev`.

Cloud services are fail-soft — no Spaces/SendGrid creds needed for local dev.
