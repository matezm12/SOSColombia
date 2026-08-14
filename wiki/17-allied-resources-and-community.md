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
