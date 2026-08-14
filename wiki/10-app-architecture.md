# Webapp Architecture — Stage 2

Stage 1 (research-complete dataset) is done as of 2026-08-14 — see `wiki/00-INDEX.md`. This doc now designs the schema/stack the stage-1 wiki data will be loaded into. Sections marked **DECISION NEEDED** are genuine open choices, not settled — flag before building against them.

## Design principles carried over from stage 1 (non-negotiable, proven by the research itself)

1. **Append-only numeric facts.** Every toll/damnificados number is a row (`value`, `source`, `tier`, `as_of`, `retrieved_at`), never an overwritten field. Stage 1 hit real report-to-report volatility (e.g. familias damnificadas: 24,324 → 30,324 → 25,872, all legitimate) — a "latest wins" schema would have silently destroyed that history. The UI shows the latest by default but the full log is always one click away.
2. **Never collapse two different metrics into one field**, even when they look similar:
   - `deaths_reported_official` (UNGRD/OCHA administrative) vs `deaths_confirmed_forensic` (INMLCF forensic intake) — distinct processes, distinct numbers, both real.
   - `missing_official_institutional` (UNGRD/OCHA) vs `missing_reported_crowdsourced` ("Colombia Te Busca"-style) — different populations being counted.
3. **Acopio ≠ Albergue.** Aid points have a `kind` enum (`albergue` | `acopio` | `health` | `vet` | `blood_donation` | `monetary_donation`) — a donor drop-off point and a shelter where displaced people actually stay are never the same row, even when co-located at one venue (this happened at least twice in Manizales/Pereira).
4. **DIVIPOLA is the canonical geographic key**, not city-name strings. Every municipio-level record joins on DIVIPOLA code (confirmed working: `geoportal.dane.gov.co/descargas/divipola/`). City-name matching caused real ambiguity this session (Armenia-Calarcá, Popayán "Unidad Básica") — DIVIPOLA-first avoids repeating that at the data layer, though the *attribution* ambiguity itself still needs a human-reviewed flag, not a code fix.
5. **Source tier travels with every fact**, not just in research notes — surfaced in the UI (e.g. a small badge) so users can tell "official government figure" from "crowd-reported, unconfirmed." This is a trust feature, not just an internal research discipline — it's the single thing that let stage 1 stay honest across dozens of conflicting numbers.
6. **Contradictions are a first-class object, not a bug to hide.** `wiki/08-contradictions.md`'s pattern (log both values, mark resolved/open, never silently pick one) maps directly to a `contradictions` table the UI can expose as "here's what we don't know for sure yet" — this is a legitimate trust-building feature for a disaster-data app, not just research housekeeping.

## Data model

