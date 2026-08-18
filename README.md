# SOSColombia

Independent, volunteer-run project tracking verified data on Colombia's August 10, 2026 earthquake: death toll, damnificados (people who lost homes), official government reports, per-city/per-vereda aid-point directories, verified donation campaigns, and community-submitted social posts. Live at **[soscolombia.xyz](https://www.soscolombia.xyz)**.

## Current phase

Stage 1 (research dataset) is done — see `wiki/`. Stage 2 (the webapp) is live in production, not just an MVP: city and vereda pages, aid-point/campaign/story directories, a per-volunteer moderated submission pipeline, scheduled detection jobs cross-checking official sources daily, and a site-wide search. See `web/README.md` for the app itself.

## Folder map

- `wiki/` — accumulated, curated research facts. Source of truth for Stage 1. Every numeric claim: value + source + date-observed, never silently overwritten (append, don't replace).
  - `00-INDEX.md` — map of everything below, load first each session
  - `01-event-facts.md` — magnitude, epicenter, depth, aftershocks (SGC)
  - `02-cities/` — one file per affected city (toll, damnificados, status)
  - `03-death-toll.md` / `04-damnificados.md` — dated, sourced running logs
  - `05-gov-reports.md` — decree/informe registry
  - `06-sources.md` — every URL/doc ever pulled, tier + status (fetched/stale/dead/needs-recheck)
  - `07-aid-points/` — shelters/food/health points per city, last-verified date per entry
  - `08-contradictions.md` — conflicting numbers across sources, resolved or open
  - `09-glossary.md` — Colombian disaster-response terms/acronyms
  - `10-app-architecture.md` — the webapp's design rationale (mirrors `web/prisma/schema.prisma`)
- `raw/` — verbatim snapshots of fetched docs/pages, named `<source-slug>-<YYYY-MM-DD>.md`. Re-derive wiki facts from here instead of re-fetching; govt pages get edited or taken down.
- `web/` — the live Next.js app (soscolombia.xyz). See `web/README.md`.
- `scripts/thumbnails/` — Python/Scrapling job that scrapes Instagram post thumbnails for the site (Meta's own API needs App Review we don't have; see the script's own header comment for why). Runs daily via `.github/workflows/thumbnails.yml`, independent of Vercel (needs Python + a real browser, not available in a Vercel serverless function).
- `videos/` — HyperFrames video projects (Instagram Reels/carousels announcing features), one subfolder per video.
- `.github/workflows/` — the thumbnail-scraping cron (the only GitHub Actions job; the app's own tier-1/tier-2 detection cron jobs run on Vercel Cron instead, see `web/vercel.json`).

## Workflow rule

Every fact that goes into `wiki/` also gets `ctx_knowledge(remember)`'d via lean-ctx the same session — markdown is the readable source of truth, the knowledge graph is the fast cross-session index. Don't let them drift apart.

## Source tiers (highest first)

1. SGC — seismic facts
2. UNGRD — casualties/damage/aid (primary backbone)
3. DANE/DNP — demographic/economic context
4. Gobernación/Alcaldía official channels — local specifics
5. Cruz Roja / Defensa Civil — relief ops detail
6. Major verified news — cross-check/gap-fill only, never sole source
7. Social media — flag only, never cited as fact without independent verification
