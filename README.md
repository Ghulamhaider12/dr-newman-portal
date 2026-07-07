# Dr. Newman's Content Portal

A personal content-sharing portal for a doctor/researcher. Visitors browse,
download, and engage with medical, art, and literature content (PDFs, audio,
presentations, images, YouTube links). A private, NextAuth-protected admin panel
manages files, categories, comments, and site copy.

Built with **Next.js 14 (App Router) + TypeScript**, Tailwind (theme mapped to the
design tokens), PostgreSQL via Prisma, NextAuth (credentials/JWT), DigitalOcean
Spaces for storage, and SendGrid for comment notifications.

---

## Quick start (local)

Requires Node 18+ and Docker (for local Postgres).

```bash
npm install
cp .env.example .env          # values are pre-filled for local dev
docker compose up -d          # starts Postgres on :5432
npm run db:migrate:dev        # create schema (first run)
npm run db:seed               # sample categories, files, comments + admin user
npm run dev                   # http://localhost:3000
```

- Public site: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin> (redirects to `/admin/login`)
- Seed admin credentials come from `.env`:
  `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` (defaults: `anewman` / `changeme123`).

### Storage in local dev

When `DO_SPACES_*` are blank, uploads are written to `public/uploads` and served
locally, so the whole app runs without any cloud credentials. Set the Spaces
variables to switch to signed S3 storage.

### Email in local dev

When `SENDGRID_API_KEY` is blank, new-comment notifications are skipped (logged,
never blocking). Set the SendGrid variables to enable real emails.

---

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Run the production build |
| `npm run db:migrate:dev` | Create/apply a dev migration |
| `npm run db:migrate` | Apply migrations (deploy) |
| `npm run db:seed` | Seed sample data + admin user |
| `npm run db:push` | Push schema without a migration |

---

## Environment variables

See `.env.example`. Summary:

- `DATABASE_URL` — Postgres connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — NextAuth
- `DO_SPACES_ENDPOINT|REGION|BUCKET|KEY|SECRET|CDN` — DigitalOcean Spaces (optional locally)
- `SENDGRID_API_KEY|FROM_EMAIL`, `ADMIN_NOTIFY_EMAIL` — comment emails (optional locally)
- `SEED_ADMIN_USERNAME|EMAIL|PASSWORD` — initial admin user

---

## Architecture

```
src/
  app/
    (public)/            shared navbar + footer
      page.tsx           home (hero, browse-by-category, recent)
      library/           list + filters
        [id]/            file detail (download or copyable YouTube URL)
          download/      route handler: counts + signed-URL redirect
      about, contact
    admin/
      login/             unprotected sign-in
      (panel)/           NextAuth-guarded; sidebar layout
        page.tsx         dashboard
        files/           table + add/edit modal (WYSIWYG + upload)
        categories/      add/delete/reorder + move-file panel
        comments/        pending / approved / private tabs
        settings/        site copy + background photo
    api/                 files, categories, comments, settings, upload, auth
  components/  ui · public · admin
  lib/         prisma · auth · spaces · email · fileType · settings · utils
prisma/        schema.prisma · seed.ts
middleware.ts  protects /admin (except /admin/login)
```

### Behaviour rules implemented

- Comments start **pending**; only the admin sees them until approved. Private
  comments are never published. The admin is emailed on every submission (fail-soft).
- YouTube items show a **copyable URL only**, never an embed.
- File type is **auto-detected from the upload extension** — no manual dropdown.
- Every destructive action (delete file, delete category) goes through a confirm
  dialog. Categories can only be deleted when empty.
- Mobile responsive; ≥44px targets; visible focus rings.

---

## Deploy

A `Dockerfile` and `docker-compose.yml` are included. For DigitalOcean App
Platform: build from the Dockerfile, set the env vars above (with a managed
Postgres `DATABASE_URL`), and run `npm run db:migrate` as a pre-deploy step.
# Deployed via webhook

