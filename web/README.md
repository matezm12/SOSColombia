# SOSColombia — web

Stage 2 of the [SOSColombia](../README.md) project. Live at **[soscolombia.xyz](https://www.soscolombia.xyz)**.

## Stack

Next.js 16 (App Router) · Prisma 7 (`@prisma/adapter-pg`) · Postgres (Supabase) · Tailwind CSS · next-intl (es/en). See `../wiki/10-app-architecture.md` for the design rationale.

## Setup

1. `npm install`
2. Get a Postgres connection string — either a free [Supabase](https://supabase.com) project, or any local/hosted Postgres.
3. `cp .env.example .env` and fill in `DATABASE_URL` (see `.env.example` for what the other variables are and when you actually need them).
4. `npx prisma migrate dev` — creates the schema in your database.
5. `npx prisma db seed` — loads a representative first pass of data (see `prisma/seed.ts` and the many `prisma/seed-pass*.ts` one-off scripts — each traces back to a specific `wiki/` file or a dated research pass).
6. `npm run dev` — starts the app at http://localhost:3000.

## Project layout

- `prisma/schema.prisma` — data model (mirrors `../wiki/10-app-architecture.md`)
- `prisma/seed*.ts` — one-off data-loading scripts, run manually, never automatically
- `src/proxy.ts` — locale routing (next-intl) + the `/admin/*` session gate, in one file (Next.js 16's `proxy.ts` replaces `middleware.ts`, and only one file may export the hook)
- `src/app/[locale]/` — every public page (home, `/mapa`, `/cifras`, `/ayuda`, `/donar`, `/ciudad/[divipola]`, `/ciudad/[divipola]/[vereda]`, `/comunidad`, `/historias`, `/informes`, `/fuentes`, `/metodologia`, `/datos`, `/recursos`, `/sugerir`, `/privacidad`, `/terminos`, `/eliminar-datos`)
- `src/app/md/` — plain-markdown mirror of key pages, for AI/LLM crawlers (`llms.txt`-style access) — a sibling tree of `[locale]`, not nested under it
- `src/app/admin/` — the moderation/admin panel, see below
- `src/app/api/cron/` — scheduled detection jobs, see below
- `src/app/api/search/` — the site-wide search endpoint (grouped Prisma queries, no external search engine — see `src/components/layout/Search.tsx` for the Cmd+K modal that calls it)
- `src/app/api/export/` — public, unauthenticated JSON/CSV data export (the project's open-data commitment, see `/datos`)
- `src/components/data/` — one card component per data type (`AidPointCard`, `CampaignCard`, `SocialEmbed`, etc.) — every one sets `id={record.id}` + a `ShareButton anchorId`, which is also what makes every search result deep-linkable
- `src/i18n/` — next-intl routing config; `messages/{es,en}/*.json` (repo root of `web/`) holds one JSON file per page/namespace

## Admin access (`/admin/*`)

Per-volunteer accounts (`Volunteer` model), not a single shared password — provisioned by an `isAdmin` volunteer at `/admin/volunteers`, no public signup. Sessions are a signed, stateless cookie (`src/lib/session.ts`), scoped per section:

- `/admin/moderacion` — aid-point submission queue (`canModeracion`)
- `/admin/comunidad` — community social-post submission queue (`canComunidad`)
- `/admin/boletines` — toll-record detections awaiting a human to read the source and fill in the real figure (`canBoletines`)
- `/admin/historias` — editorial long-form posts (`isAdmin` only)
- `/admin/volunteers` — account management (`isAdmin` only)

This replaced an earlier single shared Basic-Auth password — there's no `ADMIN_PASSWORD` fallback anymore, access is entirely through volunteer login at `/admin/login`. See `src/proxy.ts` and `src/lib/session.ts`.

## Automated detection jobs (`api/cron/*`, Vercel Cron — see `vercel.json`)

All follow the same discipline: **detect, never silently auto-write a figure a human hasn't seen**, with one deliberate exception below. Findings get staged into `PendingAidPoint`/`PendingTollRecord` for a moderator, or emailed via `notifyOps` (Resend).

- `usgs` — daily. The one exception: auto-writes `Event` (magnitude/depth/epicenter) when USGS's own structured API disagrees with what's on file, since it's a clean numeric diff against an authoritative source, not prose-parsing — but only ever sets fields USGS actually returned, never regresses a good value with a partial response.
- `bulletins` — daily. Detects a newer numbered INMLCF bulletin or a new OCHA Flash Update page; never parses the figures out of it.
- `gov-news-check` — daily. Sweeps municipal press pages/RSS feeds for albergue/acopio keyword mentions and death-toll mentions, earthquake-context-gated.
- `aggregator-check` — weekly. Cross-checks a third-party map (mapadelterremoto.com) for aid points we're missing; alerts separately if every tracked city suddenly matches zero labels at once (a real markup-break signal, not a genuine zero).

## Instagram thumbnails

Instagram throttles its own anonymous embed widget hard under real traffic (confirmed live — see `src/components/data/SocialEmbed.tsx`'s header comment for the full history), and Meta's official oEmbed API needs App Review this project doesn't have. So Instagram posts render from a **pre-scraped thumbnail snapshot** (`SocialPost.oembedHtml`) instead of a live client-side embed — X/TikTok/Facebook are unaffected and still embed live.

`scripts/thumbnails/backfill.py` (repo root, not under `web/`) scrapes each post's real photo + alt text via Scrapling's stealth browser (Python + a real browser binary — can't run in a Vercel serverless function), and runs daily via `.github/workflows/thumbnails.yml`, independent of Vercel.

## Search

Cmd+K / `/` opens a command-palette-style modal (`src/components/layout/Search.tsx`) over `/api/search` — grouped results across cities, veredas, aid points, stories, campaigns, allied resources, and official reports. Deliberately excludes toll records (better discovered via a city result), contradictions, and community posts (unverified).
