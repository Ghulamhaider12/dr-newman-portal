# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Dr. Newman's Content Portal** — a Next.js 14 (App Router) full-stack app where visitors browse/download/comment on medical, art, and literature content (PDFs, audio, video, images, YouTube links). No visitor login; a NextAuth-protected `/admin` panel manages everything.

> Note: an older sibling "design system" repo also carries a CLAUDE.md describing this as a separate package. **This repo is the production Next.js app**, not the design system. Ignore any guidance that says the Next.js code lives elsewhere.

## Stack

Next.js 14 (App Router, React 18, TS strict) · Tailwind CSS · Prisma + PostgreSQL · NextAuth (credentials, JWT) · AWS SDK for DigitalOcean Spaces (S3-compatible storage) · SendGrid (email) · bcryptjs · lucide-react. Package manager: **npm**.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — **`prisma generate && next build`** (Prisma client must be generated before build; `postinstall` also runs `prisma generate`)
- `npm run lint` — Next.js ESLint
- `npm run db:migrate:dev` — create/apply a dev migration (first run / schema changes)
- `npm run db:seed` — seed admin user + sample categories/files/comments (`prisma/seed.ts` via tsx)
- `npm run db:push` — push schema without a migration
- No test framework is set up.

## Local setup

```bash
npm install
cp .env.example .env          # pre-filled for localhost; no edits needed for basic local dev
docker compose up -d          # Postgres 16 on :5432 (creds portal/portal)
npm run db:migrate:dev        # first run only
npm run db:seed
npm run dev
```
Admin login at `/admin` → `/admin/login`; seed creds come from `.env` (`SEED_ADMIN_USERNAME`/`SEED_ADMIN_PASSWORD`, default `anewman` / `changeme123`).

## Architecture

- Routes: `src/app/(public)/` (shared navbar+footer layout) and `src/app/admin/` (`login/` unprotected, `(panel)/` guarded). API under `src/app/api/`.
- `middleware.ts` protects all `/admin/*` except `/admin/login` via NextAuth.
- `src/lib/`: `prisma.ts` (singleton client), `auth.ts` (NextAuth options), `apiAuth.ts` (`requireAdmin()` — call first in every admin API route), `spaces.ts` (signed S3 URLs), `email.ts` (SendGrid), `fileType.ts` (extension→type), `settings.ts`, `utils.ts`.
- Path alias: `@/*` → `./src/*`. Client components use `"use client"`; everything else is a server component. Use `import type` for type-only imports.
- Components: `src/components/ui` (Button/Badge/Field/Logo), `public/`, `admin/` — custom React + Tailwind, no UI framework.

## Behavior rules (don't break these)

- **Fail-soft storage:** blank `DO_SPACES_*` → uploads go to local `public/uploads`. No cloud creds needed locally.
- **Fail-soft email:** blank `SENDGRID_API_KEY` → new-comment notifications are logged, never block the request.
- **Comments** start `is_approved=null` (pending); admin approves before they're public. Private comments (`is_public=false`) are never published.
- **YouTube** items are stored as a copyable URL only — never embedded.
- **File type** is auto-detected from the upload's extension (`src/lib/fileType.ts`); there is no manual file-type dropdown.
- **Download** route `GET /library/[id]/download` increments `file.downloads`, then redirects to a short-lived signed URL (or local path).

## Gotchas

- TS `strict` is on (ES2020). The README warns the code was authored from spec and may need minor TS/config fixes on first `npm run build`.
- Run `prisma generate` (or `npm run build`/`db:generate`) after editing `prisma/schema.prisma`, or the client types go stale.
