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
1. Review all pending items — `/admin/comunidad` has 30 pending, `/admin/moderacion`
   has 23 pending aid points, `/recursos` has 9 allied sites, across all 8 passes.
2. Sr Buñuelo Manizales and the CAFE-network addresses (pass 7) suggest there may
   be more value in searching Acopio Colombia/Cuidar a Colombia per-neighborhood
   or per-network-name (e.g. "CAFE", "Comfamiliar") rather than just per-city —
   not attempted yet.
3. TikTok search works fine unauthenticated (no login wall hit) — future passes
   don't need to assume it requires the user's logged-in session the way
   Facebook did.