```
Event
  id, name, magnitude_sgc, magnitude_usgs, depth_sgc_km, depth_usgs_km,
  epicenter_lat/lng (per source), occurred_at, source refs

Department (departamento)
  id, name, divipola_code

Municipio (city)
  id, department_id, name, divipola_code, population_dane, population_as_of,
  severity_label (crítica/alta/moderada — from mapadelterremoto.com-style classification, kept
    as a separate app-computed field, not a government one), lat/lng, red_alert boolean

TollRecord   -- append-only, the core "never overwrite" table
  id, municipio_id (nullable = national/department-level), department_id (nullable),
  metric (enum: deaths_reported_official | deaths_confirmed_forensic | injured |
    missing_official | missing_crowdsourced | damnificados_personas | damnificados_familias |
    viviendas_destruidas | viviendas_averiadas | ...),
  value, unit, source_id, tier (1-6), as_of (date the figure claims to represent),
  retrieved_at (when we captured it), notes

AidPoint
  id, municipio_id, kind (albergue|acopio|health|vet|blood_donation|monetary_donation),
  name, address (nullable — many confirmed sources are venue-name-only, no street address),
  lat/lng (nullable), phone, needs_text (freeform, e.g. "colchonetas, agua"),
  status (active|full|closed|unconfirmed), access_restriction (nullable, e.g.
    "pre-assessed families only" — Armenia's Coliseo del Sur needed this),
  source_id, permalink (nullable), last_verified_at

GovReport
  id, org, doc_type, title, date, url (nullable — several exist only as reported content,
    no PDF located), key_figures (jsonb), summary, source_tier

Source
  id, url, org, tier, status (live|blocked|dead|needs_recheck), last_fetched_at, notes

Contradiction
  id, topic, status (open|resolved), value_a, source_a, value_b, source_b,
  resolution_text (nullable), logged_at, resolved_at

CrowdfundingCampaign
  id, platform (gofundme|vaki|other), title, org_or_person, url, goal, raised, currency,
  donor_count, verification_status (verified|plausible|unconfirmed|flagged_scam),
  international (donatable by someone outside Colombia — foreign card/PayPal, no
    Colombian bank account needed), recurring (org/platform confirmed to support
    monthly/subscription giving), notes, last_checked_at

SocialPost   -- for the embed/preview feature confirmed feasible this session
  id, platform (x|instagram|facebook|tiktok), permalink, author_handle,
  oembed_html (cached), municipio_id (nullable), category (aid_point|need|
    human_interest|official), captured_at
```

`Contradiction`, `GovReport`, `Source` are lighter-traffic tables mostly serving a "methodology/transparency" page — worth keeping in the same database rather than treating as pure research artifacts, since the disaster-data-app category benefits a lot from visible show-your-work.

## Data update mechanism (answers the "how does this stay current after launch" question)

Stage 1 revealed 4 genuinely different update cadences — one polling strategy doesn't fit all of them:

