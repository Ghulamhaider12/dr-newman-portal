# CLAUDE.md — Dr. Newman's Content Portal

Guidance for Claude Code (and any agent/developer) working in this repository.
Read this first, then explore the files it points to.

---

## 1. What this project is

**Dr. Newman's Content Portal** is a personal content-sharing website for a doctor
and researcher. Visitors browse, download, and engage with medical, art, and
literature content — PDFs, audio, presentations, images, and YouTube links. No
visitor login. A private admin panel manages everything.

This repository currently holds **two related things**:

1. **The design system** (the root of this project) — tokens, reusable React
   components, foundation specimen cards, and high-fidelity HTML UI kits. This is
   the source of truth for brand, colour, type, spacing, and component behaviour.
2. **The production app** (built separately as a **Next.js 14** codebase) — a
   full-stack implementation. It is delivered as a downloadable package /
   standalone repo, NOT kept inside this design-system tree (the design-system
   compiler scans every `.tsx` and a Next app's files collide with it). See
   §5 for its architecture so you can recreate or continue it.

**Brand personality:** academic, trustworthy, calm, approachable — a professor's
personal library, not a corporate product. Clean, content-first, usable by people
of all ages. Accessibility is non-negotiable (high contrast, ≥44px targets,
clear focus rings).

---

## 2. Repository map (design system)

```
styles.css                 # global entry point — @imports every token + font file
tokens/
  fonts.css                # Lora + Inter (Google Fonts)
  colors.css               # palette + semantic aliases
  typography.css           # families, scale, weights, line-heights
  spacing.css              # 4px scale, radii, shadows, layout, motion
  base.css                 # element defaults built on the tokens
components/
  core/      Button, Badge, FileTypeBadge, Card
  forms/     Input, Select, Textarea, Switch
  navigation/ Navbar, Hero, Footer
  portal/    FileCard, CopyBox, CommentCard, CommentForm
  └ each dir: <Name>.jsx + <Name>.d.ts + <Name>.prompt.md + one *.card.html
guidelines/                # foundation specimen cards (Colors / Type / Spacing)
ui_kits/
  content-portal/          # public site recreation (Home, Library, File Detail)
  admin-panel/             # admin recreation (login → dashboard, files, …)
assets/                    # logo/imagery notes (placeholder mark only so far)
readme.md                  # the full design guide (READ THIS for deep context)
SKILL.md                   # Agent-Skill manifest
```

`readme.md` contains the authoritative **Content Fundamentals**, **Visual
Foundations**, and **Iconography** sections — read it before designing anything.

---

## 3. Design tokens (use these, do not invent new values)

| Token | Value | Use |
|---|---|---|
| Primary | `#2C5F8A` | steel blue — trust, primary actions |
| Primary Light | `#EBF3FA` | tinted card/hero backgrounds |
| Accent | `#4A90A4` | teal — links, secondary CTAs |
| Success | `#3A7D44` | green — download buttons only |
| Warning | `#B87333` | copper — copyright / pending badges |
| Surface | `#F7F9FC` | light grey card/sidebar background |
| Border | `#DDE3ED` | subtle dividers (`#C3CCDB` for inputs) |
| Text primary | `#1A1A2E` | body |
| Text secondary | `#5A6778` | metadata, descriptions |

- **Type:** Lora (serif) for all headings; Inter (sans) for body/UI. Base 16px,
  body line-height 1.6.
- **Spacing:** 4px base unit (4/8/12/16/24/32/48/64/96). Sections 64px top/bottom,
  cards 24px padding.
- **Radius:** 6px cards, 4px buttons/inputs. **Shadows:** subtle only (no heavy
  elevation, no decorative gradients except a hero photo scrim).
- **Category colour-coding:** Medical = blue, Art & Literature = teal, Other = grey.
- **Icons:** [Lucide](https://lucide.dev) (substitution — confirm with owner). No emoji.

Category colours, file-type chip colours, and all behaviour live in the component
files — match them; don't re-derive.

---

## 4. Working in the design system

- Components are plain React + CSS custom properties (no CSS-in-JS, no npm UI libs).
  Each `<Name>.jsx` has `export function <Name>(props)`, a sibling `<Name>.d.ts`
  (props contract), and a `<Name>.prompt.md` (what/when + usage).
- Foundation/specimen and component preview cards are `*.card.html` files whose
  first line is `<!-- @dsCard group="…" … -->`.
- After ANY change to the design system, run the compiler check and fix what it
  reports:
  ```
  check_design_system   # (in this agent environment)
  ```
- **Do NOT** add a Next.js / Vite / large `.tsx` app inside this project — it breaks
  the compiler (duplicate exports, unresolved npm imports). Keep production code in
  its own repository (see §5).

---

## 5. The production app (Next.js 14) — architecture

The full-stack app is a **separate repo / downloadable package** named
`dr-newman-portal`. Recreate or continue it there, not inside this design system.

### Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (theme mapped to the tokens in §3)
- PostgreSQL via Prisma ORM
- DigitalOcean Spaces (S3-compatible) for file storage — signed PUT (upload) and
  signed GET (download) URLs; background photo is `public-read` via CDN
- NextAuth.js (credentials provider, JWT sessions) — protects `/admin`
- SendGrid for new-comment email notifications
- Docker + DigitalOcean App Platform deploy

### Prisma schema (tables)
- `files` — id, title, description (HTML from WYSIWYG), category_id, file_type
  (enum PDF/MP3/MP4/JPG/PNG/PPT/XLS/DOC), url, storage_key, file_size, is_youtube,
  downloads, date_uploaded, created_at
- `categories` — id, name (unique), position (for reordering), created_at
- `comments` — id, file_id, content, email, is_public, is_approved (null=pending /
  true=approved / false=rejected), created_at
- `site_settings` — key/value (welcome, copyright, commercial, privacy,
  background_photo)
- `admin_users` — id, username, email, password_hash (bcrypt)

### Routes
Public (`(public)` group, shared navbar+footer):
- `/` homepage — hero (+ optional background photo), browse-by-category, recent
- `/library` — search + category filter + file-type filter + grid
- `/library/[id]` — detail; download button (signed URL) OR copyable YouTube URL
  (never embedded); approved public comments + submission form
- `/library/[id]/download` — route handler: increments counter, redirects to a
  short-lived signed Spaces URL

Admin (`/admin`, NextAuth-protected via `middleware.ts`, except `/admin/login`):
- `/admin/login` · `/admin` dashboard · `/admin/files` (table + add/edit modal with
  auto-detect-from-extension upload + WYSIWYG description) · `/admin/categories`
  (add/delete/reorder) · `/admin/comments` (pending/approved/private tabs) ·
  `/admin/settings` (site text + background photo upload)

### Behaviour rules (keep these)
- Comments start **pending**; only admin sees them until approved. Private comments
  are never published. Email the admin on every submission (fail-soft).
- YouTube items: copyable URL only, never an embed.
- File type is **auto-detected from the upload's extension** (`.pdf→PDF`,
  `.xls/.xlsx→Excel`, etc.); no manual file-type dropdown.
- Delete actions (files, categories) always go through a confirm dialog.
- Mobile responsive throughout.

### Local run
`npm install` → `cp .env.example .env` (fill values) → `docker compose up -d` →
`npm run db:migrate && npm run db:seed` → `npm run dev`. Full setup, env vars, and
DigitalOcean deploy steps are in that repo's `README.md`.

> ⚠️ The Next.js code was authored from spec but not yet compiled/run in this
> environment — expect to fix a few TypeScript/config nits on first `npm run build`.

---

## 6. Copywriting voice (for any new UI text)

Warm, plain-spoken, scholarly — never marketing hype. Address the visitor as
"you"; refer to the owner in third person ("Dr. Newman"). Sentence case for
headings/buttons; UPPERCASE only for small badges/eyebrows. Buttons are verbs
("Download", "Watch", "Copy URL", "Submit comment"). Metadata is quiet and factual
("Mar 12, 2025", "2.4 MB", "1,204 downloads"). No emoji, no exclamation marks.

---

## 7. Quick "do / don't"

**Do:** reuse tokens and existing components; match category/file-type colour rules;
keep targets ≥44px and contrast high; run `check_design_system` after edits; keep
production app code in its own repo.

**Don't:** invent colours or fonts; add gradients/heavy shadows; embed YouTube
videos; publish comments without approval; put a Next.js/large `.tsx` app inside
this design-system project; use emoji.
