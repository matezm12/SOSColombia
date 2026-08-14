# Allied Resources & Community Embeds — Stage 2 addition

Two new features added 2026-08-14, after stage-2 MVP launch: (1) a public directory
that boosts other independent relief-tracking sites instead of only citing them as
research sources, (2) a moderated feed of social-media embeds about places/needs not
yet in our own directory. Both follow the same discipline as `PendingAidPoint` →
`AidPoint`: community input never lands in a public table directly.

## Why these exist

- `wiki/13-opensource-tools.md` and `wiki/13a-mapadelterremoto-watch.md` already
  established that this project isn't the only one tracking this event — several
  independent, often single-person/small-group sites exist (ayudaspereira.com,
  mapadelterremoto.com, and others found in the 2026-08-14 research pass below). Many
  can't afford a custom domain and live on vercel.app/netlify.app/github.io. Listing
  them with a real preview card helps them get found, not just cites them as a source.
- The project already collects sourced facts from social media (`wiki/15-social-media-methodology.md`)
  but had no public-facing way to surface individual posts — `SocialPost` existed in
  the schema since the original stage-2 design but was never wired into the app.

## Data model additions

```
AlliedResource
  id, name, url, org (nullable), description, category (map_tracker|aid_directory|
    donation_platform|news_aggregator|volunteer_coordination|other),
  hosting_no_custom_domain (bool — vercel.app/netlify.app/github.io/pages.dev/etc.),
  og_image_url (nullable), tier (1-6, same scale as Source), status (live|blocked|
    dead|needs_recheck), notes, added_at, last_checked_at

PendingSocialPost   -- staging table, mirrors PendingAidPoint exactly
  id, platform, permalink, author_handle, category, municipio_id (nullable),
  place_name (nullable — the place this post is about, if not yet in our directory),
  submitter_note, submitter_contact (never shown publicly), origin (community|
    automation_sweep), status (pending|approved|rejected), review_note, created_at,
  reviewed_at, promoted_social_post_id
```

`SocialPost` itself (already in the schema, see wiki/10-app-architecture.md) is now
the public/approved table — `/comunidad` only ever reads from it, never from the
pending table.

## Why no oEmbed API calls

Meta locked down the Instagram/Facebook oEmbed *API* behind app-review + an access
token years ago. Rather than build that approval flow, `SocialEmbed.tsx` renders each
platform's public, no-auth client-side embed mechanism directly from the permalink —
the same reasoning `GoFundMeEmbed.tsx` already used for GoFundMe's widget:

- **Instagram**: `<blockquote class="instagram-media">` + `instagram.com/embed.js`
- **X**: `<blockquote class="twitter-tweet">` + `platform.twitter.com/widgets.js`
- **TikTok**: `<blockquote class="tiktok-embed">` + `tiktok.com/embed.js`
- **Facebook**: the Page Plugin iframe (`facebook.com/plugins/post.php?href=...`) —
  public, no app ID needed for a basic post embed

This means `oembedHtml` on `SocialPost` stays unused for now (kept for a future
server-cached fallback, not removed) — the embed renders live from `permalink` alone.

## Routes

| Route | Purpose | Gated |
|---|---|---|
| `/recursos` | Public directory of allied sites, grouped by category | No |
| `/comunidad` | Public feed of approved social embeds | No |
| `/comunidad/sugerir` | Submit a social post about an uncatalogued place/need | No |
| `/admin/comunidad` | Approve/reject pending social posts | Yes (same Basic Auth as `/admin/moderacion`, `src/proxy.ts`) |

`/recursos` and `/comunidad` live under `src/app/[locale]/` like every other public
page — `/admin/comunidad` sits outside `[locale]` like `/admin/moderacion`, since
`proxy.ts` branches admin routes around the intl middleware entirely.

## Seeding

`AlliedResource` rows and any concrete aid points found while researching allied
sites are loaded by a one-off script (`prisma/seed-allied-resources.ts`, run once via
`tsx`, not part of the repeatable `prisma/seed.ts`) — aid-point candidates go into
`PendingAidPoint` with `origin: AUTOMATION_SWEEP`, same as any other automation-sweep
find, and need `/admin/moderacion` review before going live. See the research
findings below.

## Research pass — ayudaspereira.com and similar sites (2026-08-14)

Ran as a 7-agent workflow (1 deep-dive + 5 parallel search angles + synthesis). The
workflow's own candidate-dedup/verify step had a bug and dropped every non-ayudaspereira
candidate to zero despite the search agents finding real ones — a follow-up single-agent
pass verified the two strongest leads directly. Full agent transcripts:
`wf_4b644357-507` (main pass) — see `/workflows` history.

### ayudaspereira.com — Tier 3, seeded

Live, actively-updated relief-coordination app ("Acopio ❤️") built and apparently run
by one independent developer (only identity signal found: `felipelebrun@gmail.com` in
the Ley 1581 de 2012 data-rights notice — no NGO/institutional brand anywhere). Not a
static directory — it's a logistics dashboard: per-city live inventory vs. urgent
needs, active delivery legs, available-volunteer counts, backed by Supabase. Started
Pereira-focused, now also tracks Dosquebradas, Anserma, Apía, Armenia, Bogotá D.C.,
Congal Bajo-Alcalá, El Águila, El Dovio, Guática, Roldanillo, Santa Rosa de Cabal, and
Vereda Aurora Valle (14 more municipios listed with zero centers registered yet).
Pereira/Dosquebradas alone: 28 active centers, 20 open urgent needs, 142 volunteers.