| Tier | Sources | Update mechanism | Cadence |
|---|---|---|---|
| **1 — clean APIs** | USGS earthquake API, DANE population files | Scheduled job, direct fetch, fully automated, no review needed | Event facts: once (static after confirmation). Population: yearly at most. |
| **2 — structured but no API** | UNGRD balances, OCHA Flash Updates, INMLCF Comunicados | Built 2026-08-14: `web/src/app/api/cron/bulletins` detects a newer numbered bulletin, stages a `PendingTollRecord` stub (no figures yet — formats aren't consistent enough to parse unattended) and emails an alert. A moderator reads the actual bulletin and fills in metric/value/asOf at `/admin/boletines`, which is what creates the real `TollRecord` row — **never overwrites**. | Daily during active response, tapering as the event ages |
| **3 — social/hyperlocal aid-point status** | Alcaldía social posts, crowd reports (Coliseo del Sur-style) | This is the hardest tier — no API, format varies, and it's exactly the data that changes fastest ("shelter now full," "new collection point opened"). Two complementary approaches, not either/or: (a) scheduled browser-automation sweeps of known official accounts (the same claude-in-chrome approach proven this session), surfaced to a moderation queue; (b) a public "suggest an update" form feeding the same queue, since locals will always out-pace any polling schedule. | Automation sweep: daily. Community submissions: real-time, moderated before publish. |
| **4 — third-party aggregators** | mapadelterremoto.com | Periodic cross-check (weekly), used to catch gaps in our own data (it caught Popayán acopio points our own search missed) — not a primary source, always re-verify before citing. Site has promised an open-format export after 2026-11-30 — worth switching to bulk ingestion then. | Weekly during active response |

**Moderation queue is the load-bearing piece for tier 3.** Every non-tier-1/2 update (community submission or automation-sweep candidate) lands in a `pending_updates` staging table with the same shape as `AidPoint`/`TollRecord`, reviewed by an admin (or, at small scale, just you) before it promotes to the live table. This is what keeps the append-only/sourced discipline intact after launch instead of degrading into unsourced crowd noise — the single biggest data-integrity risk for this kind of app once it's not just you doing the research.

## Stack — recommended default (DECISION NEEDED: confirm or redirect)

- **Framework: Next.js (React), deployed on Vercel.** Fits the read-heavy/occasionally-updated data pattern well (ISR/on-demand revalidation instead of full SSR every request), API routes double as the ingestion endpoints for the scheduled jobs above, and it's the fastest path to a working MVP solo.
- **Database: Postgres (Supabase or Neon).** Relational fits the DIVIPOLA-keyed joins and append-only tables naturally; Supabase specifically also gives auth + a usable admin/moderation UI for free, which matters for the tier-3 moderation queue above.
- **Maps: MapLibre GL** (open-source, no API-key billing surprise) with the DANE DIVIPOLA boundary files already confirmed downloadable, or a Mapbox fallback if MapLibre's basemap options feel too bare.
- **Embeds:** platform-native oEmbed for X/TikTok (no auth needed, confirmed this session); Instagram/Facebook embeds via their oEmbed endpoint once a one-time Meta app is registered — small setup cost, worth doing early since a chunk of the aid-point evidence lives in these posts.
- **Scheduled jobs:** Vercel Cron (simplest, same platform) for tier 1/2/4 checks; the tier-3 browser-automation sweep is a separate concern (needs a real browser runtime, not a serverless function) — a small dedicated worker (even a scheduled GitHub Action running Playwright) is the pragmatic choice rather than forcing it into the same Next.js deploy.

None of this is irreversible or expensive to start — flag now if a different stack is preferred (e.g. a Python/Django backend if that's more comfortable, or a different hosting target) before scaffolding begins.

## Open questions before scaffolding starts

- **Auth/admin scope**: is moderation just you, or will there be other trusted reviewers? Changes whether Supabase's built-in auth is enough or a proper roles system is needed from day one.
- **Public submission form**: in scope for v1, or added after launch once the read-only site is live? (Leaning toward read-only v1 first, submissions as a fast-follow — reduces v1 scope and avoids launching a moderation queue with no reviewers ready.)
- **Domain/hosting budget**: none of the recommended stack requires paid tiers to launch a v1, but confirm before assuming.

## Next steps
1. [x] Stack confirmed 2026-08-14 — Next.js + Prisma/Postgres + MapLibre + Vercel, as recommended above.
2. [x] Scaffolded 2026-08-14 — `web/` (Next.js 16 App Router, TS, Tailwind), `web/prisma/schema.prisma` implementing the data model above (validated, client generated). Note: Next.js 16 and Prisma 7 both landed breaking changes since this doc's stack recommendation was written — Prisma 7 in particular requires a driver adapter (`@prisma/adapter-pg`) instead of a bare connection URL in schema.prisma; see `web/prisma.config.ts` and `web/src/lib/prisma.ts`.
3. [x] Seed script written 2026-08-14 — `web/prisma/seed.ts`, a representative first-pass load of stage-1 wiki facts (not exhaustive — see the file's header comment). Typechecked against the generated Prisma client; **not yet run against a live database.**
4. [~] Read-only v1 started 2026-08-14 — home page (event summary + city list) and per-city page (`/ciudad/[divipola]`, toll data + aid points) built, typechecked, linted clean. **Blocked on a live `DATABASE_URL`** — needs a Postgres instance (e.g. a Supabase project), which requires creating an account/project, something outside what this session can do on the user's behalf. Once a connection string exists: `npx prisma migrate dev`, `npx prisma db seed`, `npm run dev`, then verify both pages actually render seeded data before extending the UI further.
5. [x] Contradictions/methodology page built 2026-08-14 — `/metodologia`, verified rendering real data.
6. [x] Aid-point moderation queue built 2026-08-14 — `PendingAidPoint` staging table (additive migration, no data loss), public submission form (`/sugerir`), and an approve/reject review page (`/admin/moderacion`). Verified end-to-end via browser automation: submitted a real test entry, approved it, confirmed it appeared as a genuine `AidPoint` on its city page with correct source attribution, then cleaned up the test data.
7. [x] Admin auth gate built 2026-08-14 (`web/src/proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`, functionality unchanged) — HTTP Basic Auth in front of `/admin/*`, fails closed if `ADMIN_PASSWORD` isn't set. Resolves the "must get access control before any public deploy" blocker; the underlying "who moderates" question is still open but no longer blocks a safe deploy — the same password works whether it's just the user or shared with a few trusted people for now.
8. [x] Map view built 2026-08-14 — `/mapa` (MapLibre GL, no API-key billing risk), plotting all 7 municipios with real coordinates (backfilled into the live DB non-destructively). Verified via independent agent review, including a live query confirming the coordinates actually persisted.
9. [x] Tier-1/2 scheduled-job infrastructure built 2026-08-14 — `web/src/app/api/cron/usgs/route.ts` (read-only USGS diff-check, verified live — it actually caught a real depth revision, 110.3km → 110.285km) and `web/src/app/api/cron/bulletins/route.ts` (checks for newer INMLCF/OCHA bulletin numbers), both behind a `CRON_SECRET` shared-secret gate (`web/src/lib/cronAuth.ts`), scheduled via `web/vercel.json`. **Known scope gap, deliberate not accidental**: the bulletins route detects and reports a newer bulletin but doesn't yet insert it as a staged `TollRecord` for review — building that staging-insert path (mirroring the `PendingAidPoint` pattern) is real follow-up work once detection has proven reliable over a few cycles, not done yet.
10. [x] Deployed to Vercel 2026-08-14 — live at the production alias `sos-colombia-matezm12s-projects.vercel.app` (auto-deploys on push to `main`; the URL with a random hash suffix the user first shared is a frozen per-deployment preview link, not this — worth remembering for future verification).
11. [x] **v2 pass (2026-08-14, same day)** — after seeing the live site, the user reported a blank map, no outbound links anywhere, sparse "cifras," and generally poor visual design. Full plan at the time (see `progress.md`'s Session log for the day) covered 6 phases, all shipped and verified against the live URL, not just localhost:
    - **Design system**: fixed a real bug (`globals.css` silently overrode the loaded Geist font with Arial); added Tailwind v4 `@theme` tokens for severity/tier/status/verification/contradiction; built a `src/components/` library and refactored all 7 existing pages onto it, including a real header/nav/footer (previously every page hand-rolled its own wrapper, and `/sugerir` had zero links pointing to it).
    - **Map**: real bug, real fix — both OpenFreeMap's dark style and CARTO's dark-matter style silently never finished loading in production and dev alike (reproduced across 2 maplibre-gl versions, 2 bundlers); every light style tested worked. Shipped light-only (CARTO positron), documented the finding in the component in case a working dark vector style turns up later. Also added epicenter markers (SGC + USGS, plotted distinctly).
    - **Data completeness**: department-level toll rollups (was 0 rows), `MISSING_CROWDSOURCED` national record, and — the headline fix — `HEALTH`/`VET`/`BLOOD_DONATION` aid points (was 0 rows each despite being real schema categories since the very first seed). Idempotent upsert-based seeding was scoped **out** of this pass (a real, separate engineering task) in favor of a proven additive-script pattern; flagged as still-needed follow-up before the seed can safely be re-run wholesale.
    - **5 new pages** unlocking data that had zero UI before: `/cifras` (national + department figures, full append-only history — the direct fix for "cifras is blank"), `/donar` (the `CrowdfundingCampaign` table, 16 orgs, zero UI before this), `/informes` (`GovReport`, 5 rows), `/fuentes` (full source-transparency registry), `/ayuda` (cross-city aid-point directory with a kind filter).
    - Deferred, not built: full seed idempotency (slug-based upserts), `SocialPost` embeds (0 rows, needs a registered Meta app), aid-point geocoding for the map.
