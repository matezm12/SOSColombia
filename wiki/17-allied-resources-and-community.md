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

### Next steps (pass 1)
1. ~~Review the 32 pending candidates at `/admin/moderacion`~~ — done 2026-08-14, all
   32 approved.
2. If deeper coverage of Cuidar a Colombia's/Acopio Colombia's full datasets is ever
   wanted for our other tracked cities specifically, pull `/data/app.json` from
   Cuidar a Colombia and re-query Acopio Colombia's live site filtered to
   Pereira/Cali/Manizales/Armenia/Quibdó — not attempted this pass (sample-only).

## Social media search — pass 2 (2026-08-14)

Follow-up pass specifically targeting individual social media posts (not aggregator
sites) — donation channels, housing/shelter offers, and aid points/needs in the
comparatively under-covered cities (Manizales, Armenia, Quibdó). Three parallel
agents, one per angle. Real constraint hit repeatedly: X/Twitter posts aren't
indexable via the available search tools at all, and Instagram captions usually
can't be fetched directly (image-blob-only responses) — most findings had to be
verified by direct-fetching the specific post where possible and cross-checking
against independent mainstream news coverage, not by reading the post text directly
in every case. Confidence levels reflect that.

### Seeded — 5 PendingSocialPost + 1 PendingAidPoint

All via `prisma/seed-social-posts-pass2.ts`, origin `AUTOMATION_SWEEP`, awaiting
`/admin/comunidad` review:

- **@goyo (Instagram)** — Gloria "Goyo" Martínez Perea (ChocQuibTown), directing
  bank-transfer donations to her hometown Condoto, Chocó via FUNDESOPA. High
  confidence — account number cross-confirmed by Publimetro and Expreso.ec.
  Condoto isn't one of our tracked municipios (only Quibdó/San José del Palmar exist
  for Chocó) — seeded with no `municipioId`, place named in `placeName` instead
  rather than creating a new municipio for one post.
- **@juanma.cuantico (Instagram)** — third-party-organized Vaki campaign to rebuild
  "Manuelina," a pasta restaurant in Manizales destroyed in the quake. Medium
  confidence — couldn't independently confirm this Vaki URL isn't already inside the
  excluded GoFundMe hub, though it's a distinct platform.
- **@jhonnyrivera (Instagram)** — singer Jhonny Rivera converted his Hotel La Rivera
  (Calle 20 #3-58, Pereira) into a free shelter for displaced families + 15 visiting
  doctors, plus a physical donation point and QR code for money. Corroborated by 8+
  outlets. Seeded as **both** a `PendingSocialPost` (category `AID_POINT`) and a
  `PendingAidPoint` (kind `ALBERGUE`) — the hotel is a real place worth having in the
  directory itself, not just an embed.
- **@fundacionkenovycolombia (Instagram)** — a 300+-dog rescue shelter outside
  Armenia had partial roof/wall/enclosure collapse; posting specific supply needs
  (fencing, dog houses, roof tiles, food) and now capping visitors at 20/day for
  structural-risk reasons. High confidence — verified directly against an
  established 56K-follower account's own post captions, cross-confirmed by El Tiempo
  and Semana in identical detail.
- **@yuri_copete (Instagram)** — Miss Universe Chocó 2020, posting from abroad,
  confirmed her family's Quibdó house destroyed same-day, family safe, asking that
  institutional aid prioritize Chocoano families. High confidence — content
  verified directly, corroborated by 5 outlets.

### Rejected — worth recording, not seeded

- No individual/grassroots housing offers (a private citizen or informal host)
  survived verification at all — every hotel/lodging offer found traced back to
  press-relayed PR statements (Hotel Campestre Monte Carlo Manizales, Hoteles
  Spiwak Cali) with no discoverable social-media permalink to the offer itself.
  Genuine gap, not a search failure.
- No individually-posted (not journalist-sourced) aid point survived verification
  for Manizales specifically — several leads (Fundación Lazos de Amor, Edén del
  Abuelo, Ángeles de la Calle Manizales) traced back to press interviews, not the
  orgs' own current posts.
- **Two red flags surfaced, now listed in `/donar`'s scam-warning box (point4/point5,
  both locales)**, matching this project's existing practice of naming known bad
  actors (see the "SOS Chocó"/"Rescatistas LATAM" entries already there):
  - `terremoto-colombia-donacionesverifica.netlify.app` — matches the classic scam
    pattern (generic branding, no institutional identity, free hosting). Live scam
    site, not a rejected-for-insufficient-evidence candidate.
  - A fundraiser tied to a sitting congressman, publicly flagged by a former
    Attorney General for routing donations into a personal bank account —
    possible illegal mass fundraising under Código Penal art. 316.
- Other rejected leads (engagement-bait "comment COLOMBIA for the link" posts, a
  barber-campaign with no discoverable permalink, a family GoFundMe with no stable
  social-media permalink) — see the raw agent transcripts if ever needed, not
  detailed here since none were close enough to the bar to be worth re-checking.

### Next steps (pass 2)
1. ~~Review the 5 pending social posts + 1 pending aid point~~ — superseded by pass 3
   below, review everything together.
2. A genuine gap remains: no verified grassroots housing-offer post exists anywhere
   in this dataset. Worth a dedicated re-check if `/comunidad` ever needs that
   category populated — X/Instagram's scraping limitations may ease with different
   tooling (e.g. authenticated browser automation instead of WebFetch/WebSearch).

## Pass 3 (2026-08-14) — TikTok, Facebook, new allied sites, X retry

Four parallel agents: TikTok sweep (unexplored in passes 1-2), Facebook groups/pages
sweep, new allied-resource sites (missing-persons platforms, volunteer-coordination
tools, university dashboards, Caldas/Quindío government), and a harder X/Twitter push.
Session-wide WebSearch quota (200 calls) ran out mid-pass — the X/Twitter agent got
zero searches and returned nothing; the other three adapted (WebFetch against search
engines directly, or a logged-in Facebook browser session) and still produced real
results. If more research is wanted soon, it needs a fresh session or a raised
`CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.

### New allied resources — 4 seeded

- **Desaparecidos.co** — a second, independent missing-persons/family-reunification
  registry (~4,890 cases, 8 cities), plus a hospital locator and lost-pets search.
  Custom domain, no author attribution found anywhere on the site. Tier 4.
- **Colombia Te Busca** (colombiatebusca.com) — was already cited as a `Source` for
  one crowdsourced-missing-persons figure (see `wiki/03-death-toll.md`) but never
  added to the `/recursos` directory itself. Confirmed live (5,353 registered,
  2026-08-13) with a real Facebook page. Custom domain. Tier 4.
- **Terremoto Colombia 2026** (terremoto-colombia-2026.vercel.app) — dashboard of
  official casualty/damage figures over time + a directory of verified official
  channels (report damage, request aid, donate, volunteer). Vercel-hosted, no custom
  domain. Self-described "under construction." Tier 4.
- **Terremoto Colombia** (terremotocolombia.vercel.app) — quantifies damage using
  real Copernicus EMS Rapid Mapping (EMSR916) satellite data + USGS ShakeMap across
  650 municipios, auto-updating daily via GitHub Actions. Genuinely novel — a
  grassroots analog to the Microsoft AI for Good building-damage dataset already
  documented in `wiki/13-opensource-tools.md`. Vercel-hosted, self-labeled
  "estimación-proxy," built by one individual dev. Tier 5.

Checked and explicitly rejected as not-yet-functional: monitor-sismo-colombia-2026
(stuck on "Cargando datos…"), mapa-ayuda-terremoto-colombia (Supabase setup error,
no data). Several other GitHub repos found had no live deployment at all.

Explicit gaps confirmed (not search failures): no volunteer-skill-matching tool
exists, no university-run damage dashboard exists (several universities issued
solidarity statements but none built a tool), and neither Caldas nor Quindío has a
dedicated government earthquake microsite comparable to Risaralda/Valle/Chocó's.

### New community embeds — 11 seeded (4 TikTok, 7 Facebook)

TikTok (all high-to-medium confidence, cross-checked against news coverage):
- **@musicalifyco** — footballer Jhon Arias (Quibdó native) chartered planes with
  medics/supplies to Quibdó hospitals. High confidence, 8+ outlets corroborating.
- **@noti90minutos** — new acopio point at Ciudadela Petronio Álvarez, Cali (active
  since Aug 12). Also seeded as a `PendingAidPoint` (kind `ACOPIO`).
- **@cambiamoscolombia** — Quibdó needs report (water, medicine, food) — not a
  donation solicitation, lower scam risk.
- **@full_cali** — hundreds of volunteers working through rubble, Cali, quake day.

Facebook (verified via a logged-in browser session, which worked far better than
unauthenticated scraping — Facebook blocks that entirely):
- **Fundación Kilele** (Quibdó) — youth mental-health/education nonprofit, working
  donation link, own website, pre-existing mission.
- **Fundación CHOCÓ TE Quiere** (Quibdó) — local nonprofit, public WhatsApp donation
  contact.
- **Universidad de Caldas** official page (Manizales) — Comunicado Institucional
  No. 3, activated its Coliseo (Velódromo sector) as an acopio point, 300+
  volunteers, corroborated by La Patria. Also seeded as a `PendingAidPoint`.
- **ACOPI Caldas** — regional small/business association, verifiable physical
  address and own site — the corporate/CSR angle this pass specifically went
  looking for.
- **630 Café** (Manizales community media) — actively reposts the Alcaldía de
  Manizales' own updated acopio-center graphics (La Avanzada, Chipre, Milán, Av.
  Santander neighborhoods) — useful as an aggregated source, but only neighborhood
  names were captured, not full addresses, so no separate `PendingAidPoint` spun off
  this one.
- **Fundación Manos Unidas de Dios** (Armenia) — elder-care nonprofit, own site,
  connected to an international church relief effort.
- **Comunidad La Finca y Zona Norte, Madrid (Cundinamarca)** — hyperlocal
  neighborhood page running a dated (Aug 13-17), items-only donation drive at a
  specific address. Madrid, Cundinamarca isn't a tracked municipio (it's near
  Bogotá, outside the disaster zone, organizing *outbound* donations) — seeded with
  no `municipioId`, location in `placeName` instead.

Rejected, worth recording: a politically-entangled Miami collection-point page (real
physical point, but mixed with partisan content — too entangled to recommend
cleanly); two Facebook-flagged "AI content" posts; several generic
disaster-alert/meme groups; a municipal youth office whose real activity happened on
Instagram, not Facebook (stale FB timeline). On TikTok specifically: an anonymous
personal-Nequi-number donation appeal with zero institutional backing (same scam
profile as prior rejected finds — not added as a new named scam-warning entry since
existing `/donar` warning language about "new and anonymous profiles, urgency
pressure" already covers this pattern generically), plus a cluster of
templated/engagement-bait "how to help Colombia" videos from generic personal
accounts, and several off-topic results that turned out to be about the earlier
Venezuela earthquake despite keyword matches.

### Next steps (pass 3)
1. ~~Review all pending items~~ — superseded by pass 4 below, review everything
   together.
2. ~~X/Twitter remains effectively unresearched~~ — solved in pass 4, see below.
3. 630 Café's aggregated Manizales acopio-center info (La Avanzada, Chipre, Milán,
   Av. Santander) could become real `PendingAidPoint` rows if someone pulls exact
   addresses from the Alcaldía de Manizales' own graphics directly — not attempted
   this pass since only neighborhood names were captured secondhand.

## Pass 4 (2026-08-14) — X/Twitter, via the user's logged-in browser

Passes 2-3 both concluded X/Twitter was unresearchable — WebSearch/WebFetch can't
index it at all, and pass 3's dedicated X agent got zero searches in before the
session's WebSearch quota ran out. The fix: the user is logged into X in their own
Chrome session, and browser automation isn't subject to the WebSearch quota at all.
Searched X directly (`x.com/search?f=live`) across ~12 queries — general donation
terms, per-city acopio terms, payment-method terms (Nequi/Bre-B), housing-offer
phrase variants, and category terms (veterinary, medical brigades).

**Housing offers: confirmed dead end, not a tooling problem.** With real X access and
multiple targeted phrase searches ("ofrezco alojamiento," "tengo espacio," "casa
disponible," "puedo alojar" + damnificados/terremoto), nothing surfaced beyond noise
matches and pre-existing unrelated content. Three passes, three access methods
(WebSearch, WebFetch, direct logged-in browser), zero results — this category
appears to genuinely not exist on social media for this event, not to be hidden
behind a search limitation.

### 5 new PendingSocialPost + 1 more PendingAidPoint

- **@ElOpinometro_** — Luis Díaz (Liverpool/Colombia footballer) joined relief
  efforts via his Foundation, opened an acopio center in Barranquilla. High
  confidence (verified public figure). No `municipioId` (Barranquilla untracked).
- **@Power69ful** — Centro Comercial San Façon, Calle 13 #20-90, **Pereira** —
  explicitly goods-only, no money accepted (reduces scam risk). Generic personal
  account, but specific verifiable address — seeded as both a `PendingSocialPost`
  and a `PendingAidPoint` (kind `ACOPIO`).
- **@Ditu_Tv** — Once Caldas footballers (Jefry Zapata, Juan Patiño) at a Manizales
  acopio point ("Blanco Blanco de Manizales"). Established sports-media account, no
  exact address given so no separate aid-point row.
- **@danielgarciacg** — Palacio de los Deportes, Bogotá, hosting a dated (Aug 16)
  donation event for Chocó families. No `municipioId` (Bogotá untracked).
- **@MalaMMujer** — Caicedonia (Valle del Cauca, also earthquake-affected but
  outside our 5 tracked cities) relief truck, collection point in Teusaquillo,
  Bogotá. Verified account relaying another org's effort, not the organizer itself
  — medium confidence.

Explicitly rejected during this sweep: an anonymous personal-appeal post ("mi
familia perdimos nuestra casa... colabórame") — textbook version of the
already-documented scam pattern (new/anonymous account, pure urgency, no
institutional backing); several viral CNN/news veterinary-evacuation reposts with
no actionable location/contact; general solidarity/commentary posts with no
specific new information; and an individual's real-time rescue plea (a person
possibly trapped, tagging @MinInterior) — out of scope for `/comunidad` (which
surfaces places/needs, not individual emergency situations to act on) and
potentially already resolved/stale by the time anyone would see it here.

### Next steps (pass 4)
1. ~~Review all pending items~~ — superseded by pass 5 below.
2. ~~If more X research is wanted~~ — extended to Instagram/Facebook in pass 5.

## Pass 5 (2026-08-14) — Instagram + Facebook, via logged-in browser

Same approach as pass 4 (WebSearch/WebFetch can't meaningfully access either
platform's real content — Instagram captions especially — but the user's own
logged-in sessions can). Searched Instagram's keyword search and hashtag pages,
and Facebook's post search, across ~8 queries targeting Manizales/Armenia/Quibdó
specifically (the cities every prior pass under-covered relative to Pereira/Cali).

### Real find: a partially-debunked "official" acopio infographic is circulating

A graphic titled "PUNTOS DE ACOPIO OFICIALES — TERREMOTO COLOMBIA" appeared via two
separate reposting accounts during this sweep, listing specific addresses for 8
cities (Bogotá, Medellín, Cali, Pereira, Manizales, Barranquilla, Armenia, Quibdó)
with an ABACO-network branding treatment that reads as credible at a glance. **A
comment on one repost, from someone who says they physically went to the listed
Bogotá address, states flatly that nothing exists there** ("no hay nada, no existe
nada de banco de alimentos en esa dirección... No compartan información falsa").
That's a direct, first-hand debunking of at least one entry.

**None of this graphic's claimed addresses were seeded** — a confirmed-false entry
undermines confidence in the rest of the same graphic, including its Manizales claim
(Universidad de Manizales, Cra 9 #19-03 — notably a *different* institution than
Universidad de Caldas, which pass 3 verified independently via that university's own
official page and La Patria's corroboration). If `/admin/moderacion` or
`/admin/comunidad` ever surfaces this graphic or its specific addresses from another
source, treat it as unverified/likely-false, not as a lead to promote.

### 7 new PendingSocialPost + 4 new PendingAidPoint

- **@fundacionplataformas** (Instagram) — Manizales, Calle 47 #34-20 Prado Medio.
  High confidence: the post carries Instagram's own location tag ("Manizales,
  Caldas - Colombia"), not just claimed text. Dual-seeded as an aid point.
- **@bancodealimentosmanizales** (Instagram) — Manizales, Calle 49 #27A-85/Faneón.
  **Highest confidence of this whole research effort**: an established
  institution (Banco Arquidiocesano de Alimentos, part of the ABACO network
  already known as a tier-1 org, run with Cáritas Arquidiocesana), explicit
  bank accounts, explicit itemized accept/reject rules. Dual-seeded as an aid
  point.
- **@mariapaz_buitrago** (Instagram) — **seeded with an explicit ambiguity
  warning, not as a confirmed Manizales location**: headlined "¡MANIZALES NOS
  NECESITA!" but two commenters on the post itself ask whether the address is
  actually in Bogotá. No `municipioId` assigned pending clarification — this is
  exactly the kind of thing a human moderator needs to look at directly rather
  than have auto-resolved.
- **@laplazadewein** (Instagram) — general medical-supply needs list spanning
  Pereira/Manizales/Cali/Quibdó, no specific address. Verified account, medium
  confidence, less actionable without a drop-off point.
- **@jeissonyjonnyasesores** (Instagram) — a real beauty-salon business (verified,
  location-tagged Pereira) converted both its Armenia and Pereira locations into
  acopio points, 8am-4pm, itemized needs.
- **@arcadejuana.col** (Instagram) — Hospital San Francisco de Asís de Quibdó (the
  department's only second-level hospital) requested urgent medical-supply
  support; a Bogotá-based collective is running the actual collection point.
  21K+ likes, high reach.
- **Mujeres Imparables** (Facebook) — "Chocó de Pie" campaign, **two real physical
  addresses inside Quibdó itself** (not a Bogotá proxy this time): Rosales Cll 21
  and Silencio Cra 8#28-45B, each with its own phone number, plus a Bancolombia
  account. Run in coalition with JMD La Voz and Imparables y La Voz del Pacífico.
  Dual-seeded as two separate aid points (one per address).

### Next steps (pass 5)
1. ~~Review all pending items~~ — superseded by pass 6 below.
2. If someone encounters the "PUNTOS DE ACOPIO OFICIALES" 8-city graphic (or its
   Manizales/Armenia/Quibdó claims) from an independent source later, don't trust
   it without re-verification — see the debunking note above.

## Pass 6 (2026-08-14) — deeper into already-known sources, new municipio

Different angle from passes 2-5: instead of fresh searches, went back into sites
this project already trusts and pulled their *raw data* directly (Cuidar a
Colombia's `/data/app.json`, Acopio Colombia's live search) rather than reading
sampled posts, plus re-checked ayudaspereira.com now that it's grown since pass 1
(28 → 41 Pereira centers).

### New municipio: Buenaventura

Cuidar a Colombia's raw dataset marks Buenaventura `gravedad: "critica"` with
`nivel_evidencia: "incluye_fuente_oficial"` and `seguimiento_prioritario: true` —
the same evidentiary bar as our existing tracked cities, not an incidental
mention. Real, official-sourced damage: ~20 landslides cutting the Cali highway,
3 deaths in the corridor's tunnels, airport restricted to humanitarian flights
only, confirmed by the Gobernación del Valle del Cauca directly (not just press).
This is categorically different from cities like Bogotá/Medellín/Barranquilla
that also show up in these datasets — those are national donation-collection
*hubs* for money/goods headed elsewhere, not places the earthquake itself hit.
Buenaventura is disaster-affected in its own right, which is the bar for a
tracked `Municipio`, not just "a city with a collection point."

Added as `Municipio` (DIVIPOLA `76109`, Valle del Cauca, `severityLabel: CRITICA`).
**Deliberately left `redAlert: false`** — that field maps to the specific
official 5-city list (Cali/Pereira/Manizales/Armenia/Quibdó) established early in
this project's stage-1 research from named sources (Infobae, UNGRD); `CRITICA`
severity is a separate, broader signal and shouldn't silently overload that
field's meaning.

3 real Buenaventura acopio points seeded (`PendingAidPoint`), two of them
cross-confirmed independently across two different allied sites (Cuidar a
Colombia's dataset AND Acopio Colombia's live search both list "Centro
multimodal de Puente Nayero" under the same name):
- Banco de Alimentos de Buenaventura (ABACO network — same network as the
  already-approved Manizales food bank)
- Centro de acopio La Licorera (direct Gobernación del Valle source)
- Centro multimodal de Puente Nayero (Corporación Corhapep) — cross-confirmed

### 2 new Armenia aid points (existing municipio, new coverage)

ayudaspereira.com — already trusted, already the source for the 28 approved
Pereira/Dosquebradas points — now also lists Armenia directly: Barrio Limonar
(Etapa 3, Mz 5, Casa 20) and Power Music Center (Carrera 14 #9-72), each with a
named responsable. Same platform, same trust level as what's already approved.

### Other candidate cities found — NOT added, weak/single-source evidence

ayudaspereira.com's growth also surfaced real but thin signal in ~12 other small
towns (Filandia, Ibagué, Quimbaya, Roldanillo, Bolívar, Riosucio, Santa Rosa de
Cabal, Vereda Aurora Valle, Guática, Apía, Anserma, Congal Bajo-Alcalá, El Águila,
El Dovio) — each with just 1-2 self-reported centers on a single platform, no
independent corroboration. Also Nóvita, Chocó, flagged in Cuidar a Colombia's own
dataset as `gravedad: "alta"` but `nivel_evidencia: "una_fuente_secundaria"` (one
secondary source only). None of these were added as tracked municipios — the
same discipline as not seeding the debunked infographic's claims: single-source,
small-scale signal doesn't clear the bar Buenaventura cleared. Listed here so a
future pass doesn't have to rediscover them from scratch, and can prioritize
strengthening evidence for these specifically rather than searching blind.

### Next steps (pass 6)
1. ~~Review all pending items~~ — superseded by pass 7 below.
2. If any of the "not added" candidate towns above gets a second, independent,
   official-leaning source, that's the trigger to add it as a tracked municipio —
   don't add on single-source self-reported data alone (this is exactly the
   standard Buenaventura had to clear).

## Pass 7 (2026-08-14) — same cross-check, applied to our EXISTING cities

Pass 6 mined Cuidar a Colombia's/Acopio Colombia's raw data for cities we *didn't*
track yet (found Buenaventura). This pass applied the same technique the other
direction: searched Acopio Colombia's live site city-by-city for Quibdó, Cali,
Manizales, and Pereira specifically — cities already tracked, but never
individually queried against this particular source before (prior passes sampled
it generally, not per-city).

### 9 new PendingAidPoint + 1 monetary-donation channel

- **Quibdó**: Punto de Solidaridad Quibdó (Calle 27A #23-44, Barrio Los Ángeles) —
  verified, a third distinct Quibdó location alongside the pass-5 "Chocó de Pie"
  pair.
- **Cali**: 4 points — Antigua Licorera del Valle and Plazoleta Jairo Varela (both
  verified), Banco de Alimentos de Cali and Escuela Nacional del Deporte (both
  listed "Reportado" — self-reported, not yet verified by Acopio Colombia's own
  process, weaker status flagged explicitly in each note).
- **Manizales**: Sr Buñuelo Manizales (Carrera 23 #60-26) — verified, distinct
  from the food bank/university/Fundación Plataformas points already pending.
- **Pereira**: Complejo Bodeguero Alpaca (verified) + two CAFE-network addresses
  (CAFE Comuna del Café, CAFE Consota) — both "Reportado." CAFE is the network
  `wiki/13a-mapadelterremoto-watch.md` already flagged as having more sites than
  the "original 7" it tracked by name; these two give us actual addresses for two
  of the ones we didn't have.
- **ONE Inversión Social** — "Una noche por Chocó," a Chocó-targeted monetary
  channel found in Cuidar a Colombia's `canales` data (not sampled in earlier
  passes): Bancolombia account + Bre-B key, run with Sankofa Danzafro/La
  Pascasia/Corporación Presentes, fuente_oficial. Seeded as a `MONETARY_DONATION`
  aid point for Quibdó.

One explicit duplicate-risk flag: "Banco de Alimentos de Cali (Acopio Colombia)"
may be the same institution as an existing/other Banco de Alimentos de Cali
record — noted directly in its `submitterNote` for the moderator to check before
approving, rather than silently risking a duplicate.

### Next steps (pass 7)
1. ~~Review all pending items~~ — superseded by pass 8 below.
2. Acopio Colombia's search has a substring-matching quirk worth knowing about:
   searching "Cali" also matched "California Tattoo" in Bogotá. Always check the
   actual city field on each result, not just that a search returned it.

## Pass 8 (2026-08-14) — GitHub search retry, direct TikTok, a caution

Two angles: a fresh GitHub repository search (same technique as passes 1/3 — new
repos appear daily) for new allied *sites*, per the standing ask to keep adding
"similar initiatives to our own"; and a direct TikTok search (previously only
sampled by an agent in pass 3, never browsed directly).

### 1 new allied resource — with an attribution caveat worth reading

**Terremoto Colombia 2026 — Impacto en Edificaciones**
(andresabarca-atlas.github.io/terremoto-colombia-2026) — a damage/economic-loss
dashboard using BID (Inter-American Development Bank)/GEM 2023 exposure-model
methodology. Flagging this one carefully rather than treating it like the other
finds: **the site displays a "USO INTERNO" badge and text describing itself as a
BID internal tool, but it's hosted on a personal GitHub Pages account, not an
institutional one — official BID affiliation is unconfirmed.** The site's own
disclaimer already says the figures don't substitute official assessments, which
helps, but the "internal BID tool" framing on a public page is exactly the kind
of ambiguity this project's sourcing discipline exists to catch. Seeded at tier 5
(lowest tier used so far) with the caveat spelled out directly in its `notes`
field — not treated as institutionally-verified the way the ABACO-network finds
have been.

### Checked, not added

- **Julian-Rincon/ayuda-terremoto-colombia** (GitHub) — a genuinely
  well-architected project (Pereira MVP backend, a national Ushahidi-based
  coordination layer, HXL export for the humanitarian community, USGS
  auto-activation), explicitly designed to not handle payments/donations. Not
  added: no live deployment found, and its own README says parts of the
  national layer run in sandbox mode, not real integrations yet. Worth
  re-checking later if it ships a public URL.
- Direct TikTok search surfaced mostly viral earthquake-documentation clips
  (not aid-point announcements) and at least one video from an account with
  overt political-campaign branding (`#pactohistorico`, tagging a specific
  politician) requesting donations for Cúcuta — skipped for the same
  political-entanglement reason the Miami collection-point page was skipped in
  pass 5, not because the underlying need is fake.
