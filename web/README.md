# SOSColombia — web

Stage 2 of the [SOSColombia](../README.md) project. Stage 1 (research) is done — see `../wiki/`. This app loads that research into a real database and serves it.

## Stack
Next.js 16 (App Router) · Prisma 7 (`@prisma/adapter-pg`) · Postgres · Tailwind CSS. See `../wiki/10-app-architecture.md` for the full design rationale.

## Setup

1. `npm install`
2. Get a Postgres connection string — either a free [Supabase](https://supabase.com) project, or any local/hosted Postgres.
3. `cp .env.example .env` and fill in `DATABASE_URL`.
4. `npx prisma migrate dev --name init` — creates the schema in your database.
5. `npx prisma db seed` — loads the stage-1 wiki data (see `prisma/seed.ts`; this is a representative first pass, not exhaustive — every row traces back to a specific `wiki/` file).
6. `npm run dev` — starts the app at http://localhost:3000.

## Project layout
- `prisma/schema.prisma` — data model (mirrors `wiki/10-app-architecture.md`)
- `prisma/seed.ts` — loads stage-1 wiki facts into the database
- `src/lib/prisma.ts` — shared Prisma client (driver-adapter pattern, required in Prisma 7)
- `src/app/page.tsx` — home page (event summary + city list)
- `src/app/ciudad/[divipola]/page.tsx` — per-city page (toll data + aid points), keyed by DIVIPOLA code, not city-name string

## Status (2026-08-14)
Schema designed and validated, seed script written and typechecked against the generated Prisma client. **Not yet run against a live database** — needs a real `DATABASE_URL` (Supabase project or local Postgres), which requires creating an account/instance that wasn't done as part of this session. Once that exists: run steps 4-6 above, and confirm the two pages render real data before building out more UI (aid-point moderation queue, contradictions/methodology page, map view — see `../wiki/10-app-architecture.md` → "Next steps").