- **Hosting**: custom domain (`ayudaspereira.com`), self-hosted on a Hostinger Cloud
  VPS behind GoDaddy DNS — not Vercel/Netlify/GitHub Pages, so doesn't fit the
  no-custom-domain pattern this feature originally went looking for, but is exactly
  the kind of small independent site `/recursos` exists to boost.
- **No `og:image`/social-preview metadata at all** — a shared link renders a generic
  card. `AlliedResource.ogImageUrl` seeded as `null`; `/recursos` cards just skip the
  image block for this entry (see `AlliedResourceCard.tsx`).
- **Reliability caveat**: every center is self-submitted by whoever registered it, no
  authority-verification badge — seeded at tier 3, and every derived `PendingAidPoint`
  needs a human glance at `/admin/moderacion` before promotion, same as any other
  automation-sweep find. Phone numbers are gated behind an email login on the source
  site, so none of the 28 seeded candidates have a `phone` value.
- **28 aid-point candidates loaded** into `PendingAidPoint` (`origin: AUTOMATION_SWEEP`)
  via `prisma/seed-allied-resources.ts`: mostly `ACOPIO` (collection points — a coffee
  shop, a mall, a union hall, a car-inspection center, a church, several homes), plus
  4 `HEALTH` points, 1 `VET` (Ser Animal, with a specific medicine/food needs list),
  0 `ALBERGUE`/`BLOOD_DONATION`/`MONETARY_DONATION`. Six centers had no clear category
  on the source site and were mapped to `ACOPIO` as the closest fit (flagged per-row
  in `submitterNote`). Dosquebradas didn't exist as a `Municipio` row before this pass
  (the original 7-city seed only covered the 5 red-alert cities + San José del Palmar
  + Popayán) — added it (DIVIPOLA `66170`, Risaralda) since 2 of the 28 candidates are
  there.

### Cuidar a Colombia — Tier 4, seeded

`cuidarcolombia.vercel.app` — citizen-built by profesor Santiago Jiménez Londoño
(sjimenezlon.co), independent, not affiliated with any NGO/government body, explicitly
"no intermediamos ni recaudamos" (doesn't act as intermediary or collect funds). A
verified multi-type directory (collection points, blood banks, monetary-donation
channels, missing-persons mechanisms, affected-zone map) rather than a single-category
tool — every record tagged `fuente_oficial`/`fuente_secundaria` with a source URL and
review date, described as "revisión humana asistida por IA." **214 records tracked, 108
sources consulted, 13 municipios monitored** as of 2026-08-13 19:30 COT (118 physical
acopio points from 64 entity-level records, 10 blood-donation entries, 20 monetary
channels). Vercel-hosted — no custom domain, exactly the profile originally being
searched for. Has a real `og:image` (`/assets/og.png`) and `twitter:card=summary_large_image`.
Data loads client-side from `/data/app.json` — the static HTML alone shows nothing.

### Acopio Colombia — Tier 4, seeded

`emergency-rosy.vercel.app` (`github.com/victorolave/acopio-colombia`) — citizen
project by Victor Olave, explicitly states it doesn't represent any government entity.
Geolocation-enabled collection-center directory (Next.js/Supabase/MapLibre) with a
5-state verification pipeline (verified/reported/pending/disputed/inactive — only the
first two show publicly). **126 centers published across 27 departments, 91 confirmed
via the responsible entity's own channel** (live figure — the GitHub README's "90/26"
is stale documentation, don't trust it over the live site). Vercel-hosted, no custom
domain. Same no-`og:image` pattern as ayudaspereira.com and confirmed via raw
`<head>` fetch — no `/opengraph-image` route either.

### Aid points seeded from these two sites

Both sites' full datasets are large (214 and 126 records respectively) and mostly
cover cities well outside this project's DIVIPOLA-anchored scope (Bogotá, Medellín,
Barranquilla, Cartagena, Bucaramanga, Cúcuta, Tunja, Rionegro, Pasto, Neiva, and more)
— bulk-importing all of it would mean creating a dozen-plus new `Municipio` rows for
one-off entries and diverting from the project's tight red-alert-city focus. Instead:
**only entries in our already-tracked cities were pulled into `PendingAidPoint`** — 4
from Cuidar a Colombia (1 `ACOPIO` in Cali — Minuto de Dios San Fernando — and 3
`BLOOD_DONATION` permanent Cruz Roja blood banks in Cali/Armenia/Manizales). No
Acopio Colombia sample entries fell in a tracked city. For anyone needing the
nationwide picture, `/recursos` links directly to both sites rather than duplicating
their full datasets here.

### Rejected — red-centros-acopio

`github.com/Dvargas005/red-centros-acopio` — an open-source acopio-coordination
*template* (Next.js + Supabase), the same genre as the two sites above, but **not
seeded**: no live deployment exists (only self-deploy instructions in the README), and
the README states it was built for the **Venezuela** earthquake of 2026-06-24, not
this event. Zero evidence it's been adapted/deployed for the Colombia response.

### Next steps
1. Review the 32 pending candidates at `/admin/moderacion` (28 Pereira/Dosquebradas
   from ayudaspereira.com + 4 Cali/Armenia/Manizales from Cuidar a Colombia).
2. If deeper coverage of Cuidar a Colombia's/Acopio Colombia's full datasets is ever
   wanted for our other tracked cities specifically, pull `/data/app.json` from
   Cuidar a Colombia and re-query Acopio Colombia's live site filtered to
   Pereira/Cali/Manizales/Armenia/Quibdó — not attempted this pass (sample-only).