- Other GitHub search results this pass were repos already known from earlier
  passes (jdramirezzu, JorgeGalindo, darkpel4, sauricar — the last two already
  checked and rejected as not-live in pass 3, not re-verified this pass).

### Next steps (pass 8)
1. ~~Review all pending items~~ — superseded by pass 9 below.
2. Sr Buñuelo Manizales and the CAFE-network addresses (pass 7) suggest there may
   be more value in searching Acopio Colombia/Cuidar a Colombia per-neighborhood
   or per-network-name (e.g. "CAFE", "Comfamiliar") rather than just per-city —
   not attempted yet.
3. TikTok search works fine unauthenticated (no login wall hit) — future passes
   don't need to assume it requires the user's logged-in session the way
   Facebook did.

## Pass 9 (2026-08-14) — Popayán, the most-neglected tracked city

Sanity check partway through this pass: **11 more `PendingAidPoint` rows got
approved since the last check** (43 live `AidPoint` rows now, up from the 32
baseline after the first review round) — the moderation queue is actively being
worked, not just accumulating.

Every prior pass concentrated on the 5 red-alert cities plus Buenaventura —
Popayán (tracked since the original stage-1 research, `MODERADA` severity, not
red-alert) had gotten essentially zero attention. Checked it against the same
two already-trusted sources (Cuidar a Colombia's raw data, Acopio Colombia).

### 2 new Popayán aid points, one cross-confirmed

- **S.C.A.R.E. — Sede Popayán** (Carrera 9 #18N-231, oficina 205, Edificio
  Terrazas del Norte) — Sociedad Colombiana de Anestesiología y Reanimación,
  campaign "Juntos somos Colombia," `fuente_oficial` in Cuidar a Colombia's
  dataset. **Independently found again by Acopio Colombia at the exact same
  address** under the name "ACSC Popayán" — two allied sites converging on the
  identical location is about as strong a confirmation as this project gets
  without direct verification.
- **Polideportivo de La Paz** — verified on Acopio Colombia, alimentos/aseo e
  higiene/medicamentos, Thursdays 3-8pm.

**San José del Palmar checked again — still zero.** No acopio entries, no
`zonas` entry above baseline severity in Cuidar a Colombia's data. Consistent
with the original stage-1 finding in `wiki/00-INDEX.md` ("no formal aid-point
infrastructure" at the literal epicenter) — reconfirmed, not new information,
but worth explicitly re-checking rather than assuming it's stayed true for
5+ days.

### Next steps (pass 9)
1. ~~Review all pending items~~ — superseded by pass 10 below.
2. Research this session has covered: X, Instagram, Facebook, TikTok direct
   search; Cuidar a Colombia and Acopio Colombia raw-data mining per-city for
   all 9 tracked municipios; GitHub repo search for new allied sites (3 rounds).
   Genuine remaining gap: grassroots housing offers (confirmed dead end, not
   worth re-trying without a different data source entirely).

## Pass 10 (2026-08-14) — the CAFE network, complete

Followed up directly on pass 8's tip: searched Acopio Colombia for "CAFE"
itself (Comfamiliar's Centro de Atención Familiar en Emergencia network) rather
than per-city. `wiki/13a-mapadelterremoto-watch.md` knew this network existed
("the original 7 CAFE network," referenced by count during stage-1 research) but
never had names or addresses for its sites.

### 5 more CAFE-network points — all 7 now identified by name and address

Pass 7 had already found 2 (CAFE Comuna del Café, CAFE Consota). This pass found
the remaining 5: **CAFE El Remanso**, **CAFE Kennedy**, **CAFE Ormaza**, **CAFE
Perla del Otún**, **CAFE San Nicolás** — all in Pereira, all "Reportado" status
on Acopio Colombia (self-reported, not yet verified by that site's own process).

One of them resolves an old open thread directly: **CAFE Perla del Otún**'s
address ("Diagonal a la iglesia de los 2.500 Lotes, sector Cuba") almost
certainly is the "2.500 Lotes" point (P-720/P-721) that
`wiki/13a-mapadelterremoto-watch.md` already logged as added "en el segundo día
de la emergencia" — that reference had a name but no real address; this gives
it one, under its actual operating network's name.

With this pass, the "original 7 CAFE network" wiki/13a referenced only by count
is now fully mapped by name and address, 7 for 7.

### Next steps (pass 10)
1. ~~Review all pending items~~ — superseded by pass 11 below.
2. Genuinely diminishing returns now on the per-network/per-neighborhood
   technique that worked well for CAFE — no other named network (Comfamiliar
   itself runs CAFE; ABACO's food banks were already found per-city) is known
   to have unmapped members the same way.

## Pass 11 (2026-08-14) — direct social search for Buenaventura and Popayán

Every prior social-media pass (2-5) predates Buenaventura and Popayán getting
real attention (passes 6/9 found them via allied-site datasets, not social
search directly). This pass corrected that gap: targeted X and Facebook search
specifically for these two cities.

### 3 new aid points + 3 community embeds

- **@GobValle** (X, official verified Gobernación del Valle del Cauca account) —
  announced a collection center at Centro Comercial Único, Torre 1, Local 48,
  serving both Buenaventura and Dagua (Dagua isn't tracked — single mention, not
  added as a municipio, same discipline as Nóvita in pass 6).
- **Soy de Buenaventura** (Facebook, verified community page) — a specific
  rural-area appeal for the corregimiento of Zacarías Río Dagua, real address
  and 3 phone lines.
- **@CNTI_Indigena** (X, Comisión Nacional de Territorios Indígenas — a
  state-recognized official body, verified) — posted 5 acopio points run by
  indigenous organizations: **CRIC in Popayán** (a third Popayán point,
  independent of the two found via allied sites in pass 9) plus 4 in Bogotá
  (ONIC, Gobierno Mayor, Casa del CRIC, CRIC Nacional) — the Bogotá ones aren't
  separately seeded as aid points (Bogotá untracked, and the single social
  embed already covers all 5 locations in one place).

### Next steps (pass 11)
1. ~~Review all pending items~~ — superseded by pass 12 below.
2. Popayán now has 3 independently-found aid points despite starting this
   session with zero social/allied-site coverage — confirms the "direct
   per-city social search" technique still has real yield even on
   previously-neglected cities, when tried with genuinely fresh query angles
   rather than repeating the same generic terms.

## Pass 12 (2026-08-14) — Instagram deep dive on Buenaventura

Buenaventura turned out to have unusually strong grassroots Instagram activity
— a single keyword search returned a dense results page (Necoclí-based diaspora
collection drives, a chamber-of-commerce/diocese corridor, small businesses
converting to acopio points, human-interest/awareness posts, and more) rather
than the handful of results other searches this session typically returned.

### 1 new aid point + 3 community embeds

- **PCN — Proceso de Comunidades Negras** (Calle 4 #16-90, Barrio Santa Rosa) —
  a nationally significant Afro-Colombian organization, real weight in Pacific
  coast communities specifically. Bank account, phone contact, and the account
  actively replying to comments confirming donations still being received.
  High confidence.
- **Diócesis de Buenaventura corridor** — Cámara de Comercio de Buenaventura +
  Confecámaras posted about this, and it turned out to be **the same physical
  address as the ABACO food bank already seeded in pass 6** (Av. Simón Bolívar
  #47C-70) — no duplicate aid point created, but the post itself adds a bank
  account and named contact the earlier entry didn't have, so it's seeded as
  its own community embed.
- **@samuelsuarez10_sb** — not a donation channel, a human-interest/awareness
  post from a Buenaventura native: 30 hours post-quake, aid hadn't arrived and
  the only land route to the rest of the country was still cut. Corroborated
  in its own comments by other locals.

### Checked, not seeded — a real broken-donation-link finding

**Manos Visibles** (a real, already-known org — referenced in `/donar`'s own
scam-warning copy as one of several legitimate actors using "SOS Chocó"-style
branding) posted a donation appeal for Buenaventura. **Two independent
commenters report the QR code and Nequi payment link are both deactivated,
unresolved as of this check.** Manos Visibles itself isn't a scam — this is a
legitimate org with a currently-broken payment mechanism, which is a different
problem than the scam patterns flagged elsewhere in this doc, but the practical
result for a donor is the same: don't seed a "donation channel" that doesn't
currently work. Worth re-checking later in case it gets fixed.

Also checked, not seeded: a Necoclí (Antioquia)-based diaspora collection drive
routing donations through Medellín to Chocó/Buenaventura/Cali — real, but a
multi-step logistics chain rather than a direct Buenaventura address, and
Necoclí itself isn't a disaster-affected city worth tracking.

### Next steps (pass 12)
1. Review all pending items — `/admin/comunidad` has 36 pending,
   `/admin/moderacion` has 34 pending aid points, `/recursos` has 8 allied
   sites, across all 12 passes.
2. Buenaventura's unusually rich Instagram results suggest it may be worth a
   second, equally deep pass on Facebook specifically (only lightly checked
   there in pass 11) — the grassroots-activity density found here on Instagram
   may not be fully mirrored yet.

## Pass 13 — per-city deep pass, starting with Pereira (2026-08-14)

New research mode starting this pass: instead of one broad sweep across
several cities per pass, run a dedicated multi-agent `Workflow` per city —
one agent per platform (X, Instagram, Facebook, TikTok) plus a dedicated
GoFundMe/Vaki crowdfunding sweep, all running in parallel and browser-driven
(logged into X/Instagram/Facebook as the researcher; TikTok needs no login).
The goal: exhaust each city's social-media surface individually rather than
spreading searches thin across all cities at once. Starting with Pereira
since it's the deepest-covered city already and a natural calibration point
for the new workflow shape. More cities to follow in subsequent passes.

Facebook's agent (`facebook-pereira`) failed on a transient safety-classifier
block (`Stage 2 classifier error - blocking based on stage 1 assessment`) —
not a real content issue, just an infra hiccup. Retried via `Workflow` resume
(same run ID, the other 4 agents replay from cache instantly) rather than
re-running the whole pass; if it lands, its findings become their own
follow-up seed script rather than reopening this one.

**10 new aid points, 11 new community embeds.** Two strong new finds fill
gaps this project didn't have before: Pereira's **first BLOOD_DONATION aid
point** (Hospital Universitario San Jorge, corroborated independently by
Instagram — hospital-tagged post — and a TikTok video from El Tiempo shot
outside the hospital showing donor lines) and its **first HEALTH aid point**
(an improvised medical post at the Coliseo Mayor, stood up after Clínica
Comfamiliar's own facility became inoperable — corroborated by France 24
Español, El Espectador, and kienyke independently reporting the same
patient-relocation story).

### New aid points
- **Hospital Universitario San Jorge — Banco de Sangre** (BLOOD_DONATION),
  Carrera 4 #24-88. High confidence, triple-corroborated (hospital's own
  Instagram tag, a multi-city donor graphic, El Tiempo's TikTok footage).
- **Puesto médico de emergencia — Coliseo Mayor** (HEALTH). High confidence,
  corroborated by three independent news outlets.
- **Puesto veterinario de emergencia — Parque Olaya Herrera** (VET).
  Medium-high confidence, 15.3K-like TikTok video shot on site.
- **Adóptame Pereira** (VET) — pre-existing rescue account (not created for
  the earthquake) running an emergency supply drive; comments show real
  donors already confirming drop-offs. High confidence.
- **PPAA — Asociación de Protección y Bienestar Animal** (VET) — two physical
  addresses plus a registered NIT backing the receiving bank account. Medium
  confidence.
- **Consultas Veterinarias Gratis — Dra. Luisa Fernanda López** (VET) — named
  individual professional, free service, no money ask. Medium confidence.
- **4 GoFundMe/Vaki crowdfunding campaigns** (MONETARY_DONATION): Kathryn
  Winn's "Help Pereira Families Recover" ($2,916/$6,500, 27 donors), Cristian
  David Parra Machado's phased-plan campaign (24 donors), Estefany Moreno &
  Diana Castro's "Help My Hometown Pereira" (strongest of the batch — named
  personal loss, sister on the ground, explicit receipt-posting commitment),
  and a Vaki fund for UTP (Universidad Tecnológica de Pereira) students
  displaced from damaged student housing.

**Explicitly excluded from this pass:** a fifth GoFundMe (David Londono,
"Help Our Family Affected by Colombia's Earthquake") whose two named
beneficiaries are actually in Dosquebradas and Marsella, not Pereira proper,
despite the organizer framing it as Pereira-based — kept out to avoid
misattributing aid to the wrong municipio, even though it's a real, decently
-traction campaign (44 donors, the highest in the batch). Also excluded: a
low-traction GoFundMe with only £81/4 donors and an unverified third-party
coordinator; two Vaki campaigns whose real slugs 404'd on the guessed URL
(`ayudemos-a-la-familia-mill-n...`, a "Pereira se levanta" campaign referenced
widely on IG/TikTok but never located); a personal Nequi-account appeal
declaring itself "the only channel" (matches the project's known scam
pattern); and a TikTok GoFundMe link wrapped in generic urgency hashtags with
zero institutional backing.

### New community embeds (11)
Split across categories: 2 X posts (a BluRadio blood-donation video without a
specific address, and a Canal 1 post on MinSalud/PAHO/Red Cross departmental
health-response coordination), 4 Instagram posts (an official Alcaldía de
Pereira missing-persons announcement with real hotline numbers; a large
organic crowd-sourced missing-persons thread that incidentally confirms
on-the-ground conditions in Galicia, Boston, Providencia and El Remanso; a
building-collapse NEED post from the Álamos neighborhood — not previously
covered; a mental-health-hotline post citing Colombia's real Línea 106), and
5 TikTok posts (the three videos corroborating the new aid points above, a
cross-corroborated missing-person case — Juan Felipe Giraldo, confirmed
independently by three news outlets — and a lower-confidence acopio lead in
the Cuba/"2.500 Lotes" sector flagged explicitly as unverified pending admin
review, since the account has no identifiable organizing entity behind it).

One deliberately excluded lead: a TikTok Vaki fundraiser for "familia Toro"
with real-looking engagement (2K+ likes) but a personal, non-institutional
account whose actual Vaki link only lives in the bio (unverifiable from the
video itself) — same reasoning as the two 404'd Vaki slugs above, don't seed
a link no one has actually confirmed resolves.

### Also observed
A recurring cluster of Instagram posts flagged by Instagram itself as "AI
content," recycling the same five-city list (Chocó/Pereira/Manizales/
Cali/Armenia) across blood-donation, animal-aid, and shelter posts — read as
AI-generated engagement-farming content. Where the underlying factual claims
(hospital names, real hotline numbers) were independently verifiable as real
Colombian institutions, they were kept at reduced confidence; where an
account had zero institutional signal, it was rejected outright.

### Next steps (pass 13)
1. Confirm whether the Facebook retry landed; if so, fold its findings into a
   small follow-up seed script rather than editing this one.
2. Continue the per-city deep-pass workflow for the remaining tracked cities
   (Cali, Manizales, Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas, San
   José del Palmar) — Pereira was chosen first as the calibration run for this
   new workflow shape, not because it's the only city getting this treatment.

## Pass 14 — Facebook retry lands, plus a bonus second sweep (2026-08-14)

Resuming the pass-13 `Workflow` run (same run ID, cached agents replay
instantly) succeeded this time — `facebook-pereira` completed clean. The
resume also re-ran the TikTok and crowdfunding agents with fresh searches
(same assignment, different queries/results than their pass-13 runs), which
is a pleasant side effect rather than a bug: it surfaced real, additional
finds pass 13 didn't have. Everything below is net-new on top of pass 13, not
a replacement for it.

**Best single find of this pass:** the official `@concejopereira` (Pereira
City Council) TikTok account posted an itemized list of every city-enabled
shelter/attention point with exact addresses. It confirmed the whole
CAFE/Comfamiliar network already in the dataset (Consota, Perla del Otún,
Remanso, Kennedy, Ormaza, San Nicolás, Comuna del Café — all matched exactly,
nothing duplicated) **and** surfaced four ALBERGUE (shelter) locations not
previously tracked for Pereira at all: **Ecoparque El Vergel** (Boston/
Poblado), **Parque del Oso** (Calle 80 No. 34-19), **Estadio Mora Mora**
(Carrera 11 Bis x Calle 9 Este), and **Plaza de Ferias** (Cerritos sector).
All four seeded at high confidence — official municipal source, exact
addresses.

### New aid points (9)
- **Clínica Veterinaria Visión de las Américas** (VET) — Carrera 13 No.
  9-67. Posted from the clinic's own Facebook page, real business name and
  address. High confidence.
- **Caseta Comunal de Gamma** (ACOPIO) — serves the Corales sector /
  Conjunto Villa del Coral. Individual post, no phone, medium confidence.
- **4 ALBERGUE points** from the official Concejo de Pereira list (above).
- **3 new GoFundMe campaigns**: "Stand With Pereira After the Earthquake"
  (Jovanny Hincapie Betancur — high confidence, $4,386/$8,000, 46 named
  donors, verifiable Pereira-native backstory), "Hope for Pereira" (Andres
  Rios — medium confidence, ~99 donors but generic narrative with no named
  beneficiaries), and a GoFundMe for the Iglesia El Renuevo community
  (Daniela Rodas Sanchez — medium confidence, individual overseas collector
  but 14 real damage photos and a named local church community).

### New community embeds (6)
Facebook versions of the blood-donation call and the Hotel Dibeni
missing-person case (Juan Felipe Giraldo — this Facebook version adds new
detail: he'd traveled to Pereira for his own wedding, planned for that
weekend), plus embeds for the vet clinic, the Caseta Comunal de Gamma acopio
post, the Iglesia El Renuevo GoFundMe, and the official Concejo de Pereira
shelter-list TikTok itself.

### Checked, deliberately not seeded (again)
- **Vaki "Ayudemos a la familia Millán"** — the Facebook sweep found this
  campaign attached to a named poster (Tatiana Millán Constain) and nearly
  seeded it at medium confidence, but the pass-13 crowdfunding agent had
  already vetted the same underlying Vaki page more thoroughly and rejected
  it outright (zero donations, no organizer identity displayed anywhere on
  the campaign page itself). Kept the stricter rejection — a sympathetic
  Facebook share doesn't fix an anonymous, zero-traction crowdfunding page.
- **David Londono's GoFundMe** reappeared in this sweep too (44 donors, the
  highest count of any campaign found for Pereira across both passes) — still
  excluded, same reason as pass 13: its two named beneficiaries are in
  Dosquebradas and Marsella, not Pereira proper.

### Next steps (pass 14)
Pereira's deep pass is now genuinely exhausted across X, Instagram, TikTok,
Facebook, and crowdfunding — move to the next city in the per-city rotation
(Cali, Manizales, Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas, San
José del Palmar).

## Pass 15 — deep pass on Cali (2026-08-14)

Second city in the per-city deep-pass rotation. Cali is Colombia's
third-largest city (official Alcaldía figures: 96 confirmed deaths, 1,224
injured, 111 missing) and already had baseline coverage — two blood banks
(Valle del Lili, Cruz Roja Valle), one shelter complex (Unidad Deportiva
Panamericana), one vet brigade with no fixed address, and several acopio
points from earlier passes. The brief to all 5 agents explicitly listed what
was already known so they wouldn't re-find it, and asked them to push into
specific low-income comunas (Aguablanca, Siloé, Terrón Colorado, etc.) where
grassroots aid is more likely to show up on social media than official
channels.

**Heavy cross-agent overlap this time** — Cali's scale meant the same real
institutions surfaced independently on 3-4 platforms each, which is a good
corroboration signal but required careful deduping before seeding (seed once
per real-world entity, cite the strongest source, note the others in
`submitterNote` rather than creating near-duplicate pending records).

### New aid points (15)
- **3 new blood donation points**: Hospital Universitario del Valle (HUV),
  Clínica Imbanaco, and Hemolife — all three came from a single official
  Alcaldía/Secretaría de Salud flyer (Instagram) naming them alongside the
  already-known Valle del Lili/Cruz Roja Valle, and HUV specifically was also
  independently confirmed via a viral X post, an Army blood-donation report,
  and TikTok footage of the bank's own entrance signage.
- **3 new shelters (ALBERGUE)**: Coliseo de Hockey Miguel Calero and Diamante
  de Béisbol turned out to be **the only two shelters the Alcaldía has
  officially announced** — confirmed via a city councilman, ICBF Colombia,
  and El Salvador's own government press office (which delivered aid there).
  Iglesia Avivamiento Cali, a large established megachurch, is a third,
  separately-announced shelter with very high organic engagement on its own
  post (9.5K reactions).
- **2 vet points**: Agrocanes Clínica Veterinaria (a real clinic offering
  free X-rays, new) and an address enrichment for the already-known Centro de
  Bienestar Animal de Cali (previously had no fixed address on file).
- **7 GoFundMe/Vaki crowdfunding campaigns**, ranging from very strong
  (Familia Saavedra's "Ana nos necesita" — $103K+ raised from 2,274 donors,
  and its story directly matches an independently-corroborated news story
  about triplet Isabella Saavedra, see below) to speculative-but-flagged
  (a €620-raised Cali→Turin, Italy diaspora campaign — new corridor, weak
  traction, included with an explicit caution note for admins).

### New community embeds (14)
Notable ones: an Instagram post from Diario Occidente listing unidentified
patients across two Cali hospitals so the public can help identify them; two
independently-corroborated human-interest deaths (Isabella Saavedra, one of a
set of triplets, found dead after 82+ hours under rubble — matches the
Familia Saavedra GoFundMe above; and Lenny Fernández, who died shielding her
dog Salomón, who survived under her body); and an official UAEPA post
reporting 298 animals still missing citywide.

### Checked, deliberately not seeded
- **Coliseo del Pueblo (Siloé, Comuna 20)** — an X post from El Salvador's
  official government press account, corroborated by two more independent
  posts, described a humanitarian aid delivery to a "centro de acopio" here.
  Kept as a community embed but **not** seeded as its own aid point: the
  researching agent could not rule out that this is the same physical venue
  as the already-tracked Unidad Deportiva Panamericana complex under an
  informal name, and a second agent's attempt to independently verify it on
  Instagram came back empty. Flagged rather than guessed.
- **Banco de Alimentos de Cali's "reportado" (unverified) status** from an
  earlier pass — this pass's brief specifically asked agents to check it.
  Confirmed: their own Facebook page and El País Cali both show them active,
  but their activity matches the already-known Plazoleta Jairo Varela acopio
  address exactly — corroboration of an existing point, not a new one, so
  nothing new was seeded for it.
- **Villalobos Animal News** vet acopio post — Instagram itself flagged it as
  AI content, commenters report the phone lines don't answer, and multiple
  commenters weren't even sure it was located in Cali vs. Bogotá. Classic
  reject pattern.
- **David Londono's GoFundMe** reappeared in Cali search results (it's
  actually for Pereira/Marsella) — excluded again, consistent with passes 13
  and 14.
- Diaspora collection drives found in New York, Los Angeles, and Washington
  DC (CAPA "Fuerza Colombia", Macondo Kitchen, DMV with Colombia) were
  explicitly **not** seeded as Cali aid points since the physical drop-off
  locations are outside Colombia and the drives are general-Colombia, not
  Cali-specific — noted in agent output as diaspora context only.

### Next steps (pass 15)
Move to the next city in the rotation — Manizales, Armenia, Quibdó,
Buenaventura, Popayán, Dosquebradas, and San José del Palmar remain.

## Pass 16 — deep pass on Manizales (2026-08-14)

Third city in the rotation. Manizales had the lightest existing coverage of
the three cities done so far: one shelter complex (Palogrande, two coliseos),
two blood banks with a known address contradiction already on file, three
acopio points, and a donation campaign (Cámara de Comercio de Manizales) with
no captured payment details. The single biggest gap flagged in the brief:
**zero confirmed VET/animal-welfare aid points** — that's where this pass
found the most.

### Two funds, not a contradiction
Two agents (X, Facebook) found one Davivienda account/Bre-B key for the
Cámara de Comercio de Manizales campaign; two others (Instagram, TikTok) plus
the crowdfunding agent found a *different* account/key, cross-confirmed
identically across four independent regional media accounts (Canal Telecafé,
BUM Television, El Expreso Día, Emisora UM FM). Rather than treat this as a
data conflict to resolve, reading both sets of source posts closely showed
they're genuinely **two different funds** run by the same Chamber of
Commerce, with different partner institutions: a community fund ("Juntos por
Manizales," co-run with Cruz Roja Caldas and the Alcaldía) and a business
fund ("Fondo Solidario por los Empresarios de Caldas," co-run with the
Chinchiná chamber and Caldas's Secretaría de Desarrollo). Both are seeded as
separate entries.

### New aid points (10)
- **Unidad de Protección Animal (UPA) — Alcaldía de Manizales** (VET) —
  fills the stated VET gap with the strongest possible source: an official
  municipal program (not a business or individual), coordinating with the
  Policía Nacional's Carabineros unit, running a field census of affected
  animals across comunas and sheltering 18 dogs + 3 cats at Coliseo Mayor.
- **3 real veterinary clinics** offering free earthquake-related care:
  Centro Veterinario Santa Mónica, Movet Express Manizales, and ABC
  Veterinarios (the last one itself earthquake-damaged but still operating).
- **An informal animal shelter** in the El Arenillo sector run by an elderly
  founder ("doña Lucía") caring for ~120 dogs and cats — real, named contact,
  but no formal legal entity found, so flagged medium confidence.
- **A psychosocial-support brigade** (Corporación Red Afecto, HEALTH) — new
  angle beyond the physical/veterinary aid points, though its meeting venue
  couldn't be fully disambiguated from the already-known Palogrande coliseos.
- **The two Cámara de Comercio funds** described above, both now with full
  payment details captured for the first time.
- **2 Vaki crowdfunding campaigns** for individual families — one of which
  (Jose Ivan Vallejo Velez's) had a stale "zero donors" read from a cached
  Google snippet in one agent's pass, corrected to its real state (148
  donors, $8,760 raised) after another agent checked the live page directly.

### New community embeds (14)
Two missing-persons cases worth flagging specifically: Jeimy Damaris Díaz
Sánchez (still unresolved at time of research) and Lizeth Sofía Mera Mora — a
Universidad de Caldas student whose case a highly-liked comment confirms was
**already resolved** (she was found), kept in the record specifically so it
doesn't get mis-reported as an active search later. Also a grassroots need
case in Chipre (Germán Ceballos) with strong organic neighbor corroboration
in the comments, and a structural engineer publicly offering free
damage-safety evaluations to residents who can't afford one.

### Checked, deliberately not seeded
- **Fundación Ángeles de la Calle** — already on file as a live `AidPoint`
  with `UNCONFIRMED` status (not a `PendingAidPoint`, so out of scope for a
  new pending record). This pass found independent media confirmation
  (Revista 4 Patas citing Semana.com) that it's real and still needs help —
  logged as a community embed pointing at that corroboration so whoever
  manages the live table can upgrade its status, rather than creating a
  duplicate pending entry.
- **San Miguel Medicina Veterinaria** — one agent logged this as a Manizales
  vet clinic (Belén neighborhood); a second agent flagged that its address is
  actually in Medellín's much larger, better-known Belén comuna, not
  Manizales. Excluded on the stricter read rather than guessed.
- **A Florida-diaspora bulletin** citing "273 muertos" nationally — wildly
  inconsistent with Manizales's own official 6-death figure and every other
  source in this project; excluded as unreliable.
- **An Instagram scam warning** (radionacionalco) reporting that fraudsters
  are soliciting donations while name-dropping real Manizales businesses —
  no permalink was captured for it, so it couldn't be seeded as a record, but
  worth noting here as a live caution matching this project's existing
  skepticism pattern.
- No new shelter beyond the Palogrande complex, no barrio-specific aid points
  found for San José, La Enea, Solferino, Aranjuez, Cervantes, Bosques del
  Norte, La Sultana, Fátima, or El Carmen despite dedicated searches across
  all 5 agents (only Chipre produced results), and no US/Spain
  diaspora-specific crowdfunding campaign for Manizales — all noted as real
  gaps, not just unsearched ground.

### Next steps (pass 16)
Move to the next city — Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas,
and San José del Palmar remain.

## Pass 17 — deep pass on Armenia (2026-08-14)

Fourth city in the rotation. Armenia had a genuinely unusual profile going
in: the city itself has **0 official confirmed deaths** (a real finding from
the Mayor, not a data gap — Quindío department has a separate, disputed
1-victim attribution to an ambiguous "Armenia-Calarcá" unit that's already
logged as an open contradiction and was deliberately left untouched this
pass), but 6,284 citizen-reported damnificados. The single biggest gap
flagged in the brief was the same shape as Manizales's: **zero confirmed
blood donation points**, closed this pass.

### Fundación Kenovy: a real contradiction, resolved
The most interesting single thread this pass: Manizales's pass (16) had
flagged, via a third party's aggregator post, that Fundación Kenovy's
donation number was reported broken. This pass independently re-investigated
from scratch (not just re-asserting either claim) and found: Kenovy is a real
93.4K-follower, Meta-verified animal shelter based in **Armenia** (not
Manizales — it's referenced as a shelter across the Eje Cafetero region),
genuinely destroyed by the quake per five independent mainstream outlets (El
Tiempo, TV Azteca, BluRadio, Las2orillas, and RTVC Noticias — Colombia's
state broadcaster), and its Bre-B/Nequi/Daviplata number (3009018232) is
currently live — the same number appears consistently across its own
official bio and dozens of posts spanning months, well before the quake, with
zero broken-link complaints found anywhere. Three of five agents (X,
Instagram, crowdfunding) converged on this independently. Seeded as a VET
aid point with the full resolution documented in `submitterNote` rather than
silently picking a side.

### New aid points (13)
- **Cruz Roja Colombiana blood donation point** (Av. Bolívar #23 Norte-60) —
  closes the stated gap, corroborated across X, Instagram, and Facebook via
  an official Banco Nacional de Sangre/Cruz Roja graphic.
- **Fundación Kenovy Colombia** (VET) — see above.
- **5 new acopio points**: the Centro de Convenciones del Quindío
  (the department's central humanitarian hub, corroborated independently on
  both Facebook and TikTok), the Armenia fire department HQ, a barrio-level
  point run by the official Junta de Acción Comunal of Barrio Santander, a
  grassroots point in a previously-uncovered neighborhood (Rincón Santo), and
  a collection effort by the real, internationally-affiliated Rotaract/Rotary
  Armenia clubs.
- **2 new public-facing health points**: a mobile mental-health/medical
  brigade from the official Hospital Mental de Filandia (E.S.E.), explicitly
  public-facing unlike the campus-only Universidad del Quindío brigade
  already on file, and a documented emergency response deployment (Cruz Roja,
  an Army logistics battalion, and USAR team CAUTE Emergencias sin Fronteras)
  at Hospital San Juan de Dios.
- **4 crowdfunding campaigns**: Fundación Covida (a 30+-year Armenia
  disability-services nonprofit with a collapsed wall, $16K+ raised from 442
  donors, multi-outlet press corroboration — the strongest crowdfunding find
  of any city pass so far), two diaspora GoFundMe/Vaki family campaigns, and
  one lower-confidence multi-city GoFundMe included at low confidence with an
  explicit fund-custody caveat for the admin to weigh.

### New community embeds (17)
Notable: an Instagram carousel ("Armenia se une para ayudar") naming several
unverified leads worth a future pass (Fundación Tizu, Villa Carolina, Doña
Hilda, Fundación Manos Unidas de Dios), an official Secretaría de Salud del
Quindío injury balance (64 injured in Armenia, 40 in Quimbaya, 24 in
Circasia), and a resident's account that their complex (Conjunto Alejandría)
felt entirely overlooked by relief efforts despite no loss of life there.

### Checked, deliberately not seeded
- **"Ayúdanos a reconstruir nuestra casa después del terremoto"** (Katherin y
  Joan, Vaki) — a real, specific, plausible story (structural engineer
  visit, partial demolition order) but zero donations at time of check.
  Excluded per the project's standing skepticism toward zero-traction
  campaigns, consistent with how earlier passes have handled this same
  pattern — worth a follow-up check in a later pass.
- **Fundación Oki Doki Hogar de Paso** — 310 animals affected, real damage,
  but a commenter explicitly reports its transfer key doesn't work. Excluded
  on the broken-donation-link rule.
- **A second, new public shelter beyond Coliseo del Sur** — actively searched
  for across all 5 agents and not found; one candidate (via a parody account)
  and one re-confirmation of Coliseo del Sur itself were the only "results."
  Logged as a genuine, still-open gap rather than silently accepted.
- **Two malformed-URL leads** (an X post about Kenovy's damage and a
  "no fatalities" post, both without a clean status permalink) were dropped
  rather than seeded with an unusable link — their content is already
  corroborated by cleaner sources above.
- Two GoFundMe campaigns whose stories turned out to actually be for
  **Calarcá**, not Armenia city, despite Armenia-branded titles/slugs —
  excluded to avoid compounding the project's existing Armenia-Calarcá
  attribution ambiguity.

### Next steps (pass 17)
Move to the next city — Quibdó, Buenaventura, Popayán, Dosquebradas, and San
José del Palmar remain.

## Pass 18 — deep pass on Quibdó (2026-08-14)

Fifth city in the rotation, and the department capital of Chocó — the
epicenter (San José del Palmar) is in this department. The brief flagged
Quibdó as likely thinner in mainstream coverage than Cali/Manizales/Armenia
given the city's long history of underinvestment, and asked agents to
capture that aid-equity gap itself as content where credibly documented, not
just chase new addresses. The TikTok agent hit a transient connection error
mid-run and was retried separately (same run ID, the other 4 replayed from
cache); all 5 completed clean on the second attempt.

### A hospital that's both the answer and part of the problem
Quibdó's blood-donation gap turned out to have a genuinely double-edged
answer. Hospital San Francisco de Asís (Barrio Kennedy) *is* the city's
designated blood bank — but its blood-storage refrigeration unit broke in
the earthquake, confirmed independently by four mainstream outlets (El
Colombiano, Publimetro, Hechos Colombia, Qhubo Bogotá). So Quibdó currently
has **zero functional blood storage**, at the one place that's supposed to
provide it. Rather than seed a BLOOD_DONATION aid point that would send real
donors to a facility that can't currently process them, this is recorded as
an ACOPIO entry for the hospital's broader medical-supply drive, with the
broken-refrigeration status spelled out explicitly in `needsText` — Cruz Roja
was separately reported (TikTok) to be evaluating alternate Chocó collection
points, but no specific Quibdó address for those existed yet at research
time.

### A data-quality note on this pass
The Facebook agent's results all used `facebook.com/search/posts/?q=...`
search-result URLs as their "permalinks" rather than links to the specific
posts it was describing — it couldn't get individual post permalinks to
stick this run. Since `PendingSocialPost.permalink` has to be a real,
embeddable post URL (that's what the embed component renders from), none of
its findings were seeded as community embeds; a search-results page would
just render as broken. Its factual findings (blood-bank refrigeration
failure, chief among them) were folded into the aid points above via
`submitterNote`, since `sourceUrl` on a `PendingAidPoint` is a citation link
rather than something that has to render live.

### New aid points (13)
- **Hospital San Francisco de Asís medical-supply drive** (ACOPIO, Barrio
  Kennedy — a barrio not previously covered) plus its **own official monetary
  channel** (Bre-B QR via Fundación Empresas Conscientes).
- **2 new VET leads**: a mobile 8-organization animal-rescue coalition and a
  Quibdó-based vet clinic + foundation (Zoovet + Fundación Protectora del
  Pacífico) — Quibdó's first confirmed VET content of any kind.
- **The Diócesis de Quibdó's own acopio point and two donation accounts**
  (food bank + Pastoral Social, separate NITs from the already-known
  Gobernación channel).
- **ASINCH**, a real cultural institution with a SWIFT code enabling
  international diaspora donations to repair artist/student housing — a
  direct answer to the diaspora-angle ask.
- **A new barrio acopio point** (Reddhhpac, Barrio Pandeyuca — cross-platform
  corroborated on Instagram and Facebook, though the org's normal mandate is
  the San Juan river communities, not Quibdó proper — flagged for admin
  verification).
- **A congressman's district office** repurposed as a collection point
  (identity verifiable, flagged medium confidence given the political
  affiliation).
- **A formal volunteer medical-brigade call** (Fundación Médicos Amigos)
  requiring ReTHUS professional credentials — the first vetted health-brigade
  content beyond the already-known Jhon Arias private-plane story.
- **2 diaspora GoFundMe campaigns** and **one low-confidence, single-sourced
  acopio lead** (a gas station collection point, included with an explicit
  low-confidence flag per established practice).

### New community embeds (18)
A cluster worth reading together: an official Defensoría del Pueblo
denunciation of "inhumane" conditions at Quibdó's only shelter (Coliseo de
Boxeo), a TikTok report that the same shelter is now also flooding in heavy
rain, and — the strongest single documentation of the aid-equity angle this
project has captured for any city — regional outlet CNC Chocó covering the
president's own on-record statement that "Chocó has been abandoned to its
fate" during a visit to Quibdó. Also: confirmation via the mayor (TikTok,
CAMBIO) that search-and-rescue in Chocó formally closed with the city's
death toll at 9, which explains why no active missing-persons posts turned
up this pass, and a small but telling detail — a veterinary brigade
originally planned for Quibdó was redirected to the nearby municipality of
Lloró after responders learned Lloró has zero vet clinics of its own.

### Checked, deliberately not seeded
- **Fundación Thaar Wajaphasim** — a real, NIT-registered indigenous
  organization (Barrio Medrano) doing direct cash aid and mental-health first
  aid, referenced across multiple independent Instagram roundup posts and
  checking out against Colombian business registries. No agent could pin
  down a working direct-donation URL or a specific post permalink within
  scope (a guessed URL 404'd) — flagged as a strong lead for a follow-up
  pass rather than seeded with a guessed link.
- **A padre-run Zelle solicitation** ("De Chicago al Chocó") routing
  donations to a business name unrelated to any named charity — rejected
  outright as high scam-risk.
- **A Vaki campaign** ("Chocó Nos Necesita: 100 Kits de Esperanza") with a
  $30M COP goal but only ~$3 raised, urgency-driven copy, and no
  Quibdó-specific detail — rejected, though flagged as more procedurally
  organized than most rejected candidates in case a future pass wants a
  second look.
- Barrio-specific searches for Yesquita, Huapango, Obapo, Tomás Pérez, Niño
  Jesús, Zona Norte (beyond the one human-interest post captured), Zona Sur,
  Alameda Reyes, and Samper came back largely empty across all platforms —
  Pandeyuca, Kennedy, and Las Palmas were the only barrios that produced real
  results this pass.

### Next steps (pass 18)
Move to the next city — Buenaventura, Popayán, Dosquebradas, and San José del
Palmar remain.

## Pass 19 — deep pass on Buenaventura (2026-08-14)

Sixth city in the rotation, and a follow-up to the earlier Instagram-only
deep dive (pass 12) that had found unusually rich grassroots activity here —
this pass extended that with the full X/Facebook/TikTok/crowdfunding
treatment. Buenaventura entered this pass with zero confirmed points in four
whole categories (BLOOD_DONATION, VET, HEALTH, ALBERGUE), all flagged as
top priority. The road to Cali being cut by landslides (with deaths in the
highway tunnels) and the airport running humanitarian-only flights for a
period meant this pass also explicitly asked agents to document whether aid
was physically reaching the city at all — it was, largely by air.

### Buenaventura's first shelter
**Manglaria (Manglaria Pacífico)**, Carrera 56b #5-92, is the first
confirmed ALBERGUE for Buenaventura across every pass run so far — a real
address inside the city itself (not a Cali/Bogotá staging point), organic
community engagement in the comments, small capacity (~15 people). Given
multiple independent sources this pass describing people sleeping in the
street with nowhere to go, this genuinely closes a real gap rather than
just adding a data point.

### A VET finding corroborated on all four platforms
**Fundación Salvando Huellitas Buenaventura**, an existing shelter housing
200+ rescued animals, was found independently by all four social platforms
this pass — X and Instagram via its verified Vaki crowdfunding campaign
(269 donors, ~$6,300 raised), Facebook via an unrelated post from a
different account describing the same shelter and needs, and TikTok via a
Publimetro Colombia news report. That's the strongest single-entity
corroboration of any aid point across all six city passes so far.

### New aid points (13)
- **Manglaria** (ALBERGUE) — see above.
- **2 VET points**: Salvando Huellitas (see above) and a mobile veterinary
  brigade from Bogotá scheduled for Aug 22-25 (exact Buenaventura site still
  unconfirmed at research time).
- **3 HEALTH points**: a formal medical brigade from the Colegio Médico
  Colombiano (partnered with Propacífico), the district health secretariat's
  own activation, and a merged entry combining three corroborating reports
  of a national medical reinforcement wave — a field hospital deployment, a
  Hospital Universitario del Valle medical mission, and a Satena flight that
  landed with 3 tons of aid and 15 health professionals (vivid, concrete
  evidence of the air-bridge workaround for the blocked road).
- **7 crowdfunding campaigns**: a diaspora GoFundMe (Catalina García Cure)
  that explicitly names Patrulla Aérea Civil Colombiana as its delivery
  partner and directly documents the access-gap story; a Vaki campaign
  supporting community leaders (líderes/lideresas) specifically, found
  independently by 4 of 5 agents; three more Vaki/GoFundMe campaigns at
  varying confidence; and an international wire-transfer channel (SWIFT
  code) from an account whose backing organization couldn't be independently
  verified, included at low confidence with that caveat explicit.

### New community embeds (20)
A striking cluster documents the access crisis directly: a France 24 report
citing 3 landslides that closed the only road, a TikTok call for machinery
and personnel to clear it, a logistics professional organizing aid for
hard-to-reach rural veredas, and an official Alcaldía Local de Isla Cascajal
coordination meeting. Also a genuine, specific missing-person case (Steven
Ballesteros, last seen heading to a wake) and new comuna/barrio-level
detail — Isla Cascajal, Villa del Carmen (Comuna 12), Barrio El Jardín, and
Barrio 12 de Abril — that hadn't surfaced in any prior Buenaventura pass.

### Checked, deliberately not seeded
- **A pet-food collection post** (Coraye) with a Nequi number — Instagram
  itself flagged it as AI content, engagement was minimal, and the account
  appeared to be running near-identical templated appeals across multiple
  different disaster-affected cities in parallel — the exact multi-city
  templating pattern this project already treats as a red flag. Excluded.
- **"Servicio ZOOCIAL BUENAVENTURA"** — turned out to be a reposted TikTok
  video of unrelated people with a personal savings account attached; a
  direct search for the org by name returned nothing. Rejected as likely
  fabricated.
- **BLOOD_DONATION remains genuinely uncovered** — the only earthquake-
  adjacent institutional blood-donation post found for Buenaventura
  specifically turned out to predate the earthquake by four years. Every
  agent that searched this angle came back empty; treated as a real,
  unresolved gap rather than a search miss.
- A malformed TikTok permalink (missing its video ID) describing a claim
  about an unmobilized hospital ship was dropped rather than seeded with a
  broken link — the underlying claim was flagged as unverified by the
  researching agent itself regardless.
- Manos Visibles was deliberately not re-searched this pass (already
  confirmed broken in pass 12) per the brief's own instruction.

### Next steps (pass 19)
Move to the next city — Popayán, Dosquebradas, and San José del Palmar
remain.

## Pass 20 — deep pass on Popayán (2026-08-14)

Seventh city in the rotation, and the first pass on a MODERADA-severity city
(Popayán was never on the original red-alert list, with just 1 confirmed
death). The brief was explicitly calibrated for thinner results and told
every agent to report empty categories honestly rather than pad them with
weak candidates — and that's largely what happened: the X agent came back
with a completely empty result (18 searches, zero real Popayán-specific
hits), and crowdfunding search confirmed no genuine Popayán-specific
GoFundMe/Vaki campaign exists. Both are reported as real absences, not
search failures.

Instagram, Facebook, and TikTok told a different story, though — Popayán
turned out to have a real, if modest, aid ecosystem, much of it organized
around sending help *outward* to harder-hit Cali, Chocó, and the Eje
Cafetero rather than responding to damage within the city itself (consistent
with its lower severity and single confirmed death).

### Universidad del Cauca confirmed as an organizer
The brief specifically asked whether the university itself organized a
response — it did. `#UnicaucaSolidaria` is a real, university-wide campaign:
the Facultad de Ciencias Humanas y Sociales ran an acopio point corroborated
by roughly ten other Colombian universities reposting the same campaign
details, and the Facultad de Ciencias Agrarias ran its own separate point
under an official numbered circular. Both are seeded as distinct ACOPIO
entries since they're different offices with different logistics.

### A real address discrepancy, flagged rather than resolved
An earlier pass logged "Casa de la Moneda" as an acopio point at Carrera 7
Calle 4 Esquina. This pass found a Facebook post from the Cauca Departmental
First Lady's office soliciting specific medical supplies from the same-named
site, but at Carrera 11 con Calle 3. Rather than assume either address is
right, this is seeded as its own HEALTH entry (a distinct kind of request —
specific medical items, not general acopio) with the conflict spelled out
explicitly in `submitterNote` for admin verification before either address
gets treated as authoritative.

### New aid points (14)
- **Popayán's first blood-donation point** (Hospital Universitario San José,
  three rotating locations around Parque Caldas and Hotel San Martín, tied
  to a 5km charity run).
- **4 VET points**: Fundación CASA K (corroborated independently across
  three platforms), Jóvenes Animalistas Popayán, Pet and Pet in a
  previously-uncovered barrio (La Ximena), and a joint drive between two
  named veterinary clinics — several explicitly staging donations bound for
  animals in Cali rather than Popayán itself.
- **2 monetary channels**: a Nequi account anchored to a named Universidad
  del Cauca professor with funds routed to the Defensoría del Pueblo, and a
  30-year-old regional women's-rights organization (Ruta Pacífica de las
  Mujeres) with a specific address and named account holder.
- **5 acopio points**: the two university faculty points above, an official
  Alcaldía de Popayán point at Ciudad Moderna, a shopping-mall donatón, and
  a mobile "recorrido solidario" that explicitly named several comunas the
  brief asked about (La Esmeralda, Bello Horizonte, La Paz, and others).
- **1 HEALTH entry** (Casa de la Moneda address discrepancy, see above).
- **1 ALBERGUE entry**: a pre-existing elder-care home (Fundación Hogar para
  Ancianos San Vicente de Paúl) whose roof was damaged by the quake — not a
  shelter for displaced earthquake victims, which the notes make explicit,
  since no dedicated displaced-persons shelter was found for Popayán at all.

### New community embeds (16)
Mostly corroborating the aid points above from official and institutional
accounts (the hospital, the Alcaldía's Secretaría de Planeación, Universidad
del Cauca faculties). One exception: an Instagram post about the San Vicente
de Paúl elder-care home's damage that gives no donation channel of its own,
kept as human-interest context alongside the Facebook post that does.

### Checked, deliberately not seeded
- **BLOOD_DONATION beyond the Hospital San José drive, HEALTH brigades,
  ALBERGUE for displaced families, and missing-persons content** — all
  searched directly across every platform and came back genuinely empty.
  One high-engagement "body recovery in Popayán" post was caught by
  hovering its timestamp: dated February 2026, six months before this
  earthquake — a useful reminder to verify timestamps on viral posts before
  trusting them.
- **A GoFundMe ("Bottled Water for Popayán")** citing a "volcanic eruption"
  contaminating the water supply — factually inconsistent with the actual
  tectonic event, anonymous secondhand organizer, $150 of $4,500 raised.
  Rejected as matching the project's known scam pattern.
- **A missing-persons compilation post** that surfaced repeatedly in
  Popayán-adjacent searches — every named case in it turned out to be in
  Pereira or Cali, not Popayán, on inspection.
- A bowling-community Vaki campaign with a plausible Cauca connection (bolo
  is popular regionally) was found but excluded — its only capturable link
  was a fragment-only lightbox URL that wouldn't render as a real embed.

### Next steps (pass 20)
Move to the next city — Dosquebradas and San José del Palmar remain.

## Pass 21 — deep pass on Dosquebradas (2026-08-14)

Eighth city in the rotation. Dosquebradas sits directly next to Pereira in
the same metro area, so the user explicitly asked for extra care that
findings here are genuinely unique to Dosquebradas rather than repeats of
Pereira content just because someone from either city can reasonably seek
help in the other. Every agent was briefed to discount generic "Pereira y
Dosquebradas" mentions unless Dosquebradas got its own concrete detail
(address, contact, named institution), and every candidate was additionally
cross-checked at synthesis time against everything already seeded for
Pereira (passes 13-14).

That discipline caught real things: a "Centro Veterinario de Dosquebradas"
free-consultation post surfaced in search results but its actual caption
said "para perros y gatos afectados por el terremoto en Pereira" — Pereira,
not Dosquebradas — and was excluded despite matching the query. A widely
reposted Instagram caption claiming "Damnificados por el terremoto en
Dosquebradas" (Vaki "PENSANDO EN TODOS") turned out, on opening the actual
campaign page, to describe aid for Cali, Chocó, and Buenaventura only, with
zero Dosquebradas content — a viral copy-paste false positive, excluded.

### A genuine near-duplicate, not re-seeded
One Instagram find (a Nequi key from SINALTRAINAL/Revolución Obrera) turned
out to share the exact same street address as the already-known "Sede
sindicato de trabajadores La Rosa" acopio point from an earlier pass. Rather
than seed it under a different name — which would have created a real
duplicate location in the queue — this is logged here only: it adds a new
Nequi payment channel (3225387512) to that already-existing point, which an
admin can add manually when reviewing it, rather than as its own pending
entry.

### Richer than expected on shelters
Contrary to the brief's own expectation (calibrated toward Popayán-level
thinness), Dosquebradas turned out to have real, well-sourced ALBERGUE
content — four separate shelter situations, one of them (Fundación Cristiana
Rescatados Por Su Sangre, ~150 people) corroborated by a verified local news
outlet two days after the original post. Two of the four (Polideportivo del
Campestre and "Campestre B") may describe the same physical complex under
different names — flagged explicitly in both entries rather than guessed
either way.

### New aid points (16)
- **First blood-donation point** for Dosquebradas (ESE Hospital Santa
  Mónica, its own hospital — distinct from Pereira's Hospital San Jorge).
- **3 VET points**: a local veterinary clinic, a steel-fabrication business
  donating free pet ID tags, and a home-based dog shelter destroyed in the
  quake.
- **4 shelter situations** (see above).
- **6 monetary channels**: the Cámara de Comercio's own accounts; a Vaki
  campaign corroborated by Pulzo press coverage and found independently by
  two agents; a diaspora GoFundMe (Staten Island, NY) found independently by
  two agents; the strongest single find of this pass — a real roadside-
  assistance company (Asistimotos) whose 14-year Pereira headquarters was
  condemned, rebuilding specifically from its existing Dosquebradas branch;
  and one low-confidence individual collection flagged explicitly for manual
  verification before approval.
- **3 acopio points**, including Cáritas Pereira's food bank — its name
  references Pereira, but its actual operating site relocated to a church in
  Barrio Santa Isabel, Dosquebradas, after its original Pereira location
  (Las Aromas) was damaged. Worth noting as the opposite failure mode from
  the ones caught above: an org with "Pereira" in its name that is, in fact,
  now genuinely and physically operating in Dosquebradas.

### New community embeds (18)
Three missing-persons threads specific to Dosquebradas (one resolved — an
Argentine resident found alive after hours missing, reported by Infobae and
corroborated by three Argentine outlets), an official municipal curfew
decree, and fresh structural-damage reporting on two named residential
complexes (Portal del Parque's Torre 6, fully collapsed; Barrio La Graciela,
evacuated as a precaution).

### Checked, deliberately not seeded
- The SINALTRAINAL/La Rosa address duplicate (see above).
- The viral "PENSANDO EN TODOS" false-positive campaign (see above).
- A GoFundMe ("Relief for Families in Pereira and Dosquebradas") whose story
  text never gets more specific than "the Pereira quake" — excluded for
  failing the same-city-specificity bar the user asked for.
- A leftover Vaki campaign about a robbery at a Dosquebradas minimarket
  ("Rescatar el Minimercado Megahorro") — confirmed via its own page text to
  predate the earthquake entirely (a COVID-era fundraiser), unrelated
  despite matching the Barrio Frailes location.
- BLOOD_DONATION beyond the one hospital drive came back genuinely empty on
  every platform except Instagram; VET and new health-brigade content beyond
  what's listed came back empty on X, Facebook, and TikTok specifically.

### Next steps (pass 21)
One city remains: San José del Palmar, the earthquake's epicenter itself.

## Pass 22 — deep pass on San José del Palmar (2026-08-14)

Ninth and final city in the per-city deep-pass rotation: San José del
Palmar, the earthquake's literal epicenter. A tiny, extremely rural
municipality (~5,900 people, ALTA severity, not on the original red-alert
list) with zero confirmed deaths — the mayor has been quoted directly across
roughly ten news outlets confirming this — and zero aid infrastructure on
file going in; an earlier pass had already checked the allied aid-tracking
sites and confirmed a genuine, real gap rather than a data-collection miss.

### The shape of this town's aid story
Because San José del Palmar has no hospital, vet clinic, or shelter
infrastructure of its own, nearly every real find this pass turned up was
organized *from* other cities rather than locally — collection points in
Cali, Bogotá, Tuluá, Zarzal, Andalucía, and Cartago, all explicitly
earmarking donations for this specific town. That's a genuinely different
aid pattern than every other city in this rotation, and it held up under
scrutiny: several promising-looking leads (a Cali-based vet field station, a
Pereira pet-donation point, general Bogotá-wide "centros de acopio"
roundups) were checked and excluded specifically because they served the
broader Chocó/regional response without being earmarked for this
municipality by name — the bar every seeded point had to clear.

### The strongest cross-agent finding of any pass
A Vaki crowdfunding campaign ("para San José del Palmar, Chocó — Epicentro
del terremoto") was found *independently by all five agents* — the
strongest single-entity corroboration across all nine city passes run this
week. Organized by an identifiable individual with a documented prior
connection to the town (she'd visited three months before the quake),
verified on the Vaki platform, with 1,817 real named donors and independent
third-party vouching on X. It had already raised nearly 5x its stated goal
by the time this pass ran.

### New aid points (6)
- **The Vaki campaign** above (MONETARY_DONATION).
- **5 acopio points** run out of other cities, all explicitly naming San
  José del Palmar (and often specific corregimientos within it, like San
  Pedro de Ingará and La Molana) as a destination — including one Bogotá
  cultural center's collection drive independently found on three separate
  platforms, and a specific ask for a donated truck trip to reach the
  Consejo Comunitario Afrodescendiente of San Pedro de Ingará, a corregimiento
  an hour from the municipal seat.

### New community embeds (9)
The official municipal Alcaldía communiqué gives the fullest single picture
of ground conditions found for this town: 0 deaths, 2 injured, 2 missing
(at the time), 30% of rural housing partially collapsed, 14 landslides
cutting every road in. A follow-up local news report three days later
(elnorte_hoy) gives sharper detail — 441 damaged homes, 40 fully collapsed,
about 20 affected veredas — and confirms the Chocó governor's statement that
no missing-persons reports remained open by that point, resolving the
earlier communiqué's "2 desaparecidos" figure without touching the
project's own locked zero-death count.

### Checked, deliberately not seeded
- **A multi-town Valle del Cauca "brigade" collection network** (Tuluá,
  Andalucía, Zarzal, Cartago addresses) reappeared across three agents, but
  one researching agent flagged that the video's own caption alluded to an
  unresolved internal allegation about aid being "diverted," and a separate
  agent independently rejected the same source for lacking institutional
  backing after noticing the organizer's other content was unrelated
  political satire. Repeated appearance across searches here reflected the
  same viral post being found multiple times, not independent corroboration
  — excluded rather than amplified given the live credibility concern.
- **A municipal "albergue canino" (dog shelter)** referenced on the
  Alcaldía's own Instagram — one agent read it as a pre-existing, ongoing
  municipal infrastructure project rather than earthquake-response
  construction, and no agent could pin down a working post permalink for
  it. Excluded on the more skeptical read.
- **BLOOD_DONATION, ALBERGUE, and HEALTH (a dedicated field brigade)** all
  came back genuinely, thoroughly empty — consistent with a town this small
  and remote having no local medical infrastructure of its own to run any
  of these, and with outside aid still reaching it mostly by truck and
  crowdfunding rather than field medical deployment at research time.
- Extensive international news coverage of the epicenter itself exists (BBC,
  UNICEF, N+ Univision, Noticias Caracol, and more) confirming "ground zero"
  is a real journalism draw independent of any aid channel — but most of it
  is news-site content rather than a specific social-platform post with a
  capturable permalink, so it's referenced in agent notes rather than seeded
  as community embeds.

## The per-city rotation completed after pass 22

Passes 13-22 covered all nine tracked cities once each: Pereira (13-14),
Cali (15), Manizales (16), Armenia (17), Quibdó (18), Buenaventura (19),
Popayán (20), Dosquebradas (21), and San José del Palmar (22) — 22 research
passes total since this project's stage-2 launch, spanning X, Instagram,
Facebook, TikTok, and GoFundMe/Vaki crowdfunding for every city, plus the
original allied-site and dataset research that started it. Pass 23 begins a
second, follow-up round across the same nine cities.

## Pass 23 — follow-up round begins: Pereira (2026-08-14)

The user asked to expand on all nine cities again, since new content is
likely to have been posted since the original passes — a genuinely
different research mode from the first pass on each city: instead of
exhaustive first-contact coverage, this is a **follow-up pass** explicitly
scoped to catch what's changed. Every agent was told the ground is already
thoroughly covered (citing wiki passes 13-14 for Pereira specifically) and
to focus on recency, status changes, phase shifts, and evolving scam
reports rather than re-running first-week searches.

### A significant casualty-figure update
During the President's on-site tour of Pereira today, updated national and
Pereira-specific figures surfaced that meaningfully exceed anything on
file — national deaths at 285-287 (vs. 265 as of Aug 13), and, notably, the
**first-ever Pereira city-level toll figures** captured in this project
(previously only Risaralda department-level existed): 94-95 dead, ~259
injured, 260-270 missing, 35,200+ damaged homes, 66 total-collapse
buildings, 165 affected schools. Two same-day sources gave slightly
different readings for several of these — logged as separate dated records
per the project's standing discipline (never overwrite, log the volatility)
rather than merged into one number. See `seed-pass23a-toll-update-aug14.ts`.

### The response has entered a reconstruction phase
Multiple independent signals converge on this: debris removal is
intensifying and the city center is closed specifically to speed it up;
merchants are organizing their own economic-reactivation plan; a
construction-materials company donated cement directly to the Alcaldía;
Rotary Club Pereira Perla del Otún proposed a formal international
reconstruction project; and — most concretely — a new wave of crowdfunding
campaigns explicitly frame themselves around rebuilding rather than
emergency relief. The standout is a Vaki campaign ("Convite por Pereira")
that distributes rent, repair, grocery, and pet-care *vouchers* redeemable
specifically at local Pereira businesses rather than generic cash, discloses
its platform fees, and frames itself around the city's own 1945 "convite"
that built the Matecaña airport — a level of specificity and local grounding
well above the norm.

### Scams are evolving too
This pass surfaced multiple fresh scam-adjacent threads that didn't exist
in the first-week research: a national Policía Nacional alert about fake
donation schemes; singer Jhonny Rivera (who converted his own hotel into a
shelter) now publicly denouncing impersonation scams using his name; a
phishing site spoofing the real government subsidy program Prosperidad
Social; and a story (corroborated by a verified TV outlet) about a false
"people trapped" alert that was allegedly used to redirect rescue resources
toward recovering a business's cash register. None of these existed to
catch in the original passes — they're a direct product of the disaster
response continuing for multiple days.

### New aid points (7)
A free psychological-support line, a one-day pet-food donation event, an
acopio point at Universidad Libre's Belmonte campus, a national kit-delivery
campaign explicitly covering Pereira, and three Vaki campaigns of varying
strength — the strongest being "Convite por Pereira" above, plus a
family-reconstruction fund with real traction, and a UTP student fund
flagged at low confidence (verified badge, but zero donations after 4 days
and templated donor-trust language).

### New community embeds (17)
Beyond the reconstruction and scam threads above: a status update that
Motel Ámasiis (which had been sheltering rescue teams and misión médica) is
scaling back to responder-only use amid new mobility restrictions; an
explicit correction from Expofuturo's coordinators pushing back on rumors
the acopio point already has "enough donations"; and confirmation that 67
schools remain under structural evaluation before classes can resume.

### Checked, deliberately not seeded
Several individual/templated fundraisers were excluded on the same
institutional-backing bar as always (an influencer collecting entrepreneur
pledges via DM, a UTP-adjacent Vaki campaign courting foreign credit cards
with zero traction after days, anonymous QR-code donation posts). One
widely-repeated but unconfirmed allegation — that Homecenter is reselling
donated humanitarian aid — is noted in agent notes as a rumor worth
monitoring, not reported as fact, since no outlet or official body has
confirmed it.

### Next steps (pass 23)
Continue the follow-up round through the remaining eight cities: Cali,
Manizales, Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas, and San
José del Palmar.

## Pass 24 — follow-up round: Cali (2026-08-14)

Cali's original deep pass (15) had found that the Alcaldía officially
announced only two shelters. This follow-up meaningfully updates that: an
official cali.gov.co article confirms a third, **Canchas Panamericanas /
Unidad Deportiva Panamericana** (~60 families, 129 people), independently
corroborated by El País and Caracol Radio. On top of that, a video from
Cali's own Secretaria de Bienestar Social (Nigeria Rentería Lozano) lists
three more active shelter points not previously on file — a church, a
migrant-inclusive transit home, and a point in Barrio Capri — bringing the
known shelter count for Cali from 2 to potentially 6.

### The strongest cross-agent finding of the follow-up round so far
A Vaki campaign for **Casa Mangle**, a pre-existing Cali cultural venue
(artists, musicians, small vendors) whose roof was damaged, was found
independently by all 5 agents — matching the strength of the Vaki finding
from San José del Palmar's original deep pass (pass 22). Its Facebook and
Instagram presence predates the earthquake by weeks, ruling out a
fly-by-night account.

### Reconstruction phase, in Cali's own words
Mayor Alejandro Eder stated directly (corroborated across at least three
independent outlets) that Cali's reconstruction will take at least two
years and the humanitarian crisis at least three more months — an explicit,
on-record pivot from emergency to recovery. Concretely: schools confirmed to
reopen August 24 (99 of 338 affected sites inspected, 63 cleared), a new
citywide "Donatón" activated, and blood banks (HUV, Imbanaco, Hemolife)
reporting full reserves — donors can now only book future appointments
rather than walk in.

### A genuine distribution-bottleneck complaint
A well-engaged Instagram post (2.5K likes, 400+ comments, tagging the
Alcaldía directly) alleges the Coliseo del Pueblo collection center is
sitting on stockpiled donations — medicine, diapers, hygiene kits, food —
that aren't reaching the small foundations and juntas de acción comunal that
need them. This isn't a scam; it's a coordination/logistics problem, logged
as a NEED post rather than treated as resolved or dismissed.

### A conflicting casualty figure, left undocumented
Three different Cali-specific death counts surfaced the same day: 74
(mayor Eder, described as CTI-certified), 96 (already on file from Cali's
own government site, Aug 12), and 111 (CW+ Noticias, "today 5pm" balance).
Unlike Pereira's pass-23 casualty update, these three don't clearly resolve
into a single authoritative same-day reading, so — rather than guess which
is most current or merge them — none were added as new `TollRecord` entries
this pass. All three are preserved in community-embed notes for a future
pass to resolve with clearer sourcing.

### New aid points (8)
The four new shelter locations above; two acopio efforts tied to relief
logistics (an architect-led drive collecting fabric and cardboard tubes to
build 100 privacy modules inside the already-known Coliseo de Hockey
shelter, and a Suzuki-parts dealer's collection point routing through a
parish to the Banco de Alimentos); a departmental-culture-office-backed
alternate acopio point; and the Casa Mangle Vaki campaign.

### New community embeds (17)
Extensive official-channel coverage of the reconstruction pivot (Concejo de
Cali backing terrain-stabilization work, a police scam alert, a search
extension for missing persons, international rescue brigades still active),
plus the Coliseo del Pueblo distribution complaint and a fresh scam report
about a seller mocking earthquake victims after being confronted.

### Checked, deliberately not seeded
A personal Nequi collection for 26+ rural homes in the corregimiento de La
Paz was checked and excluded on the same individual/no-institutional-backing
basis as always, despite specific, checkable detail (named local builders,
a real home count) — logged as a lead worth independent verification, not a
vetted channel. Several near-identical individual Vaki/GoFundMe campaigns
matching the pattern already exhaustively catalogued in pass 15 were not
re-added.

### Next steps (pass 24)
Continue the follow-up round: Manizales, Armenia, Quibdó, Buenaventura,
Popayán, Dosquebradas, and San José del Palmar remain.

## Pass 25 — follow-up round: Manizales (2026-08-14)

### The Cámara de Comercio funds are confirmed active — and expanding
Found independently by 4 of 5 agents: the two funds from pass 16 (Fondo
Solidario Manizales and Fondo Solidario por los Empresarios de Caldas) are
both still open, and the Cámara's own website (dated the same day) describes
a genuine expansion into a full economic-recovery program — a free
"Oficina Empresarial" offering legal, financial, accounting, and
psychological advisory to damaged businesses, a formal business-damage
census, and a same-day meeting with Colombia's Minister of Commerce
requesting Bancoldex credit lines, tax relief, and employment subsidies.
Logged as a distinct new entry (an update/expansion) rather than duplicating
the original fund names.

### A confirmed scam alert
ICBF's director publicly clarified the institute does not solicit money for
this emergency, warning that scammers are impersonating ICBF's name and logo
to collect fraudulent donations — corroborated independently by El Tiempo
and Portafolio.co. The real official channel for Caldas is the Oficina de
la Primera Dama.

### The coffee economy, confirmed active
The Alcaldía de Manizales and the Comité Municipal de Cafeteros opened a
formal route for coffee farmers to report quake damage to their fincas,
published the same day as this pass. The regional coffee federation
(Comité de Cafeteros de Caldas) has also begun municipality-by-municipality
outreach visits, starting in Neira.

### New aid points (9)
Three new institutional collection points (a foundation partnered with the
Alcaldía for rural redistribution, a church running a spiritual-and-material
relief campaign, a toy/baby-supplies drive), a genuinely new mental-health
service activated specifically for quake survivors (closing the mental-
health-follow-up gap the brief asked about), a blood-donation appeal tied to
the regional blood bank, the Cámara de Comercio update above, a newly-found
civic organization (Club Rotario Manizales) with full NIT/bank transparency,
and two diaspora GoFundMe campaigns, neither closed or fully funded.

### New community embeds (13)
A shelter-conditions status check worth noting specifically: a local news
outlet made an unannounced visit to the Coliseo de Manizales shelter after
receiving complaints about food and blankets, and confirmed conditions were
adequate (portion sizes had simply been adjusted after an initial
over-provision). Also: a private steel company pledging 100% of the
material needed to rebuild the earthquake-damaged Cathedral Basilica tower,
a new city-hall economic-reactivation office for downtown merchants, and a
national economic-emergency declaration plus a $100 billion COP
reconstruction pledge from the Santo Domingo family foundation.

A Manizales-specific casualty figure (5 dead, 112 injured, 142 sheltered,
zero missing — cited during the president's visit, corroborated by two
outlets) sits close to but not identical with the 6-dead figure already on
file; both are preserved rather than merged, consistent with this
project's volatility-logging discipline, though no new formal `TollRecord`
was added this pass to keep scope manageable.

### Checked, deliberately not seeded
A viral, high-engagement allegation that Homecenter is reselling donated
aid was flagged as an unverified crowd rumor, not a confirmed institutional
report — noted for awareness, not reported as fact. A named congressperson
collecting donations via a personal bank account (real controversy, covered
by Revista Semana) was excluded for lacking a clear organization or address
to act on either as a legitimate channel or a confirmed scam. Several stale
first-week items resurfaced by keyword match (a "falsos promotores" scam
graphic actually dated the day of the earthquake, an already-known shelter
resurfacing with no status change) were caught and excluded on close
timestamp inspection.

### Next steps (pass 25)
Continue the follow-up round: Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, and San José del Palmar remain.

## Pass 26 — follow-up round: Armenia (2026-08-14)

### Fundación Covida: from "real and damaged" to "funded and rebuilding"
All 5 agents independently confirmed Fundación Covida's Vaki campaign is
still active — not closed, not fully funded (it runs through August 2027).
The strongest evidence: the organizer posted a dated "Día 4" video update
the same day this pass ran, showing actual demolition work underway on the
collapsed pool wall, with $16,684 raised from 445 named donors. This moves
the finding from pass 17 ("the campaign is real") to something stronger:
funds are visibly, transparently being spent.

### A genuinely new shelter
**Coliseo del Sur** in Armenia — corroborated independently by three
separate TikTok accounts over a 2-day window, all describing the same venue
with consistent eligibility criteria (verified housing loss) and an active
request for mattresses. Not on file from the original pass.

### A new animal-welfare crisis, with a payment-key correction worth flagging
**Fundación Oki Doki**, sheltering 310 animals, has a roof close to
collapse. The shopping mall Unicentro Armenia is hosting a donation point
at its own information desk — strong independent corroboration. Notably,
commenters flagged that an earlier-circulated Nequi key for the foundation
"no sirve" (doesn't work); a corrected official key was posted afterward.
Logged with an explicit caution for donors to verify payment details
directly with the foundation before sending money, exactly the kind of
in-flight correction this project's discipline is built to catch.

### A cluster of new institutional acopio points
The Diócesis de Armenia (two physical points plus a bank account), the
teachers' union SUTEQ (running through Aug 21), and the Gobernación del
Quindío's own center at the Centro de Convenciones are the strongest new
finds; four smaller business-run points round out the list.

### The response has entered a reconstruction phase here too
Government rental subsidies for families who lost their homes entirely,
department-wide school structural inspections (running Aug 12-15, after a
preliminary diagnosis found ~70% of Quindío's educational institutions with
damage), and a Cámara de Comercio survey of 1,600+ merchants finding 84%
reported earthquake damage — all dated within the last 1-2 days, all
distinct from the emergency-relief content the original pass found.

### New aid points (11)
The shelter and animal-welfare finds above, plus the Diócesis's two acopio
points and monetary channel, SUTEQ, the departmental government's center,
and four smaller business/individual acopio points, all with concrete
addresses.

### New community embeds (14)
Beyond the reconstruction-phase and Covida updates above: a resident's
complaint that a damaged residential complex (Las Vegas) is still without
help and that pet-owning residents are being denied rental housing; a
resilience feature explicitly invoking Armenia's 1999 earthquake recovery;
and infrastructure-normalization signals (Claro reporting 86% of cell towers
restored across the five hardest-hit departments, Chocó formally closing
search-and-rescue operations at the epicenter).

### Checked, deliberately not seeded
A GoFundMe titled for Armenia turned out, on inspection, to be for a home in
Calarcá — excluded on the same geographic-precision basis used throughout
this project. A Vaki campaign ("Renacer-Armenia") with zero donors and a
fully anonymous organizer was excluded despite resurfacing as "very recent."
No scam or broken-donation-link reports specific to this earthquake were
found for Armenia this pass — the only scam-adjacent post located was a
stale, unrelated Pereira pet-adoption fraud warning from months earlier.

### Next steps (pass 26)
Continue the follow-up round: Quibdó, Buenaventura, Popayán, Dosquebradas,
and San José del Palmar remain.

## Pass 27 — follow-up round: Quibdó (2026-08-14)

### The hospital's blood-bank crisis got worse, not better
The already-broken refrigeration unit at Hospital San Francisco de Asís
(pass 18) has not been repaired. Worse: a new 4.2-magnitude aftershock
forced the hospital's **total evacuation**, confirmed independently by
El Colombiano (TikTok) and by CAMBIO visiting the site the same day — while
it kept treating patients from alternate facilities. The Gobernación del
Chocó published a WhatsApp line specifically for anyone who can source or
donate a replacement blood-bank fridge. Two informal citizen collections for
the same fridge were also found (one on Nequi/Bre-B, one on Nu Bank
targeting a specific Haier model); only the stronger, cross-platform one was
seeded, with the parallel effort noted in its `submitterNote` so donors
aren't split across two unverified channels for one need.

### A new official international donation channel
The Alcaldía de Quibdó's own Facebook page published full USD/EUR/GBP
SWIFT/routing details for a channel benefiting Corporación de la Fe
(Diócesis de Quibdó) — distinct from the previously-found ASINCH channel,
and higher-confidence because it's published by the city government itself.

### Diaspora and celebrity channels, both corroborated
GoFundMe's "El mundo mira al Chocó" (Fundación Tierra Grata, a real
established NGO with a US-based diaspora co-organizer) is nearly fully
funded: $98,661 of a $100,000 goal from 1,759 donors. Separately, national
team footballer Jhon Arias (a Quibdó native) is running an active,
escalating relief effort — three flights and a 30-ton supply truck so far —
funded through Bancolombia and a Brazil PIX account, cross-confirmed by six
independent mainstream outlets citing the same account number.

### Reconstruction-phase and equity signals
The president announced a "gerente especial" and a "Plan Marshall" for
Chocó, delivered from Quibdó; the Vice President gave an official aid
balance from the same visit. A first education-damage figure emerged for
the department: 38 schools damaged, 20,000+ students still out of class. El
Espectador named specific Quibdó barrios (El Futuro, Flores de Buenaños,
Villa La Victoria, Obrero La Brisa) still without help, residents in debt
with no reconstruction pathway — the aid-equity gap from the original pass
persists and sharpens. A new scam-adjacent story surfaced too: Caracol
Radio's #LaLuciérnaga questioned whether a sitting congressman could
legally solicit Chocó donations into a personal/friend's account —
allegation, not proven, but a real accountability story worth tracking.

### New aid points (6)
The hospital evacuation status update, the merged blood-fridge collection,
the Alcaldía's international channel, Fundación Escuela Taller de Quibdó
(housing reconstruction), the GoFundMe, and the Jhon Arias channel.

### New community embeds (12)
Beyond the items above: a Villa Avelina report (38 homes collapsed, asking
for construction materials rather than emergency aid); a Zona Minera house
that survived the quake but collapsed two days later after heavy rain,
illustrating ongoing structural risk; and continued confirmation of hospital
overcrowding (245% ER capacity, all 9 ICU beds full, patients transferred to
Antioquia).

### Checked, still unresolved
Fundación Thaar Wajaphasim — re-checked by all 5 agents, still no findable
donation channel, unchanged from pass 18. Cruz Roja's alternate
blood-donation points for Quibdó — still not confirmed to exist, "being
evaluated" status unchanged. No updated official Quibdó-specific
casualty/damage figures were found this pass (9 confirmed deaths,
search-and-rescue closed, holds from the original pass), so no new
`TollRecord` entries were needed here, unlike Pereira's pass 23a. An
Instagram lead about Alcaldía/Diócesis construction-material bonds was
dropped for lacking a real post permalink (search-results URL only); an
account amplifying CMGRD registration info was dropped after the
researching agent itself flagged the content as likely AI-generated.

### Next steps (pass 27)
Continue the follow-up round: Buenaventura, Popayán, Dosquebradas, and San
José del Palmar remain.

## Pass 28 — follow-up round: Buenaventura (2026-08-15)

### The strongest find: a cross-platform accountability story
Former president Gustavo Petro (X) and an independent TikTok account both
surfaced the same story within hours of each other: the hospital ship
*Benkos Biohó*, built at a cost of over 82 billion pesos specifically to
serve Pacific-coast communities, was never deployed to earthquake-hit
Buenaventura because health-staff contracts aboard it weren't renewed
during the presidential transition. Picked up internationally by The
Economist's piece on "two very different Colombias." This is the sharpest
aid-equity/accountability story found for Buenaventura so far, and it
corroborates independently across two platforms.

### Casualty figures are updating, but conflict
The Distrito Especial de Buenaventura's own 14 August balance (26 dead, 433
injured, 10,148 families/homes affected) doesn't match a Red+ Noticias
report from roughly two days earlier citing 16 dead, 258 injured, 7,150+
homes affected. Both readings are logged as separate community embeds
rather than merged or resolved — the same discipline applied to Cali (pass
24) and Manizales (pass 25) when same-window figures don't clearly settle.
No new `TollRecord` entries were added this pass.

### A fresh, corroborated national scam alert
Colombia's Dijín (police investigative unit) warned of scammers inventing a
fake "Oficina Desarrolladora de Gobierno" and a fictitious official
("Ricardo Suárez") to funnel fake solidarity-campaign donations into
personal accounts — corroborated within hours by Caracol Radio, El Tiempo,
and CAMBIO Colombia. Applies nationally, but directly relevant to vetting
any Buenaventura-labeled donation appeal.

### The fishing economy gets its first dedicated relief call
Fedepazcifico (an artisanal fishers' federation with no verifiable account
of its own) had its appeal relayed by Centro para la Justicia Marina, an
established marine-rights NGO — corroborated independently across X,
Instagram, and Facebook, all within the last day. This is the first
fishing-economy-specific recovery campaign found for Buenaventura,
answering the port/fishing angle this pass was scoped to check.

### Port-economy recovery signals
Coffee exports have resumed gradual operation through the Port of
Buenaventura (El Colombiano), while shipping line CMA CGM reports recovery
as "gradual but still complex" — container returns and land transport
remain delayed (Mundo Marítimo, dated the same day). A personal account
with photos claims the TCBUEN container terminal was still non-operational
days after the quake due to continued aftershocks.

### Other reconstruction and equity signals
The Interior Minister, speaking from Buenaventura, publicly warned aid
"cannot be used for political purposes" and urged residents to report
irregularities — corroborated by three outlets in the same news cycle. A
Housing Ministry materials-plus-community-labor reconstruction scheme was
announced (cement companies donate materials, affected families provide
labor). Noticias Caracol quantified an education gap (2,800+ students
affected). El Colombiano ran an equity story naming Indigenous and
Afro-Colombian Pacific communities, including Buenaventura, as hardest to
reach — extending the same pattern already documented for Chocó. A teleSUR
report described youths in the Barrio El Campín organizing their own
emergency response amid alleged local-government neglect.

### New aid points (8)
The fishing-economy relief call; a Diócesis de Buenaventura + Cámara de
Comercio/Confecámaras humanitarian corridor; a PCN/ABEDUA acopio point in
Barrio Santa Rosa (Afro-Colombian community org, confirmed still active); a
Comisión Intereclesial de Justicia y Paz fund for rural Chocó and
Buenaventura reconstruction (schools, childcare centers — the strongest
equity-focused aid point this pass); a Bogotá-to-Buenaventura donation truck
with named local distribution partners; FOCUSA (flagged lower-confidence —
small account, AI-flagged flyer image); and two active Vaki campaigns, one
larger and institutionally co-promoted (líderes/lideresas focus, $8,389
from 168 donors) and one smaller but genuinely live ($644 from 15 donors).

### New community embeds (15)
The items above, plus the delayed house-collapse report and the updated
official/conflicting casualty figures.

### Checked, deliberately not seeded
A cluster of small, individually-organized English-language GoFundMe
campaigns (typical first-week diaspora pattern, no institutional backing)
was reviewed and excluded. A Facebook post citing "6,125 fallecidos" turned
out to be a mismatched, unrelated Venezuela story. A theft-of-humanitarian-
aid post that looked Buenaventura-relevant turned out, per its own
hashtags, to be about Pereira. Two generic anti-fraud PSA posts with no
named scammer or campaign were excluded as too vague (the Dijín alert above
was used instead, since it names specifics). No new shelter closures, no
back-to-school announcement, and no distinct US-diaspora-organized
Afro-Colombian crowdfunding campaign (beyond the two Vaki campaigns
already seeded) were found this pass.

### Next steps (pass 28)
Continue the follow-up round: Popayán, Dosquebradas, and San José del
Palmar remain.

## Pass 29 — follow-up round: Popayán (2026-08-15)

### The standout find: heritage damage, officially named
MinCultura published its first official cultural-heritage damage balance
(via Caracol Radio): 40 nationally-listed Bienes de Interés Cultural
affected across 7 departments, 12 of 15 historic centers in the quake zone
damaged — explicitly naming "el sector antiguo de Popayán" among them, plus
39 damaged religious buildings nationwide. The Culture Minister announced a
"Red de Profesionales" and an upcoming resolution to speed up heritage
repairs. This is exactly the heritage-restoration "new phase" signal this
pass was scoped to look for in a city whose colonial center is nationally
significant — even though it arrived as a news article rather than a
social post, it was strong enough to surface directly (logged under
Caracol Radio's post URL).

### Popayán helping other cities, echoing its own 1983 history
Two independent, concrete efforts: the city's own Consejo Municipal de
Juventud recruited volunteer drivers to carry aid to Chocó (fuel and
lodging covered), and a separate grassroots youth collection reported by
Noticias Cauca gathered over 7 tonnes of supplies bound for Chocó. An X
opinion column made the historical throughline explicit: Popayán's 1983
earthquake is credited with prompting Colombia's 1984 seismic building code
(Ley 400), a comparison several national outlets are now drawing again.

### Casualty figure update, and a hospital-adjacent human-interest thread
Proclama del Pacífico relayed Popayán's own official balance: material
damage but zero deaths or injuries registered in the city itself, distinct
from the much higher Cauca department-wide toll. Separately, the Hogar San
Vicente de Paúl elderly-care home's story continued past its earlier SOS:
Army engineers helped clear over a ton of debris from its collapsed
bell-tower chapel, which has since reopened for its 60+ residents, though a
formal structural assessment and full-repair funding are still pending.

### New aid points (3)
The Gobernación del Cauca's "final stage" Casa de la Moneda medical-supply
drive; a fresh acopio point opened jointly by the Junta Permanente Pro
Semana Santa (the organization behind Popayán's UNESCO-listed Holy Week
processions) and the archdiocesan food bank — a strong heritage-institution
angle; and a separate Arquidiócesis de Popayán food bank run with the
regional LeaPaz initiative, with a bank account for those who can't donate
in person.

### New community embeds (10)
The items above, plus the Archdiocese's solidarity message to the
earthquake-affected parish of El Tambo.

### Checked, deliberately not seeded
No Popayán-specific scam or broken-donation-link reports were found on any
platform despite dedicated searching. No shelter closures or back-to-school
content turned up. No Popayán-specific GoFundMe or Vaki campaign exists at
all (the one Vaki campaign that surfaced targets Cali/Medellín/Chocó/
Pereira/Manizales, not Popayán, and has raised effectively nothing). A
Facebook post that looked like a fresh Archdiocese update turned out, on
inspection, to be about a new bishop's arrival in Tierradentro, unrelated
to earthquake relief.

### Next steps (pass 29)
Continue the follow-up round: Dosquebradas and San José del Palmar remain.
Dosquebradas needs extra care per the user's explicit instruction: cross-
check every candidate against everything already seeded for Pereira before
filing it, since the two cities are close enough that residents of one
routinely seek help in the other.

## Pass 30 — follow-up round: Dosquebradas, with explicit Pereira dedup (2026-08-15)

Per the user's instruction, every one of this pass's five research agents
was given the full list of all 62 already-seeded Pereira aid points and
required to state explicitly, for every candidate, whether it overlapped
with something already on file for Pereira — rather than silently filing a
shared point under only one city.

### The cross-border pattern is real, and now documented
Two aid points explicitly serve both cities in their own words: Colegio
María Auxiliadora (physically in Dosquebradas, but its own post says the
service is "para las personas que viven en Pereira o Dosquebradas") and
Fundación Porque Juntos Somos Más (an acopio point in Dosquebradas serving
"los albergues de Pereira y Dosquebradas" jointly). Both are seeded once,
under Dosquebradas (where their physical point sits), with the cross-city
service explicitly called out in `submitterNote` so a reviewer can decide
whether to also surface them under Pereira rather than have that decision
made silently. A third candidate — a Pereira-branded page ("Pereira
Denuncia") collecting Nequi donations for a Dosquebradas drop-off address —
was checked but not seeded: single personal Nequi account, AI-flagged
image, no institutional backing, the same profile this project has
excluded throughout. A GoFundMe explicitly for "mi gente en Pereira y
Dosquebradas" was similarly checked and excluded for being a small,
anonymous, unverifiable individual appeal.

### A stale aid point caught in the act
A blood-donation drive (Hemocentro del Otún, with a paired collection point
at Hospital Santa Mónica in Dosquebradas) is only 2 days old, but its own
comment thread — 1 day old — reports the Dosquebradas point may no longer
be accepting donations ("el centro está colapsado"). Logged as a caution
rather than a clean aid point, exactly the kind of drift this project's
discipline exists to catch.

### The response has moved into a new phase here too
An official 90%-of-rural-zone humanitarian aid delivery milestone (with
residents of specific sectors — El Cofre, Los Pinos, Los Guamos, Comuneros
— pushing back in the comments that their areas haven't been reached, an
equity nuance worth keeping); a formal DIGER damage-report survey; a
controlled demolition of a compromised 4-story building in the Santa Mónica
sector; a shelter network expanding from 3 to 4 sites (900 → 1,050+
capacity); and continued curfew/día-sin-carro restrictions extended through
August 17.

### Casualty and equity signals
Dosquebradas' own official balance: ~2,000 families affected, one student
death, three destroyed school sites. A joint Ministry of Education
statement named that Dosquebradas victim (Fabio Vásquez Botero school)
alongside a Pereira student, a UTP student, and two Cali university
students in a single release — genuine cross-city overlap in the official
messaging itself, not something this project introduced. Separately, an
inter-municipal solidarity effort emerged: Valledupar and Ibagué joined a
Fedemunicipios call to fundraise for Dosquebradas specifically at a public
fashion event. A resident's damnificados-registration complaint (the
online form crashes on evidence upload, tagging both the Alcaldía and
UNGRD) suggests a systemic process issue, not a one-off.

### New aid points (8)
The Cámara de Comercio de Dosquebradas's own acopio point; a CAM Plaza
collection point tied to the Secretaría de Educación's response; two
shelter updates (Campestre B's confirmed headcount, and a fourth shelter
being prepared in La Graciela); the two cross-city points described above;
a school reconstruction fund (Instituto Pedagógico Horizontes — flagged
with a payment-transfer caution reported by a commenter); and a live,
specific GoFundMe (David Londono) funding a cousin's damaged Dosquebradas
apartment and an aunt's collapsed-roof coffee farm in Marsella.

### New community embeds (13)
The items above, plus a Portal del Parque structural-collapse update
(Torre 6 total collapse, Towers 3-5 damaged, full evacuation), an unverified
resident-rights allegation (a private company attempting unauthorized
demolition in La Graciela/Miraflores, flagged for human review rather than
treated as confirmed), a missing-person appeal (flagged as
Instagram-labeled "AI content," included with an explicit caution), and a
human-interest note about a well-known singer collecting informal donations
at her father's house in Dosquebradas.

### Checked, deliberately not seeded
A national reconstruction fund ("Fondo Milagro," announced by the national
government) applies to every affected city equally and was deliberately
excluded as not Dosquebradas-specific, consistent with how this project has
handled other national-only stories. No Dosquebradas-specific scam alert
was found and confirmed this pass.

### Next steps (pass 30)
San José del Palmar remains — the final city in the follow-up round.

## Pass 31 — follow-up round closes: San José del Palmar (2026-08-15)

The epicenter town, and the final city in the second-round follow-up
sweep. As expected for a small (population ~5,900), remote, thinly-covered
municipality, this pass found no new physical aid points inside the town
itself — but it captured something more important: the town's transition
out of acute post-quake isolation.

### From cut off to reconnected
The single access road into San José del Palmar, fully blocked by
landslides since August 10, reopened to one-lane traffic on August 13 per
Colombia's Transport Ministry — confirmed by the ministry's own account and
independently by press quoting Transport Minister Elsa Noguera. UNICEF
España added an important nuance the same window: over 45 separate
landslides still isolate many surrounding rural communities even with the
main corridor passable again. Noticias Caracol confirmed the first
organized aid shipments began arriving in the town around the same time —
days later than larger cities, consistent with its remote status. The
Colombian Air Force's own site describes an active air bridge (Ejército
Nacional delivered 12 tons of aid by air; Chocó received its first
air-lifted medical delivery), and one unverified but plausible report
described a specialized neonatal air ambulance evacuating a high-risk
pregnant woman.

### First-ever town-level toll figures for the epicenter
A Burbuja Política article (Aug 13) citing the Chocó Governor and the San
José del Palmar Mayor by name gave the first granular, town-specific
damage figures on file: ~400 homes affected, at least 20 structures
collapsed, and — notably — zero confirmed deaths in the urban zone as of
that date, with rural areas still being verified (not the same as zero
deaths municipality-wide). Logged as three new `TollRecord` entries, the
first ever for this municipio specifically (previously only Chocó
department-level figures existed). National UNGRD figures continued
climbing in parallel: 288 dead, 202 missing (down sharply from 379 as
rescue teams reach previously cut-off areas), 145,601 people affected —
consistently naming San José del Palmar as the epicenter.

### Grassroots response amid "fragmented" state aid
A teleSUR feature ("el pueblo salva al pueblo") reported Chocó communities
describing government aid as arriving fragmented, prompting the Proceso de
Comunidades Negras to open an independent Bogotá collection point for the
region and Bogotá's mayor to organize his own direct aid route to Chocó.
The same piece noted the national government limited accepted
international rescue assistance to only four countries, drawing criticism.
Chocó-specific figures distinct from the national count: 29 municipios
affected, 43,000+ people affected, 14 confirmed dead in the department.

### Two scam-adjacent cautions
A local Cartago-area broadcast warned residents that scammers are
impersonating ICBF (the national child-welfare institute) to solicit
donation money. Separately, an Instagram donation appeal for "ASOPERCHO"
(a real association of Chocó's municipal personerías) was Instagram-flagged
as AI content, with a commenter reporting a suspicious request for the
account holder's personal ID to "verify" a transfer — logged as a caution
rather than a vetted channel.

### New aid points (2)
A newly-created Vaki campaign for the town's reconstruction (flagged for a
data conflict — one agent saw $46,464 from 1,827 donors, two others saw
zero donations on the same page, most likely a browser-session caching
artifact rather than two different campaigns — verify current totals
before citing a figure); and the PCN's Bogotá collection point described
above, seeded here because it explicitly channels aid toward Chocó/the
epicenter even though its physical point isn't inside the town.

### New community embeds (10)
The items above, plus national media (Infobae Colombia, and journalist
María Jimena Duzán's "A Fondo" interview with a local survivor) shifting
from raw disaster footage toward deeper feature coverage of the town
itself — a sign the story has moved past the immediate-crisis phase in the
national conversation, even where the town's own recovery is still early.

### Checked, deliberately not seeded
Several GoFundMe/Vaki campaigns naming San José del Palmar only as
epicenter context (not town-specific) were excluded as out of scope. A
private residential address posted as an informal donation drop-off was
excluded on privacy/safety grounds, not just unverifiability. Chocó-wide
school-closure figures (20,000+ students, 38 schools) were noted but not
seeded here since no San José del Palmar-specific school status was found
— that gap itself suggests the reconstruction/back-to-school phase hasn't
reached this town yet.

### This closes the second follow-up round across all nine cities
Pereira, Cali, Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, and San José del Palmar have now each had two full
multi-platform research passes — the original per-city deep pass (13-22)
and this freshness-scoped follow-up round (23-31), 31 research passes
total. The follow-up round's throughline: the response has broadly entered
a reconstruction/new-phase period (shelter-network expansions, heritage
and school damage assessments, national reconstruction funds), while
casualty figures keep updating unevenly city to city, aid-equity and
scam-caution stories have sharpened rather than faded, and — per the
user's explicit instruction — the Pereira/Dosquebradas overlap is now
documented rather than silently absorbed into one city's list.

## Pass 32 — third round begins: Pereira (2026-08-15)

Started a third pass across the nine cities, scoped tightly to only the
last ~24 hours since each city's follow-up pass, on the expectation that
yield would be thin this soon after pass 23-31. Pereira, run first, proved
that expectation partly wrong — this narrow window still turned up a
scam directly hijacking an already-seeded aid point.

### A scam confirmed against a real, previously-verified aid point
Singer Jhonny Rivera — whose Hotel La Rivera is already seeded here as a
shelter/collection point that had raised over 140 million pesos — publicly
denounced that scammers copied his image and swapped the QR code on his
donation account to divert funds. Corroborated by Noticias RCN within
hours. This is the sharpest kind of scam-caution finding this project can
produce: not a warning about a hypothetical bad actor, but a confirmed
attack on a channel already trusted and pointed to by name. Logged
prominently, with an explicit note to verify the QR/donation channel
directly with the hotel before donating.

### A missing-persons case closes
Juan Felipe Giraldo, 24, missing since the Hotel Dibeni collapse on day
one, was confirmed dead four days later — days before he was due to marry,
leaving a 2-year-old son. Corroborated across at least six independent
outlets (El Tiempo, Noticias Caracol, Semana, El País, Pulzo, HCH Telev
Digital) within the same few hours.

### Two newly-evolved scam patterns
A first-person account described a new fraud vector: fake rental listings
targeting families displaced by the earthquake, soliciting a Nequi deposit
for housing "sight unseen" before the scammer disappears — distinct from
the QR-donation scams already documented. Separately, Telemedellín reported
volunteers denouncing a fake trapped-persons rescue alert that was actually
used to redirect labor toward looting a cash register from a damaged
business.

### Status changes and other updates
Two already-seeded shelters (Coliseo Mayor, Estadio Mora Mora) are now at
capacity, with the Alcaldía redirecting arrivals elsewhere. The president
visited Pereira and announced emergency-decree resources specific to the
city. The Alcaldía's own account restated its PMU casualty balance (95
dead, 270 missing, 259 injured) — the same figures already logged as
`TollRecord` entries in pass 23a, so no new toll rows were added, only the
fresh post URL. All three previously-known Pereira crowdfunding campaigns
(Convite por Pereira, Familia Millán, the UTP Vaki fund) were re-checked
live and show no status change.

### New aid points (2)
Todos Somos UTP — a new institutional bank-account campaign from the UTP
alumni association, distinct from the already-known UTP Vaki fund, with
concrete first-day results (33 students relocated, 168 food packages
collected). A second possible new shelter (Piscinas Olímpicas) was seeded
with an explicit unconfirmed flag — reported only by a partisan repost
account, not the Alcaldía's own verified channel.

### New community embeds (7)
The items above.

### Next steps (pass 32)
Continue the third round through the remaining eight cities, keeping the
same tight ~24h scope. Given how quickly this pass still surfaced a
confirmed scam and a missing-persons resolution, the tighter window is
worth keeping rather than reverting to a full re-sweep.

## Pass 33 — third round continues: Cali (2026-08-15)

### The casualty-figure conflict from pass 24 largely resolves
Pass 24 found three conflicting Cali-specific death tolls (74/96/111) too
scattered to log confidently. This pass found much stronger convergence:
Cali's own Centro de Coordinación de Información (CPI), relayed by Semana,
El País, La FM, Pulzo and Espacio Diario, gives 110 dead / 115 missing /
1,410 injured as of Aug 14 evening. One same-window Facebook post citing
the Alcaldía directly gave 104 instead — logged as a separate row rather
than merged, per this project's discipline. Both figures are now in
`TollRecord` (pass 33a) — the first Cali-specific toll data logged for this
project, previously left undocumented specifically because pass 24's
numbers wouldn't settle.

### A missing-persons story closes, tragically
The "trillizas Saavedra" case flagged in pass 24 resolved: Isabella
Saavedra Caicedo's body was recovered the night of August 13 in the
Edificio María Alvira collapse. Of the five-person family, only Ana María
(23) survived — sheltered by a fallen door, now recovering from a pelvic
fracture and, per one outlet, being kept away from news/social media by
her family while she heals. Corroborated across at least eight independent
outlets (Caracol, RCN, NTN24, Blu Radio, Telemundo, El País, Portal al
Día, Córdoba En Línea).

### A new scam vector, direct from the Alcaldía
Cali authorities warned residents that people are impersonating official
door-to-door statistical census-takers — a fraud vector distinct from the
QR-code donation scams already documented. Legitimate municipal teams use
physical documents only, never QR codes or phone verification.

### The city's official 24-hour donation hub, named
Mayor Alejandro Eder toured Ciudadela Petronio Álvarez with the president
and confirmed it's now "Casa Grande de la Solidaridad" — the city's single
official 24-hour donation and volunteer coordination center. Exact opening
date is unclear (evidence pointed to anywhere from same-day to 2-3 days
prior), but this is the first time it was captured by this specific name.
Separately, the mayor asked the national government to redirect EMCALI's
(the city utility) COP $2 trillion debt toward reconstruction funding.

### Status checks, no change
Canchas Panamericanas shelter remains open (~129 people, now with an
on-site health brigade, and visited by an official Salvadoran humanitarian
delegation sent by President Bukele). The Casa Mangle Vaki campaign is
still active, not closed or fully funded.

### New aid points (3)
Casa Grande de la Solidaridad, plus two new individual-family Vaki
campaigns (Juan David/Salomón/Valentina — a father and infant son, with the
baby's mother still missing; and Anita/Mario/Isabella/Juan) — both flagged
with a dating caveat since evidence on exactly when each was created was
inconsistent across agents.

### New community embeds (5)
The items above.

### Next steps (pass 33)
Continue the third round: Manizales, Armenia, Quibdó, Buenaventura,
Popayán, Dosquebradas, and San José del Palmar remain.

## Pass 34 — third round continues: Manizales (2026-08-15)

A genuinely quiet pass — most of the five research agents found nothing
clearing the freshness bar, consistent with how thoroughly pass 25 already
covered this city. What did surface was concrete rather than marginal.

### A grassroots kitchen scaling fast
La Patria reported a community soup kitchen at Parque Caldas, organized by
a local optician alongside street vendors turned volunteer cooks, that grew
from ~200 to ~1,000 meals a day over four days — with a second site planned
on Calle 30.

### A new official donation channel
The Alcaldía de Manizales announced a bank-transfer channel (with SWIFT
code, run by the Cámara de Comercio de Manizales por Caldas) alongside a
detailed in-kind drop-off list at Coliseo Menor — corroborated across two
platforms (the mayor's own Instagram post with banking details, a separate
Facebook post from the city's own account with the itemized needs list).

### Status updates
Eight buildings in the Milán neighborhood are moving through demolition
permits. The Hemocentro del Café blood-donation appeal (already on file)
updated its own status: paused intake Friday, resuming Saturday 8am for
O+/O- donors only, having restocked other blood types. Tu Canal Manizales
did an on-the-ground follow-up on the previously-flagged Coliseo Mayor
shelter-conditions complaints.

### Still unresolved
The 5-vs-6-dead casualty conflict flagged in pass 25 remains unresolved —
the only figure found this pass (a De la Espriella quote citing 5 dead,
112 injured, 142 sheltered, zero missing) is dated roughly three days
before this pass, i.e. not a fresh development, so it wasn't logged as new.
Both diaspora GoFundMe campaigns and the Cámara de Comercio's "Ruta
Integral" program remain active with no status change.

### New aid points (2)
Olla Comunitaria Parque Caldas, and the merged Fondo Solidario
Comunitario/Coliseo Menor donation channel described above.

### New community embeds (3)
The items above.

### Next steps (pass 34)
Continue the third round: Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, and San José del Palmar remain.

## Pass 35 — third round continues: Armenia (2026-08-15)

### An important nuance to Fundación Covida's "funded and rebuilding" status
Pass 26 upgraded Covida's status after a progress video showed demolition
underway. This pass found the fuller picture: over 200 users — people with
fibromyalgia, arthritis, and disabilities — still can't access hydrotherapy
because a rear wall of the facility remains structurally compromised. The
foundation, with a 38-year history and 14,000+ families served, is still
actively asking for infrastructure-recovery support. Not a contradiction of
the earlier finding, but a fuller picture worth keeping alongside it.

### Two new institutional acopio points
Casa Holística Ananda — a pre-existing wellness center, not a
quake-created account — opened a collection point with a full address and
multiple verifiable payment channels (Nequi, Western Union with a named
ID), corroborated independently by an organic post from a student
describing her teacher's house being opened for the same purpose.
Separately, an established local ambulance company (Ambulancias Paramedic
911) opened a donation point at Florida Mall, corroborated by a staff
member's cross-post.

### Other updates
A new missing-persons appeal (Cristian Camilo Arango Marín, with a direct
contact number). The Gobernación del Quindío delivered 500kg of pet food
to six animal-welfare foundations — a direct, encouraging follow-up to the
Fundación Oki Doki crisis documented in pass 26. Engineering teams continue
touring damaged schools to determine what can safely reopen. A new
reconstruction-phase friction point surfaced: a pre-existing housing
project (announced before the quake) is now also being pitched as housing
for displaced families, creating uncertainty for both groups as the
official census proceeds. El Colombiano reported fresh building-damage
detail: Condominio El Rincón fully evacuated after a 5th-floor water tank
collapse, the Universidad del Quindío's Bloque de Ciencias Básicas closed,
and the Hotel Armenia Estelar damaged.

### Status checks, no change
Coliseo del Sur remains open. Fundación Oki Doki's corrected payment key
shows no further issues in the comments. No new scam or updated
Armenia-specific casualty figures were found this pass.

### New aid points (3)
Casa Holística Ananda, the Ambulancias Paramedic 911 collection point, and
a diaspora GoFundMe (Jacobo Echeverria, funding debris-removal tools for a
US-Colombia volunteer network) — the last flagged with a dating caveat
since the organizer's own post is timestamped roughly three days prior,
so it may predate this pass's window rather than being brand-new.

### New community embeds (7)
The items above.

### Next steps (pass 35)
Continue the third round: Quibdó, Buenaventura, Popayán, Dosquebradas, and
San José del Palmar remain.
