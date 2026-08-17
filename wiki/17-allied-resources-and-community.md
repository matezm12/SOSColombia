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

## Pass 36 — third round continues: Quibdó (2026-08-15)

No brand-new aid points this pass — every channel checked (the blood-bank
fridge, Fundación Thaar Wajaphasim, the GoFundMe) was either unchanged or
a status update to something already on file. The news is institutional
and significant.

### The congressman donation-misuse story escalates to a formal complaint
Pass 27 flagged an allegation that Rep. Óscar Benavides might be
improperly collecting Chocó earthquake donations into a personal-adjacent
account. This pass found it escalated to a formal complaint filed with the
Sala de Instrucción of Colombia's Supreme Court, naming a specific
magistrate (Francisco Farfán), a specific denunciante, and a specific
account holder allegedly linked to the funds. Former Attorney General
Francisco Barbosa publicly joined calls for investigation. Benavides
responded defiantly on his own TikTok, saying funds route through
"Asociación BNL2" and his legal representative rather than his personal
account — and now claims over $700 million COP and 40+ tons of aid
collected, up from ~$300 million in the prior pass. Both the legal
escalation and the figure escalation are logged.

### A presidential visit, and reconstruction-phase institutional moves
President De la Espriella visited Quibdó, confirming search-and-rescue is
formally closed (13 dead department-wide, per the Governor) and announcing
a special management office for Chocó with economic-emergency decrees due
the following week. Local authorities flagged at least 100 Quibdó homes
needing demolition for structural risk. Separately, Bogotá sent a
structural-engineering delegation (IDU, IDIGER, Camacol) to help guide
reconstruction planning, and the First Lady sent 12 trucks of supplies.

### An existing shelter failed overnight
A temporary shelter (apparently the Coliseo de Boxeo) flooded during a
storm, forcing an emergency nighttime relocation to the Coliseo del Jardín
with help from the taxi drivers' guild and police. The Gobernación
responded by activating new shelter points and 7 Starlink connectivity
points across Chocó municipalities — but the flooding itself is a caution
worth keeping on file for anyone directing people to that shelter.

### Other developments
Four people reported missing in Quibdó were found alive and unharmed.
Residents of the El Piñal neighborhood say announced aid ("300 tents")
hasn't reached them, so they're pooling money to rent an excavator
themselves — a concrete aid-equity/distribution-gap signal. An unconfirmed
lead suggests a Medellín city councilman's relief truck may include a
replacement blood-bank fridge, but this rests on a video-transcript
fragment, not a confirmed caption or news report — logged as a lead, not a
resolution.

### Status updates to known channels
GoFundMe "El mundo mira al Chocó" reached 100% of its $100,000 goal
(1,784 donors) and remains open. Fundación Escuela Taller de Quibdó's
cumulative total reached $40.2 million COP, amplified by allied
organizations nationally. Jhon Arias's effort continues escalating (a
third aid plane, a 30-ton truck, plans for new physical collection points
in Cartagena and Medellín).

### New aid points (0)
None this pass — everything found was either a status update to an
existing channel or too unconfirmed to seed (the possible blood-fridge
lead).

### New community embeds (11)
The items above.

### Next steps (pass 36)
Continue the third round: Buenaventura, Popayán, Dosquebradas, and San
José del Palmar remain.

## Pass 37 — Pijao, Quindío added as a tenth tracked city (2026-08-15)

Per an explicit user request: Pijao (a small municipality of ~5,400 people
in southern Quindío, part of the UNESCO Paisaje Cultural Cafetero) is
fighting an out-of-control wildfire in its rural veredas on top of
earthquake damage. Added as a `CRITICA`/red-alert municipio (divipola
63548), with a new `Municipio.alertNote` field so the homepage and city
page explicitly state the compound-disaster reason rather than relying on
the generic severity badge alone. Deliberately worded to avoid overclaiming
causation — no source found anywhere confirms the fire was earthquake-
triggered; every source treats it as a concurrent, compounding emergency
(dry season, wind, and steep terrain are the cited factors), not a
documented consequence of the quake.

### The fire, in detail
It broke out around 7:00–10:00pm on August 11 (the day after the M7.4
quake) in vereda La Maicena and sector Cueva Loca, at the Pijao–Génova
boundary — reportedly starting in an avocado plantation. By the end of
that first night, Pijao's own volunteer fire department counted **eight
separate wildfire foci** across the municipality's rural veredas (La
Maicena, Cueva Loca, El Cinabrio, Maicena Alta, Cañaveral, Sinabrio, El
Jardín); the Alcaldía's own same-day communiqué instead describes "tres
incendios" (three active fronts) — both figures are logged rather than
resolved to one, since they likely reflect different counting methods
(ignition points vs. active fronts). As of the most detailed ground report
(Crónica del Quindío, Aug 14), the fire was still not fully contained
after three-plus days, had spread into neighboring Génova, and — critically
— **no fire truck can reach the terrain**: responders and residents are
using garden hoses and hand-hauled water tanks. Génova's mayor gave a
rough, explicitly-unverified estimate of ~200 hectares burned on the
Pijao side and ~30 on the Génova side. One unoccupied house was lost;
Canal Trece separately confirmed Pijao's local response capacity was
"overwhelmed" because the same limited resources were simultaneously
handling earthquake injury/rubble response. Mutual aid arrived from fire
departments in Barcelona, La Tebaida, Buenavista, Córdoba, Génova, Armenia
and Caicedonia (Valle del Cauca), plus the Colombian Army's 5th Mountain
Battalion. Local authorities formally requested UNGRD/military aerial
firefighting support (Bambi Bucket helicopters) and mutual-aid tanker
trucks from Armenia/Calarcá — no source confirms that aerial support was
ever actually delivered to Pijao specifically (confirmed Bambi Bucket
deployments found were all for Antioquia).

### A previously-undocumented earthquake figure
National and departmental coverage consistently names Quimbaya as
Quindío's worst-hit municipality and never breaks out Pijao specifically
— the Gobernación's own "17,000+ edificaciones afectadas" departmental
tally doesn't mention Pijao by name. This research pass found Pijao's own
number: the mayor's Aug 11 preliminary balance puts **73 predios affected
(48 urban, 25 rural), 7 of them totally collapsed and declared
uninhabitable**, plus severe damage to the municipal church. The town's
water utility (EPQ) was confirmed unaffected. Sourced via a crowdsourced
tracker citing the Alcaldía's own balance (tier 3, not yet nationally
EDAN-validated) — logged as a new `TollRecord` (pass 37b), the first ever
for this municipio.

### The animal-welfare angle, confirmed
The Gobernación del Quindío's PYBA (Protección y Bienestar Animal) unit,
working with Universidad Alexander von Humboldt's veterinary program and
Policía Nacional, treated ~30-35 dogs and cats in vereda La Maicena and
relocated 6 puppies plus a pregnant female dog to a foster home. FEDEGÁN
(the national ranchers' federation) separately flagged rural/livestock
concern and put a field representative on the ground, though no specific
livestock-casualty figures were found — the confirmed animal response so
far covers companion/farm pets, not cattle.

### A caution worth keeping
An unverified Bre-B donation key ("@GLP760") is circulating attached to
one of the donation drives below, claimed to be from the Alcaldía but not
independently confirmed on the Alcaldía's own channel. Given active
national police warnings about fake post-earthquake donation campaigns,
this is flagged rather than trusted — verify any Pijao donation channel
directly with the Alcaldía before sending money.

### New aid points (7)
Pijao's own volunteer fire department (requesting volunteers and
equipment); the Gobernación's PYBA veterinary brigade; Fundación Kenovy
Colombia's water-collection drive (Armenia-based, supporting Pijao and
Génova); the "Pijao Nos Necesita" donation drive (Media Maratón Quindío,
cross-tagged by the Alcaldía and Gobernación); ICBF's Bienestarina and
psychosocial-support delivery to Vereda La Mariela; the Alcaldía's own
emergency-line directory; and the one crowdfunding campaign found that
names Pijao (a diaspora GoFundMe covering four Quindío towns, ~49%
funded).

### New community embeds (9)
The items above — mutual-aid fire response, the doble emergencia framing,
the ground-level "no truck access" reality, military support, the
livestock/rural angle, cross-municipal corroboration from Génova's own
fire department, the fire's origin story, the original SOS appeal from
the fire captain, and the donation-scam caution.

### Checked, deliberately not seeded
No missing-persons report specific to Pijao was found (a genuine gap, not
a search failure). No scam warning specifically names a fake Pijao
campaign — only generic national warnings exist, which is why the
@GLP760 key is flagged as a caution rather than confirmed fraud. No
livestock/cattle casualty figures were found despite targeted searching.
A "Pijao Informa" page that looked promising turned out to be a generic
clickbait template reused across dozens of unrelated cities worldwide.

### Next steps
Pijao now sits alongside the other nine tracked cities for future
follow-up rounds. Given how fast this situation is still moving (the fire
was uncontained as of the most recent report), a follow-up pass sooner
than the ~24h cadence used for the other cities may be warranted.

## Pass 38 — Pijao expanded further, per user request (2026-08-15)

The user asked to expand Pijao's research "a lot" before moving on to the
rest of the cities. Ran a second, wider 5-agent pass explicitly scoped to
verify pass 37's shakier findings against primary sources, check for a
fire-containment update, and search outlets/angles the first pass hadn't
covered. Result: several important corrections to what pass 37 reported,
not just additions.

### The 73-predios earthquake figure is now primary-source confirmed
Pass 37 sourced this only through a third-party crowdsourced tracker
(tier 3). This pass found the exact figure — "73 predios afectados, 48
urbanos y 25 rurales, de los cuales 7 presentan colapso total" — stated on
camera by Mayor John Jairo Restrepo Gallego on the Alcaldía's own
Instagram, repeated verbatim across three posts. Upgraded to a tier-2
`TollRecord` (pass 38a). The same primary source also states explicitly
that **no deaths were reported in the municipality** — a new, directly-
sourced figure, corroborated by the only Quindío quake-fatality story
found being located between Montenegro and Quimbaya, not Pijao.

### The fire is NOT confirmed contained — contrary to the more hopeful pass-37 framing
Today's Alcaldía post (5 hours old at check time) shows an Army disaster-
response brigade still inspecting "focos activos" in La Maicena and El
Sinabrio. La Crónica del Quindío's independent field reporting from the
same window is blunter: authorities acknowledge the fire "continúa sin
ser controlado" along the Génova border, now in its fourth or fifth day.
Canal Telecafé separately reported the community "vuelve a alertar" after
an earlier "controlled" report proved premature. Net picture: partial
control in some veredas (Sinabrio), continued active-foci monitoring in
others (La Maicena, the Génova border) — genuinely contested, not settled.

### Aerial firefighting support: a contested claim, not a resolution
One line of research found what looked like confirmation — Génova's own
Instagram and Quindío Noticias describing a Fuerza Aeroespacial Colombiana
Bambi Bucket helicopter making ~32 water drops on the shared Cueva
Loca/La Maicena fire complex around Aug 13-14. But three independent,
harder searches by other agents in the same pass found no such
confirmation anywhere, and traced every verified Bambi Bucket deployment
they could find to Tolima and Antioquia specifically, not Quindío. Rather
than pick a side, both findings are logged (see the community embed) —
this is exactly the kind of contradiction this project's discipline
exists to surface rather than paper over.

### A methodological catch: recycled content-farm text
A viral-looking livestock figure ("8,000 hectares of pasture, 200 sheep
lost") turned out, on an exact-phrase check, to be boilerplate recycled
verbatim from unrelated fire reports in Bolivia, Panama, and Peru, with
Pijao's name substituted in. Not used. Worth keeping in mind for future
Pijao research — this kind of content-farm contamination is a real risk
for a small, thinly-covered town where genuine reporting is sparse.

### The @GLP760 donation key: mostly de-risked, but misattributed
Pass 37 flagged this as an unverified key possibly falsely claimed to be
the Alcaldía's. This pass found it's real — tied to a named individual
and traceable to roughly a year of prior Media Maratón Quindío fundraising
activity, reposted by the Gobernación del Quindío's own official account.
But it was checked against ~10 of the Alcaldía de Pijao's own posts and
never appears there; the Alcaldía's own donation messaging only ever
points to its physical Centro de Acopio. So the claim "this is the
Alcaldía's own key" looks like a misattribution, not a fabrication — the
key itself is probably legitimate, just belongs to a different (also
real) campaign. Logged as a clarifying community embed rather than a
retraction, since the original caution's underlying instinct (don't trust
an unverified claim of official origin) was reasonable.

### Genuinely new finds
The Alcaldía runs its own physical Centro de Acopio (Secretaría de
Gobierno) distinct from the MMQ drive already on file. World Central
Kitchen — chef José Andrés's international relief NGO — confirmed
operating in Pijao across multiple posts spanning several days, alongside
the other major cities already tracked. Pijao Trail, the town's signature
mountain race, organized an Aug 16 solidarity visit to affected fincas —
a genuine tourism-identity-meets-disaster-response angle. Two new mental-
health/risk-management hotlines were found that the first pass's
emergency directory missed. A psychosocial brigade for the Ibanakuara
community was found on Quindío's official government domain (medium
confidence — the snippet was readable but the full article returned a
403). First documented mention of agricultural economic loss ("pérdidas
incalculables en cultivos"), though without hard figures. A clarifying
detail: Pijao actually had two separate August fires — an earlier,
smaller, apparently-already-controlled Aug 1 blaze (El Espartillal/Las
Maravillas) distinct from the larger, ongoing, post-earthquake fire this
whole research effort concerns. Don't conflate the two.

### Dug harder, still genuinely empty
Missing persons, Pijao/Génova-specific scams, livestock/cattle casualty
figures, a Vaki campaign, and school-closure status all remain unfound
after a substantially harder second search (multiple phrasings, multiple
platforms, named-person searches). Each empty category was checked
against specific plausible-looking leads that turned out to be false
positives on inspection (documented in the seed script's rejected list) —
this is a confirmed absence, not an unsearched gap.

### New toll records (2)
The primary-source-upgraded 73-predios/7-colapsos figure, and Pijao's
first-ever zero-deaths figure, both from the Alcaldía's own statement.

### New aid points (6)
The Alcaldía's own Centro de Acopio, World Central Kitchen, Pijao Trail's
solidarity visit, two new emergency hotlines (salud mental, DIGER), the
Fundación SOS Internacional/Red Salud Armenia brigade, and the Ibanakuara
psychosocial brigade.

### New community embeds (9)
The fire-status update and contradiction, the contested aerial-support
finding, the recycled-livestock-figure catch, the GLP760 clarification,
the crop-loss/communications-outage signal, CRQ's mutual-aid confirmation,
the Governor's 15-point departmental request, and the updated
animal-welfare figures.

### Next steps
Pijao's research is now substantially deeper than a typical first pass —
matching or exceeding the two-round depth given to the other nine cities
in a single expanded round. Per the user's instruction, the plan is to
keep expanding Pijao further if asked, or move on to the remaining
third-round cities (Buenaventura, Popayán, Dosquebradas, San José del
Palmar) once satisfied.

## Pass 39 — Pijao, third and final expansion round (2026-08-15)

The user asked for one more round on Pijao before moving on to the
remaining cities. This pass was scoped specifically to resolve the two
contradictions pass 38 left open, and it did.

### Fire containment: confirmed still not contained
As of the most recent reporting found (Aug 14-15), the fire remains
active. A Crónica del Quindío field report — the Génova mayor speaking
on-record at the scene — describes the situation as worsening, not
improving, three days in. A more precise (though still informal, pending
official measurement) hectare estimate emerged: ~200 hectares burned in
Pijao, ~30 in Génova, with one additional unoccupied house lost on the
Génova side. A citizen's Facebook comment publicly disputes the "controlled"
framing entirely, alleging several homes were fully lost in the highlands
— unverified, logged as a counter-narrative rather than a fact.

### Aerial support: resolved toward "probably not delivered"
This pass specifically hunted down the strongest evidence for "yes" from
pass 38 — a CRQ (regional environmental authority) Instagram post citing
Bambi Bucket use — and found that its exact wording is recycled boilerplate
used verbatim in unrelated Antioquia wildfire posts by Cornare (that
region's equivalent authority), which substantially undermines it as
case-specific proof. Meanwhile, the two most detailed primary accounts —
the Alcaldía de Génova's own thorough thank-you post naming every
responding entity, and the Crónica del Quindío field report quoting the
mayor on exactly which outside support arrived — both omit any aerial
mention despite being exactly the kind of account that would credit it if
it had happened. Net verdict after three passes: leaning "probably not
delivered," though no source flatly denies it either.

### A correction: the "Ibanakuara psychosocial brigade" doesn't appear to exist
Pass 38 flagged this as a promising but 403-blocked lead. This pass
finally identified the actual quindio.gov.co article behind that
snippet — and it's dated August 25, 2025, a full year before the
earthquake, describing an unrelated pre-existing drinking-water
infrastructure project. No 2026 psychosocial-brigade article for
Ibanakuara exists after three separate hard searches. Recommend
discounting that item from pass 38. A related, genuinely current finding
did surface in its place: SADRAQuindío ran an animal-vaccination brigade
at the same Ibanakuara resguardo, seeded here instead.

### Other findings
An informal but apparently ongoing grassroots aid-convoy operation
(a citizen account reporting its "7th truck, 7 tons" bound for Pijao,
army-escorted) suggests an informal supply pipeline running alongside the
institutional response. The Comité de Cafeteros del Quindío and the
Ministerio de Agricultura both engaged with Pijao/Génova specifically as
part of a 12-municipio evaluation — the clearest agricultural-relief
signal found across all three passes, though still department-wide rather
than a dedicated Pijao fund. A circulating "7,153 hectares" figure was
identified as the *national* wildfire total (438 fires, 191 municipios),
not a Pijao-specific number — flagged explicitly to prevent future
misattribution.

### Still genuinely empty after three hard passes
Missing persons, a scam specifically naming Pijao/Génova, livestock/cattle
casualty figures, a Vaki campaign, school-closure status, and a
reconstruction fund or housing subsidy naming Pijao specifically (as
opposed to Quindío department or the nation broadly) — all checked
repeatedly with varied phrasings and platforms across three passes and
confirmed absent rather than unsearched.

### New aid points (1)
SADRAQuindío's animal-vaccination brigade at the Ibanakuara resguardo.

### New community embeds (6)
The fire-status update, the aerial-support verdict, the citizen dissent,
the grassroots convoy signal, the agricultural-relief signal, and the
national-vs-local hectare-figure clarification.

### Closing this round
Three deep passes across Pijao now sit alongside a single deep pass for
each of the other nine cities — genuinely more thorough coverage for the
newest, smallest, and most acutely time-sensitive addition to this
project. Per the user's explicit instruction, moving on now to the
remaining third-round follow-up cities: Buenaventura, Popayán,
Dosquebradas, and San José del Palmar.

## Pass 40 — third round continues: Buenaventura (2026-08-15)

### The hospital ship "Benkos Biohó" controversy resolves
Pass 28 documented an accountability story: the mobile hospital ship meant
for Buenaventura and the Pacific coast sat idle because health-staff
contracts weren't renewed. This pass found it resolved — DIMAR (Colombia's
maritime authority) posted directly that it made its Buenaventura pier
available for the ship's operation, and the hospital's own interventor and
the harbor master confirmed it opened an operating room and is treating
quake patients. Gustavo Petro's own account corroborates the timing while
keeping a political blame dispute alive over who caused the delay — the
operational resolution is solid across multiple institutional sources
even though the politics aren't fully settled.

### A new, Buenaventura-specific donation scam
Distinct from the Pereira QR-code scam already documented: singer Jhonny
Rivera runs a separate Buenaventura-specific relief appeal, and scammers
copied it with a swapped QR code. Confirmed by Rivera's own account and
Noticias RCN — a second instance of the same attack pattern hitting a
second real, trusted channel.

### Casualty figures: more fragmented, not less
Five different Buenaventura-specific death tolls (10, 13, 16, 22, 26)
were all found circulating within this single pass, none from one
consolidated official source. Deliberately left out of `TollRecord` given
active disagreement rather than convergence — logged only in the
community embeds as an unresolved mess, consistent with how this project
handles genuine same-window conflicts it can't responsibly resolve.

### New damage detail and official visits
The Alcaldía Distrital's own figure: 3,956 homes destroyed or damaged
citywide. A ministerial visit (Interior Minister Rodrigo Lara, VP José
Manuel Restrepo) toured Barrio Lleras — a palafitic (stilt-house)
neighborhood in comuna 3 — finding 800+ homes destroyed there specifically,
with a Ministry of Housing reconstruction plan to follow once the
emergency response stabilizes. The Valle del Cauca Governor declared 3
days of official mourning and a department-wide moment of silence, citing
150+ dead across the department (not Buenaventura-specific).

### A research-prompt correction, not a data error
This pass's own instructions asked agents to check whether "Canchas
Panamericanas" and "Casa Grande de la Solidaridad" — Buenaventura fixtures
per the prompt — had changed status. Multiple agents independently
determined both are actually Cali facilities (already correctly seeded
under Cali in passes 24 and 33), not Buenaventura ones. No correction
needed in the database — this was an error in how this specific pass's
research brief was framed, not a prior data mistake, but worth recording
so it doesn't get repeated.

### New aid points (2)
The now-operational Benkos Biohó hospital ship, and Manos Visibles' new
"Fondo de Reconstrucción S.O.S. Pacífico" — a credible, established
Afro-Colombian equity NGO (led by former Culture Minister Paula Moreno)
launching a dedicated Buenaventura/Chocó reconstruction fund with concrete
logistics already moving.

### New community embeds (6)
The items above.

### Next steps (pass 40)
Continue the third round: Popayán, Dosquebradas, and San José del Palmar
remain.

## Pass 41 — third round continues: Popayán (2026-08-15)

A quieter city than most, as the two prior passes already suggested, but
this pass still turned up a genuinely strong new find and two new actors
joining Popayán's ongoing effort to help Chocó.

### A well-corroborated new aid point: an elder-care home in crisis
Fundación Hogar San Vicente de Paúl de Popayán — a nursing home whose
chapel and roof collapsed in the quake — surfaced with real institutional
donation details (NIT, two bank accounts) and was independently
corroborated across five separate sources: FAMVIN (the international
Vincentian-family news network), a Colombian Army post about soldiers
helping clear debris on site, the foundation's own Facebook page, a
Portafolio.co business registry entry matching the same NIT and address,
and a Vincentian-affiliated Instagram account. That breadth of independent
corroboration is why it's included despite tracing to a single primary
post.

### Casa de la Moneda: extended, not closed
The medical-supply drive flagged as "final stage" in pass 29 turned out
to run one more day — the Gobernación del Cauca's own account confirms
today (Aug 15) is its true final day, still urgently requesting medical
supplies.

### Two new actors in the Popayán-to-Chocó story
The Policía Metropolitana de Popayán is organizing its own aid shipment —
a new institutional actor beyond the youth council and grassroots
collection already documented. Separately, the Consejo Regional Indígena
del Cauca (CRIC) sent a "minga humanitaria" — a delegation of councilors,
indigenous authorities, and the Guardia Indígena — to support communities
in Chocó directly, a distinct initiative from either of the two already
on file. The youth council's own collection has since departed (7+
tonnes, trucks confirmed en route) and remains open until Monday; a
separate, unverified claim of "35+ tonnes in four trucks" could not be
pinned to a clean source this pass and is noted rather than logged as
fact.

### Other signals
A CTI missing-persons flyer for Francisco Javier Manquillo Tonguino
(missing since Aug 13 from a Popayán bakery) surfaced — genuinely new,
though the flyer itself doesn't state an earthquake connection, so it's
logged with that caveat rather than as a confirmed quake casualty. A
market fair organized through a Fundación Mundo Mujer congress is giving
displaced vendors from Cali, Quibdó, Pereira, and Manizales a place to
sell — a small but genuine economic-recovery signal. A first pet-supply
collection point appeared (a category not previously found for Popayán),
alongside a new municipal donation point run by the city's own Culture
and Tourism Secretariat and a grassroots neighborhood collection point in
Barrio La Paz.

### New aid points (4)
Fundación Hogar San Vicente de Paúl, the Culture and Tourism Secretariat's
collection point, the pet-supply drive, and the Barrio La Paz neighborhood
point.

### New community embeds (7)
The items above.

### Next steps (pass 41)
Continue the third round: Dosquebradas and San José del Palmar remain.

## Pass 42 — third round continues: Dosquebradas, Pereira dedup again (2026-08-15)

Every candidate this pass was again cross-checked against Pereira's full
aid-point list (now 64 entries) per the standing user instruction. The
shelter network expanded, a field hospital appeared, and — notably — the
Alcaldía's own damage-report form turned out to be broken, a second
stale-system finding alongside the blood-donation point already flagged
in pass 30.

### The shelter network keeps growing
Two new sites: Albergue Minuto de Dios (150-person capacity, announced
directly by the mayor) and a fourth shelter — Las Violetas, in the
La Graciela/vía Frailes area pass 30 had already flagged as coming —
now confirmed live, though its capacity is reported inconsistently
(150 vs. 300 depending on the source, both logged rather than resolved).
Campestre B's headcount updated to ~120 people across 36 families.

### A field hospital, and a second broken official system
A "Hospital de Campaña" appeared at the municipal coliseum, run jointly
by Fundación CardioClinic and Hospital Santa Mónica, including a free
obstetric-ultrasound day for pregnant earthquake survivors. Separately,
the Alcaldía's own official carousel post about the emergency response
revealed in its own comment thread that the city's damage-report QR
code/form is broken — at least four independent commenters flagged it —
echoing the same blood-donation-point pattern from pass 30: an aid system
that looks fine from the outside until you check its own comments.

### Building-safety complaints with no response
Three specific buildings in the Santa Mónica sector — Edificio SALYFE,
Edificio Monserrate, and Hotel Veneton (three days without power, families
waiting to see if it collapses) — were named by residents in the same
comment thread, who say the city hasn't responded. Separately, Portal del
Parque's Torre 6 suffered total collapse with Towers 3-5 seriously
damaged, residents still waiting for authorization to retrieve belongings.
A four-story building in Santa Mónica began controlled demolition.

### A cross-city resource, flagged as shared
pereiravive.com — a free, community-built rental listing site — serves
displaced families in both Pereira and Dosquebradas explicitly, exactly
the kind of shared resource this project's Pereira/Dosquebradas dedup
discipline exists to catch rather than file under one city silently.

### New aid points (4)
Albergue Minuto de Dios, Albergue Las Violetas, the Hospital de Campaña at
the municipal coliseum, and SINALTRAINAL Dosquebradas' union headquarters
converted into a collection point.

### New community embeds (6)
The items above.

### Next steps (pass 42)
San José del Palmar remains — the final city in the third round.

## Pass 43 — third round closes: San José del Palmar (2026-08-15)

The smallest, most remote, and most recently double-covered city in this
project — genuinely thin results were the expected and honest outcome,
and that's what this pass found, plus one real new grassroots effort.

### A new supply drive for a rural corregimiento
A Bogotá-based cultural/community network is organizing a truck shipment
of basic supplies specifically for the Consejo Comunitario Afrodescendiente
de San Pedro de Ingará, a rural corregimiento of San José del Palmar —
distinct from the Proceso de Comunidades Negras collection point already
on file, and pointed directly at the rural-verification gap the last two
passes left open.

### Quantified progress, still-unresolved rural isolation
A local outlet reported over 50 tonnes of humanitarian aid have now
reached the town — the first concrete tonnage figure, though from a
single source not independently corroborated this pass. UNICEF España put
a number on the isolation problem: 45+ landslides still blocking roads,
leaving thousands of rural families cut off. Two unverified citizen posts
described the Nóvita–San José del Palmar corridor specifically — 22
isolated hamlets, a river damming dangerously in vereda Surumita — adding
real-sounding detail with no institutional source to confirm it.

### Status checks
The town's one known crowdfunding campaign (Valentina Jurado's Vaki)
remains active and still drawing donations, now at $46,480 from 1,828
donors. No progress was found on the access road beyond its one-lane
status, no conclusion to rural-zone casualty verification, no update to
the ASOPERCHO donation-key caution, and no new missing-persons or scam
reports — all checked directly and confirmed unchanged rather than simply
unsearched.

### New aid points (1)
The San Pedro de Ingará supply drive.

### New community embeds (3)
The items above.

### This closes the third follow-up round across all ten tracked cities
Pereira, Cali, Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, and San José del Palmar have each now had three research
passes (an original deep pass, a follow-up round, and this tightly-scoped
third round), plus Pijao — the city added mid-project for its compounding
earthquake-and-wildfire crisis — which received three deep passes of its
own given how fast that situation was moving. 43 research passes total.
The throughline across this third round: several open contradictions from
earlier passes got resolved rather than just re-confirmed (Cali's death
toll converged, Quibdó's congressman story escalated to a formal
complaint, Buenaventura's hospital ship deployed, Pijao's fire-support
question resolved toward "probably not delivered" after exposing recycled
boilerplate as the strongest false-positive evidence) — a sign that
tight, repeated, skeptical passes are catching real signal, not just
noise.

## Pass 44 — Pijao, a fourth pass: who *outside* Pijao is amplifying it (2026-08-15)

A deliberately different angle from passes 37-39, which verified Pijao's own
local situation. This pass asked: who *elsewhere* in Colombia — other cities,
pages, communities, national media — has noticed Pijao's compounding
earthquake-and-wildfire crisis and is actively redirecting attention or
donations toward it, the way a Bogotá cultural network did for San José del
Palmar in pass 43. Five parallel agents (X, Instagram, Facebook, TikTok+
YouTube, and a general web sweep), all instructed to record an honest
`originCity` for every candidate rather than assume a Pijao-sounding post is
externally organized.

### Real cross-city amplification, confirmed
- **Cumbres Blancas Colombia** — a 63K-follower Bogotá-headquartered
  mountain-ecosystem NGO running an active donation drive (Bancolombia
  account + landing page) for wildfire brigades, whose Aug 14 appeal
  explicitly lists "Pijao, Génova" among the fire zones alongside Nariño and
  Antioquia. Two of five agents corroborated this independently.
- **co.inspires.lab** — actually an Armenia, Quindío account by its own bio
  (not Bogotá, despite one agent's mistaken inference) — but its firefighter/
  volunteer supply appeal for "Pijao y Génova" (with a live Nequi number) is
  the clearest confirmed instance of the exact pattern asked for: it was
  reposted verbatim, within 24-48 hours, by accounts based in Antioquia
  (@antioquiaenvivo), Ocaña/Norte de Santander (@mi.ocana, 600+ km away), and
  a 188K-follower influencer (@2ombie.girl) — genuine cross-country spread of
  a Pijao-specific call for help. Those reposts themselves couldn't be seeded
  as social posts (no agent captured an exact permalink, only search-result
  evidence), so they're recorded here rather than invented.
- **Mariana Terán Ramírez (@marianateranr)** — a 182K-follower national
  sustainability-lawyer influencer with no Quindío tie, co-published with
  Cumbres Blancas a "how to help with Colombia's wildfires" directory whose
  Quindío slide names Pijao specifically (La Maizena, Cueva Loca) and lists
  concrete Pijao drop-off points (the Esto es Quindío trailer, the old Pijao
  galería) plus a named volunteer distributing donations. In her comments she
  personally redirects a Bogotá and a Medellín follower toward Cumbres
  Blancas — a documented instance of an outside account actively routing
  other-city donors toward Pijao's needs.
- **National media, not just Quindío-regional outlets**: RTVC Noticias
  (Colombia's national public broadcaster) and Canal Trece (national public
  TV) both ran dedicated posts naming Pijao and vereda La Maicena
  specifically; Pulzo (national Bogotá digital outlet) ran a short with the
  community's own request for "máxima difusión." None carry a donation
  mechanism — they're awareness coverage, not aid points — but they confirm
  Pijao's story reached the national press, not just regional Quindío media.
- **#SOSPijao's actual origin** — tracked down the primary source: a Pijao
  resident's Aug 12 Facebook post tagging Bomberos, Cruz Roja, Defensa Civil,
  Policía, Ejército, UNGRD and the Alcaldía directly, reporting that promised
  Fuerza Aeroespacial aerial support never arrived. This is the origin post
  behind the hashtag and behind the already-logged contested Bambi Bucket
  question (pass 39) — corroborates rather than reopens that finding.

### New aid point: Corpofomento Pijao
A pre-existing local reconstruction corporation (independently confirmed via
a SENA community-development guide and a Crónica del Quindío article naming
one of its administrators) is now taking Bancolombia donations with a full
NIT and four named administrators — a genuinely new, structured local
donation channel not found in three prior passes, being reshared toward
audiences outside Pijao (an English translation circulated among diaspora
accounts).

### Explicitly rejected: "Una Garra por Colombia" (Vaki, Senator Andrea Padilla)
Came up repeatedly across four of five agents as a tempting lead — a real,
verified, $113K+ national Vaki campaign for earthquake-affected animals,
amplified by a sitting senator and a former senator/governor. But its own
base campaign page scopes itself to "el occidente del país" (Chocó/Pacific
region) and never names Pijao or Quindío. Only one Armenia-based amplifier
(Fundación Kenovy Colombia) captioned a share as being for Pijao/Génova
reconstruction — not enough to treat the campaign itself as a Pijao channel.
Not seeded, consistent with the "name Pijao specifically, not just the
earthquake generally" bar this pass was held to.

### Also checked, genuinely empty
No Bogotá/Medellín/Cali/Barranquilla/Bucaramanga account organizing a
physical collection drive naming Pijao was found beyond the co.inspires.lab
repost chain above; no diaspora campaign (US/Spain/elsewhere) names Pijao
specifically (existing GoFundMes all say "Quindío" generally); no "adopt a
family" or "sponsor a vereda" mechanism naming Pijao exists on any platform
searched; #SOSPijao and #PijaoNecesita don't function as real aggregating
hashtags on Instagram's own index (searching the tags returns unrelated
content); X/Twitter surfaced almost nothing on this specific angle — the
real signal was on Instagram and Facebook.

### New aid points (3)
Cumbres Blancas Colombia (MONETARY_DONATION), co.inspires.lab (ACOPIO),
Corpofomento Pijao (MONETARY_DONATION).

### New community embeds (5)
Mariana Terán Ramírez's donation directory, RTVC Noticias, Canal Trece,
Pulzo, and the #SOSPijao origin post.

### Next steps (pass 44)
Per the user's standing instruction, Pijao's research now pauses here
pending their review of what's been gathered across four passes — the
natural next step, once they're satisfied, is resuming city coverage
elsewhere rather than a fifth Pijao-specific pass.

## Pass 45 — a fourth research round begins: Pereira (2026-08-15)

New round across all 10 tracked cities, by explicit user request. Pereira
already had three exhaustive rounds (passes 13, 14, 23, 32), so this pass's
brief to all 5 agents was deliberately narrow: don't re-find the CAFE
network, the known shelters, blood/health/vet points, or existing
crowdfunding campaigns — hunt specifically for what a fresh sweep finds
five days later — fresh 24-48h posts, status updates, new scams,
reconstruction-phase news, missing-persons resolutions, and new
crowdfunding campaigns.

### Two new official shelter points, three originals now full
The Alcaldía de Pereira's own Aug 14 "ACTUALIZACIÓN — PUNTOS DE ALBERGUE"
infographic confirms Ecoparque El Vergel, Coliseo Mayor, and Estadio Mora
Mora have all reached capacity, and directs families to two additional
points: **Polideportivo Belalcázar (Boston)** and the **Plazoleta de la
Villa Olímpica** (the latter independently corroborated by a citizen post).
Both seeded as new ALBERGUE aid points.

### A real find in the "confirmed dead end" category: ArriendoYa.org
Every prior housing-offer search (X specifically, across three rounds)
concluded grassroots housing offers genuinely don't exist on social media
for this event. This round found the exception on a different platform:
**ArriendoYa.org**, a rental-matching site built after the earthquake with
250+ displaced families registered (Pereira, Manizales, Santa Rosa de
Cabal, Armenia, Cali) and an open call for anyone with a vacant rental to
list it. Real engagement, a live functioning URL, worth evaluating for
`/recursos` in a future pass rather than just as a community embed.

### 6 new crowdfunding campaigns
5 new GoFundMe/Vaki campaigns plus a status check on one already-seeded
campaign (Kathryn Winn's, now 48% funded). The strongest fit for this
round's reconstruction-phase focus: Vanessa Gelacio's "Pereira Earthquake
Home Repair & Relief Fund," run by a Pereira real-estate family doing a
systematic damage census of their own rental network, with an explicit
no-profit-to-company clause. The weakest, included anyway with its low
traction flagged explicitly: Carlos Andrés Cortés' Vaki/GoFundMe for Angie
and her non-verbal-autistic son Thiago ($122/2 donors after 4 days, but a
verified organizer badge and real photo evidence — unlike previously
rejected zero-traction campaigns, this one has real if modest support).

### Two missing-persons resolutions, one new fatality
Marlon García Ruíz and the Guerrero siblings (Génesis and Gabriel) — both
open threads from earlier passes — are confirmed found safe. Separately, a
second fatality from the Hotel Dibeni collapse surfaced: Juan Fernando
Rodríguez Álvarez, an Ibagué resident who was staying there, found dead
after days of search — distinct from the already-documented Juan Felipe
Giraldo case, single-source so far.

### A caution flagged next to an existing trusted aid point
An uncorroborated TikTok allegation claims Expofuturo (an acopio point
seeded since pass 1) has become entangled in local political leverage —
donations and votes allegedly funneled toward specific politicians.
Location-tagged and real engagement, but single-source and personal-account
sourced, same evidentiary tier as the already-logged Homecenter-reselling
rumor (pass 23) and the Manos Visibles broken-QR finding (pass 12) — noted
as a caution, not seeded as a confirmed fact.

### Checked, genuinely clean
No new Pereira-specific donor scam/fraud report surfaced across any
platform this round (several personal-Nequi-appeal accounts show the same
generic risk pattern already documented, but nothing rose to a new, named
fraud report) — searched deliberately and came back clean rather than
unsearched. No government housing-subsidy/insurance/indemnización content
surfaced on Instagram or TikTok specifically (worth trying official-account
X search directly in a future pass, per the Instagram agent's own note).

### New aid points (8)
2 ALBERGUE (Polideportivo Belalcázar, Plazoleta de la Villa Olímpica), 6
MONETARY_DONATION (5 new GoFundMe/Vaki campaigns + the Angie/Thiago
low-traction campaign).

### New community embeds (11)
The items above — national reconstruction news (Santo Domingo family's
COP 100bn pledge, WCK's ongoing multi-city meal operations, the PND/
Emergencia Económica inclusion announcement), the ArriendoYa.org find, two
missing-persons resolutions, the Hotel Dibeni second fatality, the official
shelter-capacity update itself, the Expofuturo caution, one human-interest
resolution (Carlos Cortés Alarcón), and a small local business's donation
bonds.

### Next steps (pass 45)
Continue round 4 through the remaining cities: Cali, Manizales, Armenia,
Quibdó, Buenaventura, Popayán, Dosquebradas, San José del Palmar, and
Pijao.

## Pass 46 — round 4 continues: Cali (2026-08-15)

Same narrow round-4 brief as pass 45, applied to Cali (three prior rounds:
passes 15, 24, 33). A genuine complication this pass: several candidates
that looked new at first turned out, on cross-checking against the
`rejected` notes from the project's own prior passes, to be duplicates —
Familia Saavedra's GoFundMe (already seeded pass 15, now 83% funded and
still growing), Casa Mangle's Vaki (already seeded pass 24, still active),
and the Ciudadela Petronio Álvarez acopio hub (already known since pass
33, now formally rebranded "Casa Grande de la Solidaridad" by the mayor's
office). None of these were re-seeded — only their status updates are
noted below.

### Death toll: unchanged
Cali's official figures (104 dead per the Alcaldía's low-end reading, 110
per the CPI/Semana reading, 115 missing, ~1,400 injured) are unchanged
from pass 33a's own TollRecord rows — a Nuestra Región repost and a CBS
News figure (96 dead, dated ~Aug 13) both surfaced this round but neither
represents genuine new movement, just recirculation or a stale earlier
reading. No new TollRecord rows added.

### A real institutional find: Instituto para Niños Ciegos y Sordos
An 80+-year Cali institution serving ~150 blind/deaf children a year had
its building badly damaged — a second-floor roof collapse and fourth-level
wall failure killed two named staff members (Ana Lucelly Adarbe, Jaime
Bonilla) and injured 7 more while they were trying to exit. A verified
Vaki campaign for the repair is corroborated across Instagram, X, and the
institute's own Facebook page. Seeded as a new MONETARY_DONATION aid
point.

### A possible duplicate flagged, not resolved
The Gobernación del Valle's "Antigua Fábrica de Licores del Valle" acopio
point (confirmed still active via @GobValle) has a suspiciously similar
name to "Centro de acopio La Licorera," already seeded for Buenaventura in
pass 6 from the same Gobernación source — they may be the same physical
site serving as a departmental logistics hub, or two different points.
Seeded with the ambiguity spelled out directly in its `submitterNote`
rather than guessed at, same discipline as the Cali/Acopio-Colombia
food-bank flag in pass 7.

### New scam angle, and one explicitly excluded
A Cali-specific fraud warning surfaced: people posing as census-takers are
visiting affected families door-to-door to extract private information. A
much bigger scam story — a sitting congressman (Óscar David Benavides
Ángulo) under scrutiny for routing $300M+ COP in self-solicited donations
through an associate's personal account, flagged by a former attorney
general as potential estafa/lavado de activos — was found via a Cali news
page, but the money itself was solicited "para el Chocó," so it's held out
of Cali's list and flagged for the Quibdó/Chocó round instead. A separate
viral Homecenter-reselling-donations claim was found already
publicly disputed by Homecenter itself by the time this pass ran — logged
as a contested claim, not a confirmed fraud.

### Missing-persons: one tragic resolution, one positive one
The Saavedra triplets case (Torres del Limonar) closed tragically — the
third and final sister, Isabella, was found dead, confirming four family
deaths total; sole survivor Ana María's existing GoFundMe is growing fast
($123K of $150K, 2,683 donors). Separately, siblings Valentina and Juan
Esteban Vanegas, reported missing after the quake, were found alive.

### New aid points (4)
Antigua Fábrica de Licores del Valle (ACOPIO, duplicate-risk flagged),
Instituto para Niños Ciegos y Sordos del Valle del Cauca (MONETARY_
DONATION), Casa Sorora (MONETARY_DONATION), Acopio Barrio Santa Teresita
(ACOPIO, time-limited window flagged).

### New community embeds (10)
The scam alert, the Saavedra resolution, two reconstruction-financing
announcements (Mayor Éder's $10B COP proposal, the national 3-stage
housing plan), the $350B COP estampillas request, the Casa Grande de la
Solidaridad rebrand, the Santa Teresita acopio source post, the HUV family
protest, the Homecenter dispute, and the Vanegas siblings' resolution.

### Next steps (pass 46)
Continue round 4: Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, San José del Palmar, and Pijao remain. The Benavides
donation-fraud scandal should be picked up specifically in the Quibdó/
Chocó round-4 pass, since that's where the actual money was solicited.

## Pass 47 — round 4 continues: Manizales (2026-08-15)

Same narrow round-4 brief as passes 45-46, applied to Manizales (three
prior rounds: passes 16, 25, 34). This round's yield skewed heavily toward
reconstruction-phase content rather than new physical aid points — several
individual crowdfunding campaigns were independently found by 2-3 of the
5 agents each, a strong corroboration signal.

### Missing persons resolved systemically, not case-by-case
Rather than an individual found-alive story, this round surfaced an
official government report: Manizales' balance stands at 5 dead, 112
injured, 142 people in temporary shelters, and **zero missing persons
reported anywhere in Caldas department**. Directly answers the round's
missing-persons angle at the department level.

### Two new, distinct scam-warning threads
The ICBF's own director publicly denied the agency solicits donations for
this emergency — clarifying that role belongs to the Primera Dama's
office — after impersonation concerns emerged. Separately, a rent
price-gouging alert (citing Ley 820 de 2003) was corroborated across three
independent outlets (Red Vox, Pulzo, El Tiempo), plus a community-sourced
warning about a specific livestreaming donation-scammer, corroborated by
two independent commenters.

### Reconstruction promised, but not yet flowing
The national government announced a "second phase" of housing recovery
for Caldas (rental subsidies, utility relief) — but La Patria, Manizales'
own longtime newspaper, published a reality-check the same week: as of
their reporting, none of that money had actually reached victims yet.
Kept both sides on record rather than treating the announcement alone as
confirmation aid is flowing.

### Six new individual crowdfunding campaigns, cross-corroborated
Three were found independently by multiple agents (Mariana Montes
González's Vaki, Ana Lida Vélez Rico's Vaki — notable for explicitly
coordinating with an insurance claim to avoid double-collecting, a first
for this project's crowdfunding coverage — and Sandra Milena Rendón
Valencia's GoFundMe for her grandmother's condemned shop). Three more
came from the dedicated crowdfunding agent alone: Diana López (a
manicurist whose home was ordered demolished), Nicolás's "El Café de
Nico" (a disabled entrepreneur's coffee business), and a diaspora-
organized Vaki for three elderly Chipre sisters via a Minnesota Colombian
community group.

### New aid points (10)
2 ACOPIO status/new points (Coliseo Menor via Once Caldas — possible
overlap with the already-known Universidad de Caldas Coliseo point
flagged explicitly; VELTRA; Barón Rojo Sur, time-window flagged), 1
ALBERGUE (the Coliseos' formal shelter designation), 7 MONETARY_DONATION
crowdfunding campaigns.

### New community embeds (11)
The two scam-warning threads, the ICBF clarification, the housing-recovery
announcement and its La Patria reality-check, the zero-missing-persons
report, a Barrio Milán building-marking/demolition-code system (the
freshest find this round, ~4 hours old), a free legal-aid explainer on
reconstruction benefits, an elderly-care foundation's urgent housing
need, the Universidad de Caldas acopio point's "last day to donate"
status update, and one human-interest account from Chipre.

### Next steps (pass 47)
Continue round 4: Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas,
San José del Palmar, and Pijao remain.

## Pass 48 — round 4 continues: Armenia (2026-08-15)

Same narrow round-4 brief as passes 45-47, applied to Armenia (three prior
rounds: passes 17, 26, 35). Caught two false-"new" leads before seeding
them: Fundación Covida's Vaki campaign (already known since pass 17, just
grown modestly to $16,885/448 donors) and a third instance of a recurring
mislabeling pattern — a "Terremoto armenia, reconstruir casa" GoFundMe
whose actual home is in Calarcá, a separate municipality, already flagged
twice in passes 17 and 26.

### Armenia's first confirmed fatality
An official municipal damage bulletin (Informe Preliminar de Afectación
N.°11, corte 7am Aug 15) reports **1 fallecido in the zona Centro** plus
134 injured — the first confirmed death logged for Armenia since this
project's stage-1 research established a zero-deaths figure for the city.
Logged as a new, separate `TollRecord` row (not merged into or replacing
the prior zero-deaths record, per this project's append-only discipline).
The same bulletin gives a much more granular damage picture: 10,800
structures with some damage, 140 at collapse risk, and — notably — a full
animal-toll breakdown (223 pets reported missing, 6 reunited, several
injured/dead cats and dogs).

### A live, official scam alert
Armenia's own Secretario de Gobierno publicly warned of two active scam
patterns: people posing as rescue volunteers soliciting cash, and people
posing as damage-assessment inspectors to gain entry to homes —
independently corroborated across four separate outlets/accounts.

### Two new official aid points, one decommissioned
The city opened two new official donation points (the CAM auditorium and
the Coliseo del Sur, the latter also serving as a shelter now reported
near its 60-family capacity) — while explicitly announcing the fire
department has **stopped** accepting donations at its own facilities, so
those spaces stay clear for emergency response. Anyone still directing
donors to the bomberos needs that status change flagged.

### Cross-corroborated: a GoFundMe found by 4 of 5 agents
Cristian Marín's GoFundMe (a single father and his two children, sheltering
in a church after their building was destroyed) was found independently
by four of the five research agents — the strongest corroboration signal
of any single finding this round. Two of the new GoFundMe campaigns carry
an explicit possible-duplicate caveat against pass 17's two
unnamed diaspora campaigns, flagged for a moderator with DB access to
resolve rather than asserted either way.

### Checked, genuinely still empty or unresolved
No missing-persons resolution was found for Armenia specifically (one
still-open case, Cristian Camilo Arango Marín, is newly logged); a
"Renacer-Armenia" Vaki campaign resurfaced in search results claiming real
donor traction, but a direct page reload confirmed it's still at zero
donors and was already checked and rejected in pass 26 — the traction
claim didn't hold up.

### New aid points (9)
1 ALBERGUE (Coliseo del Sur, status-updated), 2 ACOPIO (CAM auditorium,
the Pijao-bound collection point organized from Armenia), 1 VET
(Bienestar Animal's Parque Sucre detail), 1 ACOPIO address-supplement
(Banco de Alimentos Monseñor Roberto López Londoño), 4 MONETARY_DONATION
crowdfunding campaigns.

### New toll records (2)
DEATHS_REPORTED_OFFICIAL: 1 (Armenia's first), INJURED: 134.

### New community embeds (8 of 10 attempted — 2 already on file)
The official scam alert, Cruz Roja's shelter confirmation, the full
damage bulletin, a rent price-gouging report, a missing-persons
resolution, the open Arango Marín case, an RUD/legal-rights guide, and an
awareness post on invisible ongoing damage, plus the two reconstruction-
phase explainers (Decreto 1171 legal rights, the presidential-visit/70%-
damage report) — the idempotency check silently skipped 2 of the 10
permalinks as already-seeded, but which 2 wasn't captured at seed time,
so no specific claim about which ones or why.

### Next steps (pass 48)
Continue round 4: Quibdó, Buenaventura, Popayán, Dosquebradas, San José
del Palmar, and Pijao remain.

## Pass 49 — round 4 continues: Quibdó, with a specific priority (2026-08-15)

Same narrow round-4 brief as passes 45-48, applied to Quibdó (three prior
rounds: passes 18, 27, 36) — plus a specific carryover assignment from
Cali's pass 46: dig into Congressman Óscar Benavides's earthquake-
donation-fraud scandal, since the money itself was solicited "para el
Chocó."

### The Benavides story: same complaint, much richer detail
All five agents independently confirmed this is the SAME formal Corte
Suprema complaint pass 36 already logged (Sala de Instrucción, magistrate
Francisco Farfán) — not a second scandal. What this pass adds: the
denunciante is now named (Daniel David Martínez, a law graduate, 21-page
filing), and — for the first time — the disputed account holder is named:
José Francisco Ibalde Ibarra, a Benavides-aligned political ally and
fellow congressional candidate via the same Consejo Comunitario El
Naranjo, directly contradicting his staffer's public claim that the money
went through a foundation. The complaint formally requests investigation
for estafa, captación masiva de dinero, and peculado por apropiación,
plus referral to the Fiscalía. Benavides has published no accounting —
only a defiant "matoneo judicial" framing and a verbal promise of a
future "rendición de cuentas peso por peso." The claimed total keeps
climbing: ~$300M → ~$400M → now $700M+ COP and 40+ tons. One agent
surfaced a second, differently-named denunciante (Santiago Alvarán,
@SALVARANM) in a pro-Benavides repost — genuinely unclear whether this is
the same filing described differently or a separate one; flagged as an
open question rather than resolved.

### A 5-agent-corroborated crowdfunding find
"Una Luz de Esperanza," a Vaki campaign to install 300 solar lighting
points in Quibdó neighborhoods lacking power (already delivered 150+
solar power banks), was found independently by all five research agents —
the strongest single-finding corroboration of this entire round-4 cycle
so far. It's explicitly coordinated with Quibdó's own Oficina de Gestión
Social for last-mile distribution.

### National scam alert, plus a concrete new local pattern
The Policía Nacional/Dijín issued a nationwide fraud alert about fake
donation campaigns, relevant to Chocó donors specifically given the
Benavides context. Separately, a specific new scam pattern surfaced:
calls placed from inside prisons, posing as a would-be donor or an
official, asking the target to cover "transport money" for aid that never
arrives — with four specific contact numbers named.

### Reconstruction phase, and one big pledge without a channel yet
The Chocó governor gave a detailed, on-record reconstruction interview
(search-and-rescue formally closed, a request for national structural-
engineering assistance, and a push for a Quibdó-specific rental subsidy
rather than a homogenized national rate). Separately, Grupo Argos and
Nicky Jam launched "Adopta un Hogar," a $13,000M COP reconstruction
pledge spanning Chocó, the Eje Cafetero, and Valle del Cauca — real and
heavily corroborated, but not seeded as an aid point since it has no
donor- or beneficiary-facing channel yet, only an institutional
announcement.

### New aid points (4)
"Una Luz de Esperanza" solar-lighting Vaki, a diaspora GoFundMe for one
Quibdó family's home rebuild, Fundación Sí Mujer's "Mujeres que
Reconstruyen" (spanning Buenaventura/Quibdó/norte del Valle), and a local
gas-station business's donation account (seeded at reduced confidence —
Instagram flagged the post itself as AI content, though the underlying
business/NIT is real).

### New community embeds (7)
The Benavides story's detailed update, Benavides's own rebuttal video,
the national police scam alert, the Chocó governor's reconstruction
interview, the new prison-caller scam pattern, a rescue-hero's death
(Luis Alberto "Lucho" Rivas Salguero, who died pulling a second person
from rubble), and the Adopta un Hogar announcement.

### Next steps (pass 49)
Continue round 4: Buenaventura, Popayán, Dosquebradas, San José del
Palmar, and Pijao remain.

## Pass 50 — round 4 continues: Buenaventura, the QR-link question revisited (2026-08-15)

Same narrow round-4 brief as passes 45-49, applied to Buenaventura (six
prior passes: 6, 11, 12, 19, 28, 40) — plus a specific carryover: re-check
whether Manos Visibles' QR/Nequi donation link, flagged broken back in
pass 12, has been fixed.

### Still not fixed, and now a bigger problem
Two independent agents dug into this directly. Verdict: not confirmed
fixed — a commenter from a genuinely established 23-year NGO (Corporación
Vínculos) reported the QR still fails to scan for Nequi as of roughly a
day before this check. Worse, at least three different Nequi numbers are
now circulating under the Manos Visibles name this week (their own
official one, tied to a specific 25-home rebuilding goal, plus two others
of unconfirmed origin) — a real impersonation-adjacent risk on top of the
original broken-link problem. The safer route for donors is Manos
Visibles' own PSE/credit-card portal (via web.afrus.org, linked from
linktr.ee/manosvisibles), not any single Nequi number.

### A strong new find: a real pre-existing NGO's Vaki campaign
Fundación Vanguardia Pacífica — the Buenaventura NGO behind the long-
running "Manglar Fest" cultural festival, not something spun up for the
earthquake — has an active, live-donating Vaki campaign, its director
appearing on camera personally. Found independently by two of the five
research agents.

### A tragic missing-persons resolution
Libardo Brochero Gutiérrez, 70, was pulled alive from rubble in Barrio
Rockefeller after roughly 30 hours trapped, then died of his injuries
hours later — heavily corroborated (El Tiempo, teleSUR across three
platforms, and more).

### Road isolation: still unstable, not resolved
A partial reopening of the Buga-Buenaventura corridor was reported Aug 13
(with controlled passage at some points), but posts from Aug 14-15
describe fresh landslides blocking the "vía al mar" again — the road
situation should be read as unstable, not fixed, going into this round.
Separately, a Valle del Cauca deputy stated on regional TV that aid still
isn't reaching Buenaventura's peripheral/rural municipalities specifically
— a distribution-gap signal distinct from the political-misuse warning a
government minister gave during a Barrio Lleras visit this same window
(that visit itself, and a reported robbery of someone personally
delivering aid, came up this round too, but neither agent captured a real
post permalink for either — worth a re-check in a future pass rather than
seeded on a fabricated link).

### New aid points (7)
Corporación Manglaria (ALBERGUE), two Bogotá-based collection points
shipping to Buenaventura (Espacio La Barca/Yunta Studio, LaCasita Azul),
Fundación VIP's taxi-company-backed campaign, the Manos Visibles
reconstruction-fund update (with the Nequi-confusion caveat spelled out
in full), Fundación Vanguardia Pacífica's Vaki, and a new diaspora
GoFundMe for three families' rebuild.

### New community embeds (4)
The road-isolation update, a Buenaventura-specific misdirected-donation
report, Libardo Brochero's story, and the peripheral-distribution-gap
statement.

### Next steps (pass 50)
Continue round 4: Popayán, Dosquebradas, San José del Palmar, and Pijao
remain.

## Pass 51 — round 4 continues: Popayán, thin no more (2026-08-15)

Same narrow round-4 brief as passes 45-50, applied to Popayán (four
prior passes: 9, 11, 20, 29, 41) — historically the thinnest of the
tracked cities given its MODERADA (not red-alert) severity. This round
bucked that pattern.

### A real, actively-spreading official campaign
An Alcaldía de Popayán "Centros de Acopio Popayán SOS" graphic went out
Aug 13, naming restaurants and bars (Old Jack, El Sabio, Chilango, El
Aguante, Antojadas) as donation drop-offs — and was still being actively
reshared by 7+ independent accounts, plus a satellite network of car/moto
dealerships posting their own addresses, as of this pass. Restaurants
serving as acopio points is a category this project hadn't seen before in
Popayán. Consolidated into one aid point rather than seeded as several
near-duplicates, since multiple agents kept rediscovering the same
underlying graphic. The already-known Casa de la Moneda point (Gobernación
del Cauca) turned out to be closing on the exact day of this pass and had
narrowed to medications-only — folded into the same entry as a status
update rather than re-seeded.

### Four more genuinely new municipal/institutional points
A Ciudad Moderna municipal collection point (independently corroborated
same-day by two accounts, open through Aug 21), a second Alcaldía point at
its Movilidad Segura office, a Pacto Histórico party-office collection
point (address inconsistent across sources, flagged rather than guessed
at), and — via the Cámara de Comercio del Cauca tagged by the
Archdiocese — a food-bank point distinct from the three already on file.
A 35-year-old local supermarket chain, Supertiendas San Diego, also opened
all its stores as drop-offs with an itemized needs list.

### One possible duplicate flagged
"Ikonos Centro Empresarial," tied to the first lady's national "Colombia,
Un Solo Corazón" campaign, has an address distinct from — but suspiciously
close to — "Ikonos Plaza Comercial" in the restaurant-network flyer. Both
reference an "Ikonos" complex in Popayán; could be the same site hosting
two campaigns, or a naming mix-up. Flagged for a moderator rather than
resolved.

### Confirmed, repeatedly: no Popayán-specific crowdfunding exists
The dedicated crowdfunding sweep found the same absence every prior pass
on this city has found — no GoFundMe or Vaki campaign specifically
targets Popayán. Several campaigns surfaced under "Popayán terremoto"
searches but turned out, on inspection, to be about Pereira, Venezuela's
La Guaira earthquake, or no city at all. This is now a repeatedly-
confirmed absence, not a search gap.

### New aid points (7)
The consolidated restaurant/bar acopio network, the Ikonos/Un Solo Corazón
point (duplicate-risk flagged), Ciudad Moderna, Movilidad Segura, Pacto
Histórico (address inconsistency flagged), Supertiendas San Diego, and the
Cámara de Comercio/Arquidiócesis food bank.

### New community embeds (3)
A Red Cross-backed one-day donation-sorting event at Terraplaza mall, a
needs alert for a damaged elder-care home with no concrete donation
channel, and the first lady's national campaign's Popayán visit.

### Next steps (pass 51)
Continue round 4: Dosquebradas, San José del Palmar, and Pijao remain.

## Pass 52 — round 4 continues: Dosquebradas, an unusually productive round (2026-08-15)

Same narrow round-4 brief as passes 45-51, applied to Dosquebradas (three
prior passes: 21, 30, 42), with the standing Pereira cross-check
re-applied — every finding was explicitly checked against Pereira's full
current list (69 live + 10 pending), and every agent was required to fill
in an `overlapsWithPereira` field on every single item rather than skip
it. No name/address overlap was found; dual-city-serving organizations
(Fundación Ángela Rosa, the Hemocentro del Otún blood drive) are noted as
such rather than miscredited to one city.

### A brand-new, well-corroborated shelter
Albergue Polideportivo del Campestre B — ~120 people/36 families in ~47
tents — is confirmed independently by the mayor's own account, the
municipal website, the public utility company Serviciudad, and local news,
all within a 24-hour window. A fourth shelter at La Graciela (adding 150
more spaces to the existing ~900-person network) is under construction,
not yet operational.

### A loop closed from pass 13/14
David Londoño's GoFundMe was explicitly excluded from Pereira's crowd-
funding list back in pass 13/14 because its beneficiaries live elsewhere
— this round reads the live campaign page directly and confirms exactly
where: a cousin's damaged Dosquebradas apartment, and an aunt's coffee
farm in Marsella. It belongs here. Found independently by three of five
research agents, the same as a second new campaign (Claudia Macuil's,
for her childhood block).

### First toll figures logged for Dosquebradas
An Alcaldía curfew decree (6pm-6am, Decreto 316) carried the city's first
concrete damage figures on file: 4,583 damnificado reports, 548 homes
destroyed, 13 buildings collapsed, 3,600+ properties damaged. Logged as
new `TollRecord` rows.

### A contradicted blood-donation post
Hemocentro del Otún's own post says Hospital Santa Mónica accepts blood
donations 9am-5pm — but community comments two days later say the
opposite ("no están recibiendo donaciones") and describe the center as
overwhelmed. Seeded with the contradiction spelled out rather than taken
at face value.

### New aid points (14)
2 ALBERGUE (Campestre B, La Graciela under construction), 7 ACOPIO
(municipal CAM point, Fundación Juntos Somos Más, SO KIUT, Barrio Los
Pinos, Parroquia San Marcos Evangelista replacing a damaged Pereira
Cáritas site, the Parque Valher distribution point), 2 MONETARY_DONATION
institutional channels (Cámara de Comercio, Fundación Ángela Rosa), 1
BLOOD_DONATION (status contested), 1 VET (time-boxed event), 2 new
GoFundMe campaigns.

### New toll records (4)
DAMNIFICADOS_PERSONAS: 4,583; VIVIENDAS_DESTRUIDAS: 548;
EDIFICIOS_COLAPSADOS: 13; VIVIENDAS_AVERIADAS: 3,600+.

### New community embeds (6)
A missing-persons resolution (two Argentine tourists found alive), a
Defensoría del Pueblo review of aid-distribution gaps, a Valledupar
solidarity donation drive for Dosquebradas, a DIGER structural-assessment
update, a condemned-building safety notice, and an Albergue Las Violetas
status update (open spots, a new refrigerator need with a live contact
number).

### Next steps (pass 52)
Continue round 4: San José del Palmar and Pijao remain.

## Pass 53 — round 4 continues: San José del Palmar, the epicenter (2026-08-15)

Same narrow round-4 brief as passes 45-52, applied to San José del Palmar
(three prior passes: 22, 31, 43) — the smallest, most remote tracked
town, and the earthquake's epicenter. As expected for a well-covered small
town by its fourth pass, most content was recirculation — but one real
find changed that.

### A never-before-documented official channel
The municipality's own Instagram account (@alcaldiamunicipalsjp) had
never been found in three prior rounds. It carries two dated official
communiqués showing real, measurable progress: missing persons down from
2 to 1, and the access road improved from fully cut (14 landslides,
"municipio incomunicado") to passable on one lane. The more recent
communiqué also gives this town's first precise toll breakdown — 525
families, 2,625 people affected, 40 homes collapsed, 485 damaged — logged
as new `TollRecord` rows sourced to the municipality directly (tier 1).

### A stale data conflict finally resolved
Pass 31 had flagged a discrepancy in the Valentina Jurado Vaki campaign's
total (some views showed real numbers, others showed a cached zero). This
round's dedicated crowdfunding check did a fresh, direct page reload:
confirmed real and climbing — $46,480/1,828 donors at last check to
$47,334/1,839 donors now, contributions arriving within the hour of the
check. Not a caching artifact.

### The road is open, but the town is still fragile
The Ministry of Transport announced (corroborated by Revista Semana) that
the access road has been reopened — but a same-day report describes a
pregnant woman being medically evacuated by helicopter because the town
remains functionally isolated. Both can be true: passable but still
fragile. Aid delivery has partly shifted to aerial drops with human-chain
unloading given the terrain.

### Reconstruction policy names the town explicitly
The president announced a national "Plan Marshall" for Chocó, explicitly
naming San José del Palmar (as epicenter) and Quibdó as priority
municipalities — the first concrete reconstruction-policy announcement
found for this town in any round. Separately, Girardota (Antioquia)
announced it's "apadrinando" (sponsoring) the town's reconstruction — the
same municipal solidarity pattern already seen elsewhere.

### New aid points (5)
A Cruz Roja collection point in Cartago, a one-day charity empanada sale
in Dosquebradas, a small multi-city Vaki campaign, and two Cali-based
collection points (one with a caveat that its stated deadline has likely
already passed).

### New toll records (6)
MISSING_OFFICIAL: 1 (down from 2), INJURED: 2, DAMNIFICADOS_FAMILIAS: 525,
DAMNIFICADOS_PERSONAS: 2,625, VIVIENDAS_DESTRUIDAS: 40, VIVIENDAS_
AVERIADAS: 485 — this town's first precise official breakdown.

### New community embeds (9)
The two official municipal communiqués (folded into one entry), the
Girardota sponsorship, an ICBF-impersonation scam alert, the road
reopening, the isolation nuance, the Plan Marshall announcement, an SGC
aftershock count (269 replicas), a new rural hazard report (a
dangerously-damming river in vereda Surumita), a fresh Revista Semana
on-the-ground report, and a data-journalism finding that the town is
proportionally the worst-hit municipality of the entire earthquake by a
wide margin.

### Next steps (pass 53)
Pijao remains — the final city in round 4.

## Pass 54 — round 4 closes: Pijao, a fifth pass (2026-08-15)

The final city in round 4, and Pijao's fifth overall research pass
(after the four dedicated deep passes 37, 38, 39, and 44). Explicitly
scoped as a light status-check rather than another deep dive, given how
much attention this small town has already received — more than any
other tracked city. It still surfaced real, contested developments.

### The fire situation is contested within this same round
A sitting congressman (Miguel Grisales) posted from the fire ground
today saying the blaze "continues to advance with force" and reaching
into Génova, with residents suspecting possible arson — he formally
asked Policía/Fiscalía to investigate and renewed the request for aerial
firefighting support that still hadn't arrived. A separate same-day
report claims the fire was already "extinguido." Both are logged rather
than resolved one way — this project's standing practice when sources
genuinely disagree. A same-day editorial from La Crónica del Quindío
gave the most precise figures yet (~200ha Pijao/~30ha Génova) and, via
the mayor of Génova's own on-record statement, confirms aerial support
still had not been delivered as of today — sharpening the "probably not
delivered" finding from earlier passes into an explicit, sourced, still-
unmet request. The same editorial flags a real structural gap: as of
today there is no dedicated compensation program for campesino families
who lost their harvest to the fire.

### A five-pass-standing gap finally resolved
The livestock/animal-casualty question, checked and confirmed empty
across four prior passes, has a real answer: the departmental PYBA vet
brigade treated 30 animals and rescued 6 puppies plus a pregnant dog in
vereda La Maicena. Outcome is treatment and rescue, not confirmed deaths.

### Still genuinely empty after five passes
Missing persons and Pijao-specific scam reports remain confirmed empty —
this is Pijao's most heavily researched city-specific gap, and it
continues not to produce anything, which is itself a meaningful (if
negative) finding at this point.

### New aid points (4)
Sociedad Quindiana de Ornitología + Birding & Herping (found
independently by two agents), La Cía Coffee, a multi-brand sports-
community drive outside Quindío (Xportiva/La Rueda), and a rural-Pijao-
specific collection run by a verified Armenia surgeon with "La Finca de
Ellas."

### New community embeds (7)
Both sides of the fire-status contradiction, the Bomberos' own
not-yet-full-control communiqué, FEDEGAN's new rural/livestock
engagement, the PYBA animal-rescue resolution, the Crónica del Quindío
editorial, and a new Udegerd self-report tool for damage assessment.

### This closes the fourth research round across all ten tracked cities
Pereira, Cali, Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, San José del Palmar, and Pijao have each now had a fourth
round of research on top of the original deep pass, the follow-up round,
and the third tightly-scoped round — 54 research passes total across the
whole project. Recurring throughline this round: several cities produced
real, sourced updates to standing open questions rather than just fresh
noise — Armenia's first confirmed fatality, Dosquebradas' first toll
figures and a resolved cross-referral from pass 13/14, San José del
Palmar's first-ever official municipal social account, and Pijao's
animal-casualty gap finally closing — a sign that repeated, disciplined
passes keep surfacing real signal even on cities already researched
three times over.

## Pass 55 — a fifth research round begins: Pereira (2026-08-15)

New round across all 10 cities, by user request ("keep going"). Pereira
already had four rounds (passes 13, 14, 23, 32, 45), so this pass's brief
was narrower still: hunt for what a fresh sweep finds days later, and
specifically check whether the Expofuturo controversy flagged in pass 45
developed further. Contrary to expectations of near-saturation, this
round surfaced a real, active fraud wave and a genuine escalation.

### A live fraud wave, not isolated incidents
Three independent, police-corroborated scam reports converged within a
24-48h window: a fake trapped-person alert that mobilized firefighters,
ambulances, and Defensa Civil for hours — only for the real objective to
turn out to be recovering a business's cash register; a fraudster posing
as a "Director de Sanidad" contacting affected municipios by WhatsApp;
and altered/fake donation QR codes, publicly flagged by singer Jhonny
Rivera, who is personally involved in Pereira relief. All three surfaced
within the same window and were corroborated by multiple outlets plus an
apparent Policía Nacional alert — read together, this looks like an
active fraud pattern, not scattered one-offs.

### Expofuturo: confirmed legitimate AND under a new specific allegation
Both things are true at once. The venue is confirmed still operating as
a real, bank-account-verified official acopio point run jointly with the
Cámara de Comercio de Pereira. At the same time, the political-misuse
allegation flagged in pass 45 escalated from a single anonymous TikTok
post to at least three independent Facebook pages within 12 hours, now
naming a sitting senator, María Irma Noreña, by name. Still unadjudicated
by any official body — logged as an active, developing allegation, not a
confirmed fact.

### A missing-persons case closes, another stays open
Juan Felipe Giraldo — the Hotel Dibeni case that went viral through his
father's search — was confirmed dead the day he was due to marry. A
second case, a Mexican couple (Mario Zapata and Brenda Flores) vacationing
in Pereira, remains open.

### Reconstruction financing: announced, not yet disbursed
National utility relief, a rental-subsidy program, and a Concejo-
authorized $100 billion COP infrastructure-loan reallocation have all
been announced for Risaralda/Pereira — but no source found this round
confirms any of it has actually reached a household yet. That gap between
announcement and disbursement is itself the notable finding.

### New aid points (11)
A new Army-supported shelter (address unconfirmed, flagged for
verification), two fresh local-business acopio points, a reconstruction-
focused Vaki campaign, a new international/diaspora donation channel via
Global Shapers Pereira, and six new crowdfunding campaigns — including a
genuinely novel one: a local tabloid (Q'hubo Pereira) funding physical
missing-person flyers for residents without reliable internet access.

### New community embeds (9)
Both sides of the Expofuturo story, a shelter-capacity status update, the
Giraldo resolution and the still-open Zapata/Flores case, all three new
scam reports, the reconstruction-financing status, and a structural-
danger report paired with two professionals now offering free structural
inspections.

### Next steps (pass 55)
Continue round 5: Cali, Manizales, Armenia, Quibdó, Buenaventura,
Popayán, Dosquebradas, San José del Palmar, and Pijao remain.

## Pass 56 — round 5 continues: Cali (2026-08-15)

Same narrow round-5 brief as pass 55, applied to Cali (four prior rounds:
15, 24, 33, 46). Genuinely productive despite the depth of prior
coverage — a real toll-figure convergence, a fully-named closure of a
tracked case, and a concrete (if still pre-disbursement) reconstruction
figure.

### Death toll converges upward
The Alcaldía-vs-CPI split tracked since pass 46 (104 vs 110) has
resolved — not by one side catching up to the other, but by both being
overtaken. The Alcaldía's own Aug 15 balance now reports 111 fallecidos,
77 desaparecidos (down from 115 as bodies were identified), and 1,416
heridos, independently corroborated by multiple outlets. Logged as new
`TollRecord` rows.

### The Saavedra triplets case, now fully named
Already closed in pass 46, this round surfaced the complete detail:
Isabella Saavedra Caicedo — the third and last missing sister — was found
dead in the Edificio María Alvira alongside her sister Sofía and both
parents, confirming four family deaths. Ana María remains the sole
survivor, recovering post-surgery.

### Reconstruction: a real number, still no money moving
Mayor Alejandro Éder gave Cali's first concrete reconstruction cost
estimate — ~$10 billones COP over ~3 years — and formalized the
estampillas funding request first flagged in pass 46 into a specific
$350,000 million COP ask to the national government. But a sitting city
councilwoman publicly demanded the Secretaría de Vivienda speed up
subsidy delivery, and a separate report from Comuna 18 describes families
still sleeping in the street with only a census visit so far — the
announcement-to-disbursement gap already seen in other cities' passes
holds here too.

### A genuine contradiction flagged, not resolved
Two agents independently reported the same Vaki URL
(reconstruyamos-hogar) with two different beneficiary families and
organizers. Rather than pick one, both descriptions are recorded in the
aid point's note with an explicit flag for a moderator to check the live
page directly before approving — the page's content may have changed
between checks, or one agent copied the wrong URL.

### New aid points (9)
Three new official Alcaldía-run collection points (including a new
24-hour site), a youth-sports-club acopio point, and five new
crowdfunding campaigns — one found independently by four of the five
research agents.

### New toll records (3)
DEATHS_REPORTED_OFFICIAL: 111, MISSING_OFFICIAL: 77 (down from 115),
INJURED: 1,416.

### New community embeds (7)
The reconstruction-financing announcement, a fake-census-taker scam
alert, a new Centro Cibernético Policial fraud warning, the subsidy-
not-yet-disbursed status update, a rumor-correction (a building
incorrectly believed to be an official acopio site), the full Saavedra
case closure, and a volunteer-intake status update to the Ciudadela
Petronio Álvarez hub.

### Next steps (pass 56)
Continue round 5: Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, San José del Palmar, and Pijao remain.

## Pass 57 — round 5 continues: Manizales, a Homecenter correction (2026-08-15)

Same narrow round-5 brief as passes 55-56, applied to Manizales (four
prior rounds: 16, 25, 34, 47), plus a specific carryover: chase the
Homecenter donation-reselling controversy other cities' rounds this week
found trending and had traced to Manizales.

### The Homecenter story doesn't hold up as Manizales-specific
All five agents dug into this. Verdict: genuinely contested, not
confirmed. A Manizales news outlet did air its own on-camera
clarification from a real local Homecenter employee — but tracing the
original viral video's hashtags and reposts points instead toward
Antioquia (San Pedro de los Milagros/Medellín), and one post attributes
it to Pereira. Most likely explanation: a national, multi-city
controversy that Manizales media happened to amplify hardest, not an
incident specific to this city. Documented as an open contradiction
rather than asserted either way — worth correcting the assumption from
whichever earlier pass first routed this story here.

### The real confirmed development: subsidy money is now flowing
The "second phase" rental-subsidy program pass 47 flagged as announced-
but-not-flowing has genuinely started disbursing. $300,000 COP/month for
renters (the mayor is working to extend it from 1 to 3 months), 3 months
for on-site property owners, paid out via Cruz Roja pickup after an SMS
notice — plus a new price-gouging hotline threatening Fiscalía/Sijín
referral.

### Donations ran dry, a new drop-off point opened
The Alcaldía announced general donations exhausted after distributing
2,800 mercados, and reopened collection at Coliseo Menor (distinct from
the Coliseo Mayor shelter) with a detailed itemized needs list — found
independently by all five research agents, the strongest single-finding
corroboration of this round-5 cycle so far.

### Two "new" campaigns turned out to already be seeded
The crowdfunding agent flagged two campaigns as new, but cross-checking
against the wiki caught both: one (Sandra Milena Rendón Valencia's
workshop rebuild) is very likely the identical campaign already seeded
under Pereira in pass 45, and the other (Mariana Montes González's Vaki)
was already seeded for this same city in pass 47. Neither was re-seeded.

### New aid points (3)
The Coliseo Menor collection point, a new official monetary fund
(Fondo Solidario Comunitario, backed by the mayor, the Cámara de
Comercio, and Cruz Roja), and a Vaki campaign found independently by
three of the five agents.

### New community embeds (6 of 7 attempted — one already on file)
Once Caldas players volunteering at the new collection point, the
rental-subsidy disbursement update, the contested Homecenter story, a
negative shelter-conditions report, a personal-account caution (a food
brigade soliciting to an individual's bank account), an individual family
appeal, and a probable-scam pattern (one creator soliciting to four
different personal numbers under four different names).

### Next steps (pass 57)
Continue round 5: Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas,
San José del Palmar, and Pijao remain.

## Pass 58

Round 5 continues: Armenia, a fifth pass on the city most exhaustively
covered so far (four prior rounds — 17, 26, 35, 48). Yield was mostly
status confirmation this time, and dedup did a lot of the work: five
"new" finds turned out to already be on file (Centro de Convenciones de
Armenia from pass 17, OVNI Club from pass 26, Fundación Covida's Vaki
from pass 17/35, and two GoFundMe campaigns — Karol Sofia Perdomo Muñoz
and Jenny Fabiana Salazar Londoño — both from pass 48), plus a sixth
"Punto de acopio para Pijao" that matched pass 48's entry down to the
exact address and Instagram permalink. None re-seeded.

### Coliseo del Sur: still at the edge, not over it
The shelter holds steady at 56 families (150-200 people), unchanged from
pass 48's near-capacity reading. The Alcaldía is now weighing a second
shelter. Rents nearby have spiked to ~$2.5M COP/month — the first thread
in a pattern that shows up twice more this round.

### A rent-gouging pattern, corroborated twice
Landlords hiking prices up to 50% on displaced families looking for
housing was flagged once already (pass 48, a single Instagram post). This
round an independent Facebook source (citing local outlet Finito) reports
the same phenomenon with its own figures and its own citable link — two
separate platforms now on record for the same exploitation pattern.

### A missing-persons case turns genuinely contested
Cristian Camilo Arango Marín's case, open since pass 48, does not resolve
cleanly this round. The family's own Facebook channel (already on file,
same URL as pass 48) was still actively soliciting help. A crowdsourced
tracker, encontrados.co, shows a "La tengo conmigo" (found) entry dated
Aug 15. A second crowdsourced tracker, colombiatebusca.com, still listed
him "Por localizar" as of hours before this pass. Three of five agents
read this three different ways — one called it resolved, one called it
still open, one called it genuinely mixed. Recorded as an open
contradiction, not asserted either way; flagged for whoever holds contact
with the family.

### Death toll: a number that doesn't hold up to city-level scrutiny
Multiple sources this round cite "tres fallecidos en el Quindío" — up
from the 1 dead / 134 injured Armenia-specific figure confirmed in pass
48. But it's a department-wide figure, and two of five agents explicitly
rejected it as unattributable to Armenia specifically (Calarcá, Quimbaya,
and Circasia all sustained damage too). Not logged as a TollRecord;
recorded as a flagged social post instead, pending an Armenia-specific
official source.

### New aid points (4)
A named foundation running a children's-and-pets collection drive with a
bank account on file, a new individual Vaki campaign, and two new
diaspora GoFundMe campaigns (Salt Lake City and Melbourne organizers)
neither matching anything in the prior four rounds' history.

### New community embeds (6 of 7 attempted — one already on file)
The Coliseo del Sur status update (folded in with an individual case,
William Uriel Cardona, found in the same post's comments), the
second-source rent-gouging report, a new residential complex (Las
Brisas) with families still in tents, a fresh legal explainer on
accessing the rental subsidy, a new official debris-disposal measure
starting Aug 16, the flagged-not-confirmed department death toll, and a
personal-account caution (a toy/school-supplies drive run through a
private Nequi account).

### Next steps (pass 58)
Continue round 5: Quibdó, Buenaventura, Popayán, Dosquebradas, San José
del Palmar, and Pijao remain. Separately: Ibagué/Tolima is being added
as an 11th tracked city (compounding earthquake + wildfire crisis,
confirmed via governor/mayor-level official sources and a named
reconstruction fund — same bar that justified Pijao), with a dedicated
research pass to follow.

## Pass 59

Ibagué, Tolima added as an eleventh tracked municipality — the same bar
Pijao cleared, at the user's request. Ibagué/Tolima had come up in this
project's research three times before (single-source, ayudaspereira.com
signals) and was explicitly rejected each time as too thin. This time
the evidence is different in kind, not just volume: Tolima's governor,
Adriana Magali Matiz, declared a department-level crisis and announced
the Fondo Mixto de Reconstrucción del Tolima, explicitly covering both
earthquake and wildfire losses. The department has 46 municipios en
alerta roja — second-highest in the country — with 10,000+ hectares
burned and 29-33 active fires as of Aug 15. Ortega alone reports 800+
familias damnificadas (mayor on record); San Luis has 5,000 hectares
burned and 10 homes damaged. National response has mobilized: Army
Blackhawks, the Fuerza Aeroespacial, and a Bomberos Bogotá brigade
redirected to Ortega.

Ibagué itself isn't just adjacent to the fire crisis — it has confirmed
quake-specific damage of its own: structural cracks reported at the
Palacio de Justicia, multiple landslides in the Cañón del Combeima, and
ash/smoke cover over the city heavy enough that masks are being
recommended. As with Pijao, the wildfire wave is not confirmed to be
earthquake-triggered by any source found (dry season and wind are the
cited factors) — framed in `alertNote` as a compounding, concurrent
disaster, not a documented consequence of the quake.

Added: Department row for Tolima (DIVIPOLA `73`) and Municipio row for
Ibagué (DIVIPOLA `73001`, population 542,046 per 2023 DANE-cited
figure via Wikipedia, coordinates 4.4378, -75.2006), `severityLabel:
ALTA`, `redAlert: true`. Two sources on file (Infobae, Caracol Radio).
No aid points, needs, or toll figures seeded yet — this pass only
establishes the city itself, matching how Pijao's own base municipio
script preceded its deeper research passes. A dedicated 5-agent research
pass (X, Instagram, Facebook, TikTok, crowdfunding) follows next.

### Next steps (pass 59)
Run Ibagué's dedicated research pass. Then resume round 5: Quibdó,
Buenaventura, Popayán, Dosquebradas, San José del Palmar, and Pijao
remain.

## Pass 60

Ibagué's dedicated 5-agent research pass. Four of five agents (X,
Instagram, Facebook, crowdfunding) finished; the TikTok agent hit a
session-wide capacity limit mid-run and did not complete — deferred to a
follow-up pass. The four that finished corroborated each other heavily:
the same handful of official acopio points turned up independently
across three or four agents apiece, unusually strong cross-sourcing for
a first pass with no prior-round baseline to build on.

### A compounding crisis, confirmed at street level
Beyond the department-wide fire numbers already known from pass 59,
Ibagué has its own quake-specific damage: 48 families preventively
evacuated from a residential tower (Conjunto Alta Vista) after cracks
and material detachment — though the mayor's office found no structural
compromise to the building overall — plus ~32 property inspections
citywide and structural cracks at the Palacio de Justicia bad enough
that Asonal Judicial held a protest and hearings were suspended. None of
these figures were forced into a TollRecord: they don't map cleanly onto
this project's toll metrics without overstating what's actually
confirmed, so they're documented here in prose instead — the same
discipline applied to Pijao's hectares-burned figures back in pass 37.

### Six confirmed acopio points, no confirmed shelter
The city's aid infrastructure is real and multiply-sourced: the
Alcaldía's Parque Deportivo hub (which explicitly redistributes aid
onward to San Luis, Chocó, Cali, and Pereira), the Arquidiócesis's Banco
de Alimentos, the Gobernación del Tolima's own collection point, a mall
(La Estación) extending its hours through the weekend, and two
Presidencia-backed points (Casa Loma, Plazas del Bosque) tied to a
primera dama visit. What's notably absent: no dedicated, verified
albergue (shelter) for Ibagué's own displaced residents was found in
this pass — the city's residential damage so far has been handled via
evacuation-and-inspection rather than an organized public shelter.
Flagged honestly as a gap, not papered over.

### A donor caution: a shelter that probably isn't real
Two of the four agents independently flagged a supposed collection point
at an "Instituto Tecnológico Gustavo A. Madero," reproduced identically
across several aggregator pages. It uses Mexican address conventions
("colonia," "Avenida ... Poniente") foreign to Colombia, and doesn't
appear anywhere on the Alcaldía de Ibagué's own verified channels — very
likely a recycled misinformation template, possibly reused from an
unrelated Mexican campaign. Not seeded as an aid point; flagged here so
nobody sends donations there.

### A logistics gap worth surfacing
Multiple sources converge on a real bottleneck: citizen donations have
piled up faster than the city can move them. El Irreverente Ibagué's
on-the-ground reporting from the Parque Deportivo itself put it bluntly —
plenty of goods collected, not enough vehicles to get them to the
affected municipios.

### New aid points (8)
Parque Deportivo, Banco Arquidiocesano de Alimentos (goods + a named
bank account), Gobernación del Tolima's own point, La Estación mall,
Casa Loma, Plazas del Bosque, the volunteer fire brigade's support/
volunteer call, and two unaddressed-but-official points in barrio
Ambato.

### New community embeds (3)
The transport-logistics gap, the Palacio de Justicia structural-safety
concern, and a real slice of local culture — the weekly "Jueves de
Aguapanelazo" community gathering asking attendees to bring a donation
alongside the usual hot drink and bread.

## Pass 61

Round 5 resumes: Quibdó — but only partially. Four of the five agents
(X, Instagram, Facebook, TikTok) hit the same session-wide capacity
limit that caught Ibagué's TikTok agent, and failed outright before
producing any output. Only the crowdfunding agent completed, and — with
WebSearch also exhausted — it fell back to a broad browser sweep that
ended up covering more ground than its label suggests.

### Hospital San Francisco de Asís: not better, arguably worse
The one real development this pass: a second aftershock (M4.2, Aug 14)
forced another partial evacuation — patients moved outside under
donated tents, a corridor closed, ICU patients kept inside for
life-support dependency. More significant than the evacuation itself:
the Superintendencia de Salud has since formally intervened the
hospital, naming hospital manager Ovidio Garrido as the official agente
interventor, with the ER reported at 245-340% over capacity depending on
source. The Gobernación del Chocó announced a $1,200 million COP
investment for the ER — but Minsalud at the national level has publicly
disputed how bad the Gobernación says things actually are, an intra-
government disagreement about the severity itself. Net read: the
hospital is still operating, still not stabilized, and now under formal
intervention — a step further into crisis since pass 49, not a recovery.

### Everything else: no material movement
The surviving agent checked the Benavides fraud scandal (he's now
publicly promised a "Veeduría Ciudadana" citizen oversight committee,
still no actual accounting published, no procedural advance beyond the
original Corte Suprema complaint), new scam reports (none Quibdó-
specific beyond Benavides), subsidy disbursement (announced nationally,
private aid trickling in, government subsidy cash still not confirmed
flowing), the death toll (Chocó's search-and-rescue phase was formally
declared concluded Aug 13; toll holds around 13 dead / ~131 injured,
unchanged), and three already-seeded GoFundMe campaigns plus the Vaki
solar-lighting campaign (all still open, funding totals checked, no new
campaign cleared the trust bar — one candidate was rejected as visibly
AI-generated boilerplate with a leftover chatgpt.com tracking parameter
pasted into the story text).

### New community embeds (1)
The Hospital San Francisco de Asís intervention update.

### Next steps (pass 61)
Retry Quibdó's four failed angles (X, Instagram, Facebook, TikTok) once
capacity resets — logged, not abandoned. Then continue round 5:
Buenaventura, Popayán, Dosquebradas, San José del Palmar, and Pijao
remain.

## Pass 62

The capacity limit cleared. All four of Quibdó's dropped angles (X,
Instagram, Facebook, TikTok) completed cleanly on retry, and turned up
the most consequential finding of round 5 so far.

### A donation channel from pass 18 is now in question
The hospital's own official account posted an anti-fraud notice naming
ONE authorized donation account (a specific Banco de Bogotá number) and
stating explicitly that no other account, phone number, or intermediary
is authorized. A separate Facebook post independently shows a graphic
impersonating the hospital, stamped "FALSO" by whoever posted it as a
warning. Taken together with Facebook's own "AI content" flag on the
posts this project's pass 18 originally cited for the "vía Fundación
Empresas Conscientes" channel, there's now real reason to question that
older channel. It hasn't been deleted — this project never overwrites
prior records — but it's flagged here and in the new seed script for a
moderator to weigh against the hospital's current statement before
approving anything through it. This is the same kind of correction
Manizales's Homecenter story got in pass 57, except this one involves an
actual live donation account, not just a rumor.

### The Benavides case reaches the Corte Suprema
What was a "promised Veeduría Ciudadana" as of pass 49/61 has become a
formal Corte Suprema investigation, filed by a named complainant
demanding full banking traceability of the reported $300M+ COP raised.
Benavides is calling it "matoneo judicial" and says the funds run
through a foundation structure now under audit. A watchdog organization
(Red de Veedurías de Colombia) confirmed the investigation independently
and is preparing its own disciplinary action.

### A second, distinct scam vector
Separate from both the Benavides matter and the fake hospital flyer:
singer Jhonny Rivera publicly warned about altered/fake QR codes being
used to divert earthquake-relief donations. Not Quibdó-exclusive, but
relevant to anyone donating in the city.

### A hopeful sign on the broken blood bank
Pass 18 documented Quibdó's hospital as lacking a functional blood bank
since the quake — its refrigeration unit was broken. This pass caught
a very fresh (posted within the hour) report that a specialized
blood-storage refrigerator was just delivered by a private foundation.
A slightly older post (3 days) still described the blood bank as
non-functional, so this isn't confirmed resolved yet, but it's the
first sign of movement on a problem that's been open since the first
research round on this city.

### New aid points (5)
The hospital's single authorized donation account, a Gobernación del
Chocó collection point, a humanitarian logistics hub at a former
Postobón warehouse, a time-bound church collection drive, and the
Alcaldía de Quibdó's own reconstruction fund (cash plus hardware-store
vouchers for rebuilding materials) — distinct from the Diócesis's
existing food bank.

### New community embeds (8 of 9 — one already on file)
The hospital equipment appeal, the blood-fridge delivery, a volunteer
group unloading aid trucks, the fake-flyer scam warning, the Benavides
Corte Suprema escalation, the watchdog organization's confirmation, the
QR-code fraud alert, and a still-no-blood-bank report from three days
prior — plus a Chocó-native creator's widely-shared post on the region
feeling overlooked next to Manizales, Pereira, and Cali despite being
closer to the epicenter.

### Next steps (pass 62)
Continue round 5: Buenaventura, Popayán, Dosquebradas, San José del
Palmar, and Pijao remain.

## Pass 63

Round 5 continues: Buenaventura, a fifth pass on a city with seven prior
passes on file. Heavy dedup again — three of the round's five "new"
leads (the Fundación Vanguardia Pacífica Vaki campaign, LaCasita Azul,
FOCUSA) turned out to already be seeded, one of them twice over. None
re-seeded.

### The Manos Visibles impersonation risk gets worse, not better
Pass 50 flagged this org's QR/Nequi donation link as broken, with "at
least three" unauthorized Nequi numbers circulating under its name. This
round confirms the link is still broken — comments as recent as four
hours before this pass — and the number of unauthorized Nequi numbers in
circulation has climbed to at least six, spanning multiple accounts,
including one visibly corrupted link variant. The organization's real,
legitimate channel hasn't changed: web.afrus.org via linktr.ee/
manosvisibles (PSE/credit card) — that's the one to steer donors toward,
not any Nequi number claiming the name. On a more positive note, Manos
Visibles separately confirmed (via Cambio, a mainstream outlet) it's
formally launched a named reconstruction fund and reports 25 of a
100-home recovery goal reached — genuine progress, just not enough to
resolve the donation-channel confusion around it.

### Two new, distinct scam patterns
"Buenaventura Renace," a personal Facebook profile under a mismatched
display name, is soliciting donations to a US Bank of America account
and a Houston-area Zelle number — a materially different and more
concerning pattern than the Nequi confusion, since it routes a Colombian
disaster-relief appeal through hard-to-trace cross-border channels with
no named backing organization. Separately, a local classifieds account
warned that people are impersonating a shelter called "Albergue de
Rita" to solicit money.

### Road corridor: closed again, toll: still murky
The Buenaventura–Loboguerrero corridor is confirmed closed for a second
consecutive day (fresh landslide plus a same-day traffic accident),
continuing the reopen-then-reclose pattern already tracked since pass
40. No individual post permalink was captured for this, so it's recorded
here rather than as a database row. Same treatment for the death toll:
national figures keep climbing, but Buenaventura-specific numbers are
wildly inconsistent across same-day local sources (one citing 26 dead /
433 injured, another 10 dead / 174 injured / 3 missing) — not clean
enough to log as a toll record, so flagged here for a future pass to
pin down against an official source.

### New aid points (2)
A transport company's collection point with a concrete address and
active real-name commenters, and a streamer-run donation warehouse tied
to two identifiable public figures currently in the city.

### New community embeds (6)
The Manos Visibles impersonation-risk update (merged with the freshest
confirmation that the link is still broken), the two new scam warnings,
a compelling on-the-ground report of houses still collapsing in barrio
Alberto Lleras Camargo, the Interior Minister's request for donated data
plans for 2,800 displaced schoolchildren, and a community leader's
sharply critical characterization of the government response (recorded
with an explicit caveat that its literal claim — people still under
rubble — is a rhetorical characterization, not a verified rescue report).

### Next steps (pass 63)
Continue round 5: Popayán, Dosquebradas, San José del Palmar, and Pijao
remain.

## Pass 64

Round 5 continues: Popayán, the thinnest-covered tracked city, and this
round proves the point definitively. All five agents surfaced aid-point
candidates, and every single one traced back to something already on
file: Casa de la Moneda (seeded pass 20, updated twice since — this
round's "closing today" detail is a fact pass 41 already recorded), the
Hogar San Vicente de Paúl elder-care home (pass 20/29/51), the Hospital
San José blood-donation drive (pass 20, down to the identical Instagram
permalink), the Alcaldía's Secretaría General collection point (pass 41
explicitly logged it as new back then), and the Arquidiócesis/Cámara de
Comercio food bank (pass 51). Zero new aid points this round — a
legitimate, honest result after five rounds on a city this size, not a
gap in the research.

### Crowdfunding: still nothing, five rounds running
Every agent re-confirmed it independently: no Popayán-specific GoFundMe
or Vaki campaign has ever existed, across five consecutive research
rounds. Vaki's own search returns "no encontrada" for the city by name.

### The toll holds at zero
Popayán city itself continues to report zero confirmed deaths or
injuries from the earthquake — material and structural damage only —
unchanged across all five rounds, even as the national toll keeps
climbing.

### A case closes
Pablo Rivera Avirama, a Popayán native reported missing at Pereira's
airport right after the quake, has been confirmed dead; his funeral was
held roughly two days before this pass. Not counted in Popayán's own
zero-toll figure since he died outside city limits, but a real
Popayán-linked loss worth recording.

### New community embeds (2)
A completed radio-led donation drive (15 tons dispatched to northern
Valle del Cauca — informational, not an active channel for new donors)
and Pablo Rivera Avirama's case resolution.

### Next steps (pass 64)
Continue round 5: Dosquebradas, San José del Palmar, and Pijao remain.

## Pass 65

Round 5 continues: Dosquebradas. This round's five agents found
dosquebradas.gov.co's own press office newly active, which surfaced a
lot of real detail — but also caused heavy rediscovery under different
phrasing: the "Hospital Móvil de Campaña" is the same field hospital
seeded in pass 42, "Centro Vida Violetas de Frailes" is the same
shelter as pass 42's "Las Violetas," and both the La Graciela 4th
shelter and the Plazoleta del CAM acopio point are already on file from
pass 52. None re-seeded — their fresh operational detail is folded in
below instead.

### Campestre B is full — the network has grown to absorb it
The original shelter has reached capacity and stopped taking new
arrivals as of Aug 14. Families are now routed to Las Violetas, and a
genuinely new third site — Centro Vida José Argemiro Cárdenas, Bosques
de la Acuarela — is queued to open once Violetas fills. Combined
capacity across the three running shelters: ~900. The long-known 4th
shelter in La Graciela remains under construction, not yet open.

### A serious allegation attached to that same neighborhood
La Graciela — where the 4th shelter is being built — is also the site
of a heavily-engaged (15K+ likes) denuncia: families say a named
contractor is demolishing their earthquake-damaged homes without
letting them retrieve belongings, allegedly against the regional
environmental authority's technical recommendations. One-sided and
unverified, but real enough in local visibility that anyone directing
donors or volunteers to that area should know about it.

### First-ever city-specific scam reports and death toll
Across all five research rounds, this is the first pass to surface a
donation scam targeting Dosquebradas specifically — a homeowner in La
Capilla found strangers photographing her destroyed house and falsely
telling people her family was sheltered elsewhere, soliciting Nequi
donations in her name. A second, less-verified allegation names a
group in Frailes — the same neighborhood as the real Las Violetas
shelter — as exploiting confusion with the legitimate site. Also a
first: a Dosquebradas-specific death toll (10 fallecidos) from a local
news page, whose adjacent family/shelter figures matched the official
municipal count closely enough to lend it some credibility — but the
death figure itself couldn't be confirmed against an official source,
so it's recorded here, not logged as a toll record.

### An open displacement situation
At the Portal del Parque residential complex, one tower collapsed
completely and three more have severe structural damage. The whole
complex was evacuated, and dozens of families are still waiting for
authorization to re-enter and retrieve belongings — not a one-time
rescue story, an ongoing situation.

### New aid points (4)
The third shelter (Centro Vida José Argemiro Cárdenas), and three new
crowdfunding campaigns — one clean Vaki campaign, and two GoFundMe
campaigns carrying an explicit moderator caveat since their titles or
adjacent text reference "Pereira" even though their addresses and body
text are Dosquebradas-specific (the standing Pereira/Dosquebradas
cross-check discipline applied throughout, per pass 21 onward).

### New community embeds (6 of 9 — three already on file)
UNGRD's tent/blanket delivery, the shelter-network status change, the
flagged-not-confirmed death toll, the two new scam reports, the La
Graciela demolition denuncia, the Portal del Parque displacement, and
two open missing-persons cases (Jairo Aldana, Nicolás Díaz — both
carrying their own caveats about AI-flagged flyer graphics and
cross-city location-tag ambiguity).

### Next steps (pass 65)
Continue round 5: San José del Palmar and Pijao remain.

## Pass 66

At the user's request, completed Ibagué's first deep research pass by
filling the TikTok angle that hit a session capacity limit back in pass
60. Confirms the pass-60 gap still stands: no dedicated albergue for
Ibagué's own displaced residents exists, and no Ibagué-targeted scam or
missing-persons case was found anywhere on the platform.

### An active, urgent, in-city fire — not the San Luis mutual-aid story
Separate from Ibagué's already-documented firefighting deployment to
neighboring San Luis, this pass caught real-time footage of an active
wildfire inside Ibagué itself, in barrio Picaleña, with an on-screen
urgent call for firefighter support.

### A reconstruction-safety flag worth watching
A credible local investigative account (El Olfato) reports new building
permits in Ibagué are being evaluated under medium seismic-hazard
parameters, despite a technical study recommending high-hazard
conditions — partly due to the Falla de Ibagué fault running through
the city. Not an aid point, but a real development for anyone tracking
the reconstruction phase here.

### New aid points (1)
A university collection point (Universidad del Tolima), flagged medium
confidence since it comes from a resident's personal video rather than
an official university channel.

### New community embeds (7)
The Picaleña fire, the San Luis firefighting mutual-aid deployment (an
official emergency-reporting line included), a rural vereda not
surfaced in pass 60 (Charco Rico Alto), the seismic-permitting story,
and two human-interest dispatches from El Olfato (a two-track municipal
response in El Vergel/Boquerón, and emerging solidarity in barrio
Grisales de Quimbaya).

### Next steps (pass 66)
Continue round 5: San José del Palmar and Pijao remain.

## Pass 67

Round 5 continues: San José del Palmar, the earthquake's actual
epicenter but a small, remote town whose news well has thinned
noticeably across five rounds. This round's five agents converged
heavily on the same handful of stories — a sign of genuine confirmation
rather than a gap in coverage.

### Status holds steady, with one contested claim
The town's own official figures are unchanged from pass 53: still 1
person missing (active search), still 2 injured / 0 dead, still passable
on one lane only. One low-engagement resident post claims the road has
"totally collapsed" again — directly contradicting the more recent,
more authoritative official communiqué. Recorded as a contested,
unconfirmed claim rather than either accepted or dismissed.

### A first: this town's own scam report
Across five research rounds, this is the first scam alert to reach San
José del Palmar's own community channels specifically — a national ICBF
impersonation warning (fraudsters posing as the child-welfare agency to
solicit cash "donations") shared directly into the town's Facebook news
group.

### Solidarity and a departmental reconstruction plan
Girardota, Antioquia announced it's "adopting" the town, channeling
local festival proceeds toward its reconstruction. Separately, the
president announced a special reconstruction manager and a proposed
"Plan Marshall" for Chocó — department-wide, not town-specific, but
explicitly framed around this epicenter.

### New aid points (1)
A monetary-donation channel (Fundación Serraniagua, via a Cali business
coordinator) that serves both El Cairo, Valle and San José del Palmar —
its physical collection point already closed, but the account channel
remains open.

### New community embeds (5)
The official Aug 13 damage communiqué, the ICBF scam alert, Girardota's
solidarity gesture, the Chocó reconstruction-manager announcement, and
the contested road-status claim. The Valentina Jurado Vaki campaign
(tracked since pass 22) ticked up to $47,579 from 1,846 donors and is
now in its final days before an Aug 19 close.

### Next steps (pass 67)
Continue round 5: Pijao remains — the last city in this round.

## Pass 68

Pijao's sixth research pass, and the final city in round 5. Heavy
dedup: three of this round's four "new" aid-point leads — the MMQ
"Pijao Nos Necesita" Nequi drive, the Sociedad Quindiana de Ornitología
campaign, and Pijao Trail's farm-visit solidarity effort — all turned
out to already be seeded across passes 37c, 54, and 38b respectively.
Re-confirmed, not re-seeded.

### The contested wildfire status, finally resolved
Pass 54 left the fire's status genuinely split — a congressman saying
it "continues to advance with force," a separate report claiming it was
extinguished. Neither was quite right. The original zone (veredas
Sinabrio and La Maicena) saw a real partial-containment win around Aug
13, but a separate front in vereda El Jardín stayed active, and by Aug
14 the whole complex had reignited and spread across the municipal line
into Génova: ~200 hectares in Pijao, ~30 in Génova, one unoccupied house
destroyed, crews reduced to garden hoses because fire trucks can't
reach the terrain. A sitting congressman posting from the fire ground
the morning of this pass (Aug 15) confirms it's still not out — this is
now a two-municipality emergency, worst around Aug 13-14 but not
resolved.

### One genuinely new animal-welfare responder
Fundación SOS Internacional launched a specialized animal-rescue unit
("ARCA") distinct from the same foundation's human-medical brigade
already on file — 27 pets and 3 wildlife animals treated in its first
intervention, coordinated with municipal Gestoras Sociales.

### Six consecutive null results, and that's fine
Missing persons and Pijao-specific scam reports have now been checked
six times running and remain genuinely empty — an expected, honest
result for a town this size, not a coverage gap.

### New aid points (1)
Fundación SOS Internacional's ARCA animal-rescue unit.

### New community embeds (3 of 6 attempted — three already on file)
A congressman's on-the-ground confirmation the fire is still burning,
formal Army deployment to the firefighting effort, the mayor's partial-
containment announcement (with the caveat about El Jardín), the most
detailed field report of the round (La Crónica del Quindío), the
volunteer fire brigade's own "not yet total control" communiqué, and a
volunteer's first-hand account of being forced back by smoke.

### Round 5 complete
All ten originally-tracked cities plus Ibagué have now had a fifth (or,
for Ibagué, a first complete) research pass. Recurring themes across the
round: donation-channel impersonation risk showing up independently in
multiple cities (Manos Visibles in Buenaventura, the hospital-flyer
scam in Quibdó, ICBF impersonation reaching San José del Palmar), heavy
but healthy dedup as repeat rounds hit their limits in smaller cities
(Popayán, San José del Palmar, Pijao), and two genuinely new findings
outside the original ten-city scope — Ibagué/Tolima's addition as an
11th tracked city, and its own dedicated first research pass.

## Pass 69

Round 6 begins, opened by the user flagging a "huge update today."
Pereira, first in rotation. The sources bear it out — dateline moved to
Aug 16, and this pass turned up real, substantive movement rather than
the thinning returns later rounds sometimes produce.

### A genuinely new official acopio network
An official 7-point Alcaldía collection network (Consota, Perla del
Otún, El Remanso, Kennedy, and three "Café"-branded points) surfaced via
a DANE Colombia government graphic. One agent flagged suspicion it might
already be on file — checked directly against all five prior Pereira
rounds' seed history and confirmed genuinely new. All seven seeded with
full addresses.

### Expofuturo escalates, again
What was "a sitting senator named" as of pass 55 is now a direct
allegation that Senator María Irma Noreña — the mayor's wife — "took
control" of donated aid at the Expofuturo center, conditioning release
on her authorization. A journalist has publicly called for a
Procuraduría investigation; none has opened yet, and a counter-post
urges caution that nothing has actually been proven. Recorded as
contested, not established fact.

### Three deaths, one contested robbery, one reconstruction push
A third named victim (Juan Fernando Rodríguez Álvarez) was confirmed
dead at the same Hotel Dibeni collapse that closed the Juan Felipe
Giraldo case in pass 55; a Mexican couple (Mario Alberto Zapata Verdier,
Brenda Eloísa Flores Reyes) remains missing from the same hotel, with
Mexico's embassy now involved. A new missing-persons case (Frandiney
Noreña, no relation to the senator) opened. A viral, contested claim
that fake "Topos" rescuers looted downtown businesses is recorded with
its own dissenting comment rather than treated as fact. On reconstruction:
the mayor redirected festival funds to a $500K COP/month rent subsidy
plus seed capital for informal vendors, the national government is
studying a rental-price freeze, and the DNP estimates rebuilding Pereira
could cost over $10 trillion pesos.

### Toll: still not converging
Pereira-specific death/injury figures ranged from 67 to 94 dead
depending on source and hour this pass — genuinely inconsistent, not a
single agent's error. The two most-corroborated numbers (94 dead / 259
injured, from an X post and La Patria independently) are documented
here rather than forced into the toll history.

### One exclusion worth naming
A crowdfunding agent surfaced the Óscar Benavides Corte Suprema fraud
complaint as if new — it's Chocó/Quibdó's story, already tracked there
since pass 49, not Pereira-specific. Excluded from this pass.

### New aid points (15)
The 7-point official acopio network, a community-organized collection
point in Barrio Providencia, an overwhelmed improvised shelter at Parque
La Libertad, a business-run collection point, an animal shelter
displaced from its own building, a veterinary feeder-point network, and
three new crowdfunding campaigns (two GoFundMe, one Vaki).

### New community embeds (9)
The Expofuturo escalation, the DNP cost estimate, the Mexican couple's
case, Frandiney Noreña's case, the third Hotel Dibeni victim, the
contested Topos looting claim, a survivor's story (no donation channel,
human interest only), and two reconstruction-fund announcements.

### Next steps (pass 69)
Continue round 6: Cali, Manizales, Armenia, Quibdó, Buenaventura,
Popayán, Dosquebradas, San José del Palmar, Pijao, and Ibagué remain.

## Pass 70

Round 6 continues: Cali. Two leads caught and dropped as duplicates —
the Saavedra family GoFundMe (already on file since pass 15; this
round's find is only a funding-total update) and a batch of four
shelter addresses from a single low-confidence Instagram flyer whose
own comment section had already debunked one of its five original
locations. Given the safety stakes of a wrong shelter address, none of
the four were seeded.

### The toll moved — with a contradiction worth keeping visible
Four independent sources (an official-format "Reporte Oficial #011"
graphic and three corroborating outlets) converge on 122-123 fallecidos
/ 111 desaparecidos / 1,485 heridos — missing persons jumping sharply
from the pass-56 baseline of 77. But a fifth source has the city's own
Secretario de Gestión del Riesgo, Ricardo Peñuela, reiterating the OLD
figures (111/77/1,416) the same day. Logged as new toll records on the
weight of independent corroboration, with the Peñuela contradiction
recorded here rather than silently resolved either way.

### Two more names from Edificio Ana Pilar
The building that claimed the Saavedra family also claimed the Vivas
Jiménez family — a mother, grandmother, and 10-year-old, relatives of a
well-known sports radio narrator — and its own celador, Víctor Acosta,
found dead after days of searching that had circulated widely on social
media. A new detail also surfaced on the Saavedra case itself: the two
dead sisters were actually triplets, and a maternal uncle died in the
same collapse — facts beyond what prior rounds had recorded.

### Two new, distinct scam patterns
Someone found a deceased victim's phone and is impersonating her via
"her new number" to solicit money from her contacts. Separately, a
creator discovered a fake missing-person poster using her own name and
photo, falsely claiming she was a Cali earthquake victim — TikTok's own
AI-content label corroborates the image was fabricated.

### Reconstruction: a major private donation, subsidies still pending
Colombia's richest man, Jaime Gilinski, and his wife pledged $150,000
million COP specifically for rebuilding Cali's hospitals and schools.
Separately, the national rental-subsidy program now has a target start
date (the week of Aug 18-21) but isn't flowing yet as of this pass — the
Housing Minister described the reconstruction budget picture bluntly as
"nos dejaron la olla pelada" (an empty pot), pointing instead to
private-sector and international contributions to fill the gap.

### New aid points (5)
A diaspora-organized Vaki for a damaged clinic, a live-confirmed
household collection point, a displaced elder-care congregation raising
funds for relocation, a long-established disaster-relief foundation's
multi-city walk/festival (Cali named explicitly), and a narrow,
concrete GoFundMe funding debris-removal machinery costs.

### New community embeds (11 of 12 — one already on file)
The OIM's trafficking-risk warning, a new police scam-methods alert, the
Vivas Jiménez family deaths, the Saavedra correction, a rescued survivor
who later died of her injuries, the phone-impersonation scam, the
Gilinski donation, Víctor Acosta's case closing, the rent-subsidy
timeline, the Saavedra family's own fraud warning, and the AI-generated
fake missing-person poster.

### Next steps (pass 70)
Continue round 6: Manizales, Armenia, Quibdó, Buenaventura, Popayán,
Dosquebradas, San José del Palmar, Pijao, and Ibagué remain.

## Pass 71

Round 6 continues: Manizales. Two aid points caught as duplicates —
Coliseo Menor (on file since pass 34, though the finding that its
donations ran out after 2,800 food packages and need replenishing is a
real status update, recorded in the wiki) and the Fondo Solidario
Comunitario international-wire channel (on file since pass 16). The
Homecenter story stays unresolved but gets clearer: this round traced
the underlying incident specifically to a Cali store, reinforcing pass
57's conclusion that it was never Manizales' story to begin with.

### A first: Manizales finally gets a TollRecord
Five prior rounds discussed a "6 dead / 211 injured" figure in passing,
but checking directly against all five prior seed files confirmed it
was never actually logged. Fixed now, sourced to the Alcaldía's own
day-6 communiqué — which also gives the city's first housing-damage
figures: 1,512 homes with total loss, 3,993 with partial damage.

### Two new, distinct scam patterns
A Manizales-based TikTok creator known as "La Cucuteña" is accused of
soliciting earthquake donations to a personal account and using part of
it for her own rent, refusing to show receipts when asked. Separately —
caught roughly 21 minutes after it was posted — a Facebook post used a
fabricated "GoFundMe is having platform failures" excuse to redirect
donors to a personal Nequi account, textbook scam mechanics down to the
AI-generated image Facebook itself flagged.

### Recovery, with friction
The rental subsidy (confirmed actually disbursing since pass 57)
continues via a live intake point at Cruz Roja Caldas. But the mayor has
had to publicly warn landlords against rent price-gouging in affected
sectors, with a new complaint hotline — a genuine friction point in the
recovery, not a smooth continuation. Two unconfirmed but worth-watching
claims also surfaced: a single comment alleging three rural veredas have
received zero aid, and an allegation that police obstructed volunteer
debris-removal work in one sector. Both recorded with explicit caveats,
not asserted as fact.

### New aid points (9)
An elder-care home whose own founder is warning about impersonator
campaigns using its photos (itself a strong authenticity signal), six
official municipal attention points across the city, a second elder-care
home fundraising for reconstruction, and one flagged personal-account
appeal from a family with visible structural damage.

### New community embeds (8)
The live rental-subsidy intake point, the Concejo's extraordinary
reconstruction-oversight sessions, the rent price-gouging warning, both
new scam patterns, both unconfirmed-but-flagged claims (rural veredas,
police obstruction), and a local outlet's ICBF-impersonation
clarification.

### Next steps (pass 71)
Continue round 6: Armenia, Quibdó, Buenaventura, Popayán, Dosquebradas,
San José del Palmar, Pijao, and Ibagué remain.

## Pass 72

Round 6 continues: Armenia. Heaviest dedup of the round so far — of
roughly a dozen aid-point candidates the five agents surfaced, all but
two were already on file: Coliseo del Sur, Auditorio Ancízar López
(CAM), the Diócesis's Banco de Alimentos, Centro de Convenciones de
Armenia (pass 17), Fundación Oki Doki (pass 26), the Karol Sofia Perdomo
Muñoz GoFundMe (pass 48), and Fundación Daniella Sarmiento C. — seeded
just last round, pass 58. One more, the Sociedad Quindiana de
Ornitología campaign, is the identical post already seeded under Pijao
— a genuinely dual-city effort, not double-counted here.

### A five-round-old lead, finally resolved
Fundación Tizu, an elder-care home, has sat in this project's notes
since pass 17 as an unverified name on a carousel — "a lead for a future
pass," never checked. This round finally verified it: a concrete
address, phone number, 33 residents, three of them oxygen-dependent.

### The department's toll gets an official upgrade — still not Armenia's
The "tres fallecidos en el Quindío" figure that pass 58 flagged as an
unconfirmed rumor is now backed by the Gobernación's own 8th emergency
bulletin — a real official document, not a rumor anymore. But it's still
explicitly department-wide, not broken out by municipality, so it still
isn't logged as Armenia's toll. The closest thing to an Armenia-specific
death confirmation is a woman whose fatal fall and subsequent death both
occurred inside the city — documented here without over-asserting the
department's own framing, which never quite labels her "Armenia's."

### The missing-persons case gets a lead, not a resolution
Cristian Camilo Arango Marín's case (open and contested since pass 48)
gets a fresh Aug 15 repost from his mother, still listing him missing —
plus two independent commenters claiming a sighting near the bus
terminal. A real lead, not a resolution; the contradiction with the
crowdsourced "found" tracker stands unresolved.

### New aid points (2)
Fundación Tizu, and a second acopio point at Superautos del Quindío.

### New community embeds (3)
The closest-to-Armenia-specific death, the department toll's official
upgrade, and the missing-persons sighting lead.

### Next steps (pass 72)
Continue round 6: Quibdó, Buenaventura, Popayán, Dosquebradas, San José
del Palmar, Pijao, and Ibagué remain.

## Pass 73

Round 6 continues: Quibdó. A DANE Colombia government graphic listing "7
puntos de acopio" looked like a major new find at first glance — direct
verification against all six prior passes showed four of the seven were
already on file (Gobernación del Chocó and the Postobón warehouse from
pass 62; REDDHHPAC and the Terpel Cabí station from pass 18), and the
Diócesis's food bank and Pastoral Social accounts re-surfaced with
matching NIT and account numbers from pass 18 too. Only three of the
graphic's seven points survived dedup as genuinely new.

### A first: Quibdó finally gets a TollRecord
Six prior passes never actually logged a Quibdó-specific toll figure —
pass 61's notes discussed roughly 13 dead from press convergence, but it
was never written to the database. Fixed now, sourced to a consolidated
capital-cities report from Asocapitales's director: 9 dead, 119
injured, 9 missing, plus the city's first housing-damage figures. The
new figure reads lower than the informally-discussed 13 — not a direct
database contradiction since nothing was logged before, but worth a
future pass reconciling.

### The blood-bank saga, still open since pass 18
Video evidence shows a replacement refrigeration unit physically
arriving at the hospital — but a same-day post says the existing
equipment is still failing and unrepairable, and El Colombiano's
"still not functional" coverage was still circulating the same day.
Arrived, not confirmed restored.

### A compounding crisis: the only shelter flooded
Quibdó's sole shelter, the Coliseo de Boxeo, flooded during storms on
top of the earthquake damage and had to be evacuated again — reported
independently by three outlets (an investigative outlet, a local news
page, and El Espectador's own account), which also documented
neighbors organizing their own mutual-aid system in the meantime.

### New aid points (10)
Three genuinely new points from the DANE graphic, a departmental lab's
supply request, a Cali-based relay brigade sending aid to Quibdó, the
First Lady's national "Colombia, un solo corazón" campaign point, and
four crowdfunding/monetary channels carrying explicit caution notes —
two small personal appeals and two donation numbers corroborated only
by TikTok creators, not by any institutional or government source.

### New community embeds (6)
The flooded shelter, the blood-bank refrigerator's partial update,
Óscar Benavides's public response to the Corte Suprema investigation
(still unresolved, collection now over $700M COP), a reconstruction-
phase report from Zona Minera, 40 homes evacuated in Las Terrazas, and
a humanitarian aid truck arriving from Pasto.

### Next steps (pass 73)
Continue round 6: Buenaventura, Popayán, Dosquebradas, San José del
Palmar, Pijao, and Ibagué remain.

## Pass 74

Round 6 continues: Buenaventura. Pass 63's notes had flagged Manos
Visibles' "Fondo de Reconstrucción S.O.S. Pacífico" fund as real but
un-seedable — no agent could capture a working permalink at the time.
This round three different agents did, so it's formally in the database
for the first time.

### The Nequi impersonation risk: still open, despite one agent's read
One agent tested afrus.org's payment form directly and read that as
confirmation the "broken link" had been fixed. But afrus.org was
already the known-good legitimate channel before this pass — the actual
question (is the impersonated Nequi/QR side fixed?) is answered
differently by the other three agents: no, the org appears to be
quietly abandoning that channel for the pre-existing web link rather
than repairing it. Treating this as still unresolved.

### A first: Buenaventura gets a TollRecord, with a visible conflict
Eight prior passes never logged a Buenaventura-specific toll figure.
Fixed now — but two same-day numbers didn't agree: 16 dead/258 injured
(three independent outlets, three of five agents) versus 26 dead/433
injured (one local outlet, one agent). Logged the more broadly-
corroborated figure and kept the outlier visible in the notes rather
than picking silently.

### A new hazard, unrelated to the earthquake's structural damage
Rising sea levels are forcing evacuations in the coastal hamlets of
Juanchaco and Ladrilleros — flagged as a risk by a local citizen-
journalist days earlier, now materialized and confirmed by national
outlets. A separate post cites CVC river-basin risk mapping warning of
compounding flood exposure along the Dagua, Calima, and San Juan
watersheds.

### The real story behind a known scam
Pass 63 flagged "Albergue de Rita" as an impersonation risk. This round
found what looks like the genuine underlying situation: a real,
identifiable volunteer organizing debris cleanup for a shelter housing
54 rescued puppies — with no payment channel requested at all.
Documented specifically so donors can tell the real thing from anyone
soliciting money using the same name.

### New aid points (6)
Manos Visibles' reconstruction fund (finally seedable), a new health-
brigade foundation (with its religious/political affiliation flagged
for donor awareness), two out-of-city collection points relaying goods
to Buenaventura (Bogotá, and a diaspora drive in Valencia, Spain), a
lower-confidence personal collection point, and the real story behind
the Doña Rita shelter.

### New community embeds (7)
The presidential visit, the Juanchaco/Ladrilleros flooding, the
road corridor closing again, a controversial ministerial comment on
rebuilding speed (paired with a new official materials-donation
channel via UNGRD), an unconfirmed aid-withholding allegation, a
student-led aid convoy, and the CVC flood-risk warning.

### Next steps (pass 74)
Continue round 6: Popayán, Dosquebradas, San José del Palmar, Pijao,
and Ibagué remain.

## Pass 75 (2026-08-16) — Popayán, round 6

Six prior rounds (passes 9, 11, 20, 29, 41, 51, 64) covered this city,
and pass 64 found every single candidate a duplicate. That streak
broke this round: the "huge update" surge reached even the
thinnest-covered tracked city, surfacing five concrete, verifiable
acopio points that don't overlap with any of the five already on file.

### New aid points (5)
- **AAPSA** (Acueducto y Alcantarillado de Popayán), running an
  in-kind donation drive at its own historic-center address —
  independently corroborated by all five agents this round, against
  the utility's own institutional site and two third-party reposts.
- **Donatón Solidario at Centro Comercial Monserrat Plaza**, a broad
  supply drive for municipios in northern Cauca, running through
  today (the last day of a four-day window), posted by the mall's
  own verified account.
- **"Nos Movemos por Colombia" at Centro Comercial TerraPlaza**, a
  donation event happening today, accepting both in-person and
  remote contributions.
- **Veterinaria Patitas / Dr. Arbeláez Clínica Veterinaria**, a pet-
  supply collection tied to an adoption event — medium confidence,
  its stated deadline has likely already passed.
- **Centro de Acopio INVÍAS**, run by Popayán's Gestora Social,
  diagonal to Centro Comercial Campanario — single-sourced (an
  official EMTEL SA ESP page) so medium confidence. A separate TikTok
  sighting of a women's-collective drive at the same mall may or may
  not be the same effort; left unresolved rather than merged or
  duplicated.

### Toll status
Unchanged at zero for a sixth straight round. The UNGRD's own Aug 16
national balance names Chocó, Valle del Cauca, Risaralda, Caldas, and
Quindío as affected departments — Cauca isn't on it. The one death
connected to Popayán, Pablo Andrés Rivera Avirama (UNIMAYOR alumnus),
happened at the Pereira airport, not locally — documented as a human-
interest story, not a toll change.

### New community embeds (3)
Pablo Rivera Avirama's death confirmation and Popayán funeral
(corroborated by five independent sources this round, most yet), the
Alcaldía's continued debris removal at the already-known Hogar San
Vicente de Paúl, and Caracol Radio's report that electricity has been
restored citywide.

Crowdfunding stays a confirmed absence for a sixth consecutive round.
No new scam or fraud reports this round either — also a sixth
consecutive null. One repeat sighting (15 tons of radio-collected aid
dispatched to Valle del Cauca) is the same story pass 64 already
documented, just reposted by a different page — not re-seeded.

### Next steps (pass 75)
Continue round 6: Dosquebradas, San José del Palmar, Pijao, and
Ibagué remain.

## Pass 76 (2026-08-16) — Dosquebradas, round 6

Five prior rounds (21, 30, 42, 52, 65) already covered this city.

### Shelter roster: status update, not new sites
The official Alcaldía Instagram account confirmed all four shelters
in the network are now operational. Two of them were previously
tracked as unfinished: the "4th shelter under construction" seeded in
pass 52 as "Albergue en construcción — La Graciela" is open, at the
sports field in barrio Minuto de Dios, confirmed capacity 150 — same
entity, richer detail, not re-seeded. And pass 65's Centro Vida José
Argemiro Cárdenas, previously queued to open once Las Violetas
filled, is now confirmed active alongside it.

### New aid points (1)
A community-run acopio at the Sindicato de Trabajadores de La Rosa
union hall in barrio Guadalupe — independently found by two of the
five agents this round, both citing the identical street address and
coordinator.

### New community embeds (1)
UNGRD (the national disaster agency) delivered 70 tents and 210
blankets directly to the Dosquebradas municipal government —
identically worded across at least five Facebook reposts plus the
official UNGRD account on X.

### Flagged but unseedable
Two real, dated stories surfaced without a verifiable social-platform
permalink (X fetches returned HTTP 402 all round; only news-site URLs
were reachable), so per the standing rule they're documented here
rather than forced into the database as fake permalinks:
- **La Graciela demolition controversy.** A contractor (named in
  reporting as Juan Manuel Estrada, tied to Constructora Núcleo)
  brought heavy machinery to demolish quake-damaged homes in La
  Graciela without letting residents retrieve belongings, allegedly
  to collect an equipment-rental fee. A CARDER (regional environmental
  authority) official who objected was filmed being told she had no
  jurisdiction. An attorney filed a formal complaint; a Puesto de
  Mando Unificado meeting sided with CARDER and banned heavy machinery
  there in favor of lighter equipment. Reported independently by
  Semana and Pulzo, both citing an Aug 13 incident that broke into
  national coverage on Aug 16. Worth a human double-check: "La
  Graciela" is the same neighborhood name as the shelter above — the
  reporting doesn't establish whether the demolition zone and the
  shelter site are the same physical spot or just share a name.
- **A named in-city quake death.** Roger David Ramírez Quiroz, a
  17-year-old student, died when a wall collapsed at Colegio Fabio
  Vásquez Botero during the earthquake itself — one of three schools
  the city's Education Secretary has since confirmed need full
  reconstruction (the other two are Popular Diocesano and Bernardo
  López Pérez; two more have repairable damage). This is the first
  named, address-specific Dosquebradas death found across all six
  rounds, distinct from the still-uncorroborated round-5 "10
  fallecidos" city-wide figure.

### Toll status
No fresh confirmation or contradiction of round 5's uncorroborated
"10 fallecidos" figure. Two earlier, single-source counts turned up
instead — a municipal PMU count of "at least 7" and a same-day
rescue-ops count of 8, both dated Aug 11 — showing the toll was still
fluctuating in the first 24-48 hours. Neither meets the corroboration
bar alone, and neither is more recent than round 5's figure, so
nothing is logged as a TollRecord this round; all three numbers stay
in this note as unresolved context for a future pass.

Crowdfunding (including the David Londoño campaign) and scam reports
both stay a confirmed null this round — no updates found on either
front despite targeted searching.

### Next steps (pass 76)
Continue round 6: San José del Palmar, Pijao, and Ibagué remain.

## Pass 77 (2026-08-16) — San José del Palmar, round 6

Five prior rounds (22, 31, 43, 53, 67) already covered this small,
remote epicenter town. As expected, this round stayed thin — no
casualty-figure change, no new physical aid point inside the town
itself, no fresh scam reports.

### New aid points (1)
A Cali creator-organized supply truck for the town (@culotauro and
@elgordomurillo, coordinated with the town's own Alcaldía) resolves
an open thread from pass 67: back then it was logged only as a social
post, explicitly flagged as an address-less lead to verify. This
round found the exact address via the Alcaldía's own repost, so it's
upgraded to a confirmed aid point.

### Crowdfunding
The Valentina Jurado Vaki campaign (tracked since pass 22) ticked up
again — $47,579/1,846 donors → $48,178/1,862 donors — still open,
with the page itself counting down "3 días antes del cierre el 19 ago
2026." Not yet closed. Per the standing pattern for this campaign,
the funding update is noted here rather than re-seeded as a new row;
round 7 should check right after Aug 19 for the campaign's close and
final total.

### Unconfirmed, not logged
- A single small, unverified X account claimed international rescue
  teams from Chile, the US, and Israel had arrived in the town as
  part of a wider logistics deployment. None of the other four
  agents corroborated this despite real effort — flagged here as
  unconfirmed, not reported as fact.
- A set of granular figures (525 families/2,625 people affected, 40
  houses collapsed, 485 damaged) attributed to the Alcaldía's
  Instagram surfaced via one agent's tool output, but a second
  agent's direct live-browser visit to the same account couldn't
  load the post feed at all, and the 40-collapsed-houses figure
  contradicts a Semana report of "más de 130 viviendas destruidas" —
  flagged as a likely tool hallucination, not logged.

### Toll status
Unchanged: 2 injured, 0 dead in the urban zone, 1 person still
missing, road passable on one lane only. No report this round
confirmed or refuted the earlier contested "road collapsed again"
claim. A national UNGRD balance (289 dead / 4,187 injured / 143
missing) and a rising nationwide aftershock count (293, up from 284
the day before) both surfaced, but neither is San José del
Palmar-specific — noted as background only, not logged as a
TollRecord for this municipio.

### Next steps (pass 77)
Continue round 6: Pijao and Ibagué remain.

## Pass 78 (2026-08-16) — Pijao, round 6

Six prior passes (37, 38, 39, 44, 54, 68) already covered this dual
earthquake-and-wildfire city. All five research agents converged
independently on the same source this round — unusually strong
corroboration for a small town.

### Toll update
The Alcaldía's own updated damage count now stands at 217 viviendas
afectadas (114 urbanas, 103 rurales, algunas inhabitables) — a real
escalation from the pass 38a baseline (73 predios afectados, 7
colapsados, as of Aug 12) after four more days of assessment, not a
contradiction. The source doesn't break out how many of the 217 are
total collapse versus partial damage, so it's logged as a combined
total under VIVIENDAS_AVERIADAS — a future pass should tighten this
if an official breakdown appears.

### New aid points (2)
Both run directly by the Alcaldía itself, a first for this city —
prior points were all NGO or private drives:
- A construction-materials collection point (Secretaría de Gobierno)
  tied to the 217-home damage count, also distributing everyday
  relief items per an official flyer.
- A bank-transfer key (@GLP760) for fire-relief monetary donations,
  distinct from the already-known MMQ Nequi drive.

### Wildfire status: still not extinguished
Unchanged from pass 68 — the Pijao/Génova complex remains active, not
contained. New detail this round: Rep. Miguel Grisales posted from
the fire ground on Aug 15 saying it "sigue avanzando con fuerza,"
requesting AERIAL firefighting support because ground crews still
can't reach the terrain. He also relayed a serious claim from local
residents that the fires may have been deliberately set, and formally
asked Policía/Fiscalía to investigate — recorded here as an
allegation under investigation, not an established fact. The known
mutual-aid roster expanded too: fire corps from Caicedonia and now
Buenavista are working the complex alongside Pijao's own and CRQ
(the regional environmental authority). A new compounding hazard also
surfaced — Pijao is now also dealing with windstorms ("fuertes
vendavales") on top of the quake and fire, and the fire is now
confirmed damaging café, plátano, limón, and aguacate crops in
Génova.

Missing persons and Pijao-specific scam reports remain empty for a
seventh consecutive pass — expected, not a gap.

### Next steps (pass 78)
Continue round 6: Ibagué remains, closing out the round. Then begin
Round 6 coverage of Argelia, Valle del Cauca (see the dedicated
addition entry once its base municipio pass lands).

## Pass 79 (2026-08-16) — adds Argelia, Valle del Cauca

Added as a twelfth tracked municipality, per an explicit user request.
The user had heard that little relief is reaching this town, and that
aid meant for it might be getting diverted elsewhere — this pass adds
the base Municipio record on verified structural-damage grounds; the
diversion/interception claim is **not corroborated by any source
found so far** and is deliberately left out of the public-facing
alert note. It's an open question for the dedicated research pass to
actively hunt down, not something to assert as fact on a bare claim.

### Why CRÍTICA
Two fully-verified El País (Cali) articles: an Aug 13 piece covering
Valle governor Dilian Francisca Toro's personal visit to Argelia — she
confirmed an entire sector of the town must be relocated, 70+ families
are displaced, and the municipal hospital was affected badly enough to
need an emergency generator; and an Aug 16 department-wide roundup in
which Valle's Risk Management Secretary Francisco Tenorio names
Argelia directly among the region's hardest-hit municipios ("En El
Cairo colapsó el 80% del casco urbano... También tenemos el caso de
Ulloa, Toro, Alcalá, Argelia, Ansermanuevo, Roldanillo, Zarzal,
Trujillo y hasta Buenaventura"), in the same report documenting 6,000+
homes lost departmentally. A separately-seen headline claiming "más
del 90% del municipio afectado" could not be traced to a live,
fetchable article — deliberately not cited or used to justify severity
here, and flagged for a future pass to confirm or drop.

### Basics
DIVIPOLA code 76054 (department 76, Valle del Cauca), population
5,397 (2018 DANE census), coordinates 4.7261, -76.1217 — all
cross-verified across Spanish Wikipedia, Wikidata, and
citypopulation.de, which independently agree on the code.

### Next steps (pass 79)
Finish Round 6 with Ibagué. Then run a full dedicated 5-agent research
pass on Argelia (matching the deep-pass pattern used for Pijao and
Ibagué when they were added) — aid points, needs, toll figures, and
above all, actively hunting for any real evidence one way or the
other on the aid-interception/diversion claim.

## Pass 80 (2026-08-16) — Ibagué, round 6

Ibagué's third overall research pass (after 59/municipio-add,
60/deep, 66/tiktok-retry), and the last city needed to close out
round 6 across all twelve tracked cities.

### New aid points (2)
- Universidad del Tolima's Sede Centro campus, an active
  student-run collection point since Aug 13.
- La Sierra Clínica Veterinaria de Especialistas — Ibagué's first
  VET-category aid point, collecting supplies for animals affected
  by the regional wildfires (San Luis, Payandé). Found independently
  by two agents citing the same article, with matching detail down to
  the five named veterinarians.

Not seeded: a private citizen's home in barrio Santa Ana collecting
baby and pregnancy supplies — real and verifiable, but the goods are
personally driven out to Pereira and the Eje Cafetero rather than
serving Ibagué's own displaced residents, so it falls outside this
city's aid-point scope.

### First-ever Ibagué toll record
More than 200 official educational institutions shifted to virtual
classes pending structural evaluation — a direct mayoral quote that
maps cleanly onto CENTROS_EDUCATIVOS_AFECTADOS, unlike the same
article's other figure (350+ buildings *inspected*, up sharply from
the ~32 previously on file) — that's a process count, not a damage
count, so per the discipline set in pass 60 it stays in this note
rather than becoming a TollRecord. Also from this round: 8 hikers
were rescued unharmed after landslides closed access to Termales El
Rancho in Cañón del Combeima (Aug 14-15) — no casualties, so no toll
entry, but a real, dated event.

### Wildfire status: likely contained, not confirmed
Ibagué and barrio Picaleña are conspicuously absent from three
independent same-day Tolima active-fire lists this round — a signal,
not a confirmed statement, that the in-city fire flagged in pass 66
has been brought under control. No source explicitly declares it
extinguished or contained, so this stays an inference here rather
than a status change in the database. A future pass should try to
get an explicit statement from Ibagué's Bomberos or Alcaldía.

### Other real developments, not cleanly seedable
- Employees at Ibagué's Palacio de Justicia reportedly fear for their
  safety over visible cracks in the building (Caracol Radio, Aug 15) —
  distinct from the already-known "lower seismic standards for new
  permits" concern; this is about an existing government building.
- Residents of Conjunto Verao (barrio Departamental) remain displaced
  and are still waiting on an overdue structural-pathology inspection,
  as of Aug 13 — a named, concrete instance inside the already-known
  aggregate "48 families evacuated" figure, not a new count.
- Cortolima's director publicly pushed (Aug 12) for seismic
  microzonification data, national monitoring equipment for the
  Ibagué fault, and a full technical review of the city.
- Ibagué has a new permanent Secretary of Environment and Risk
  Management, Jorge Humberto Leal, sworn in Aug 15.

No dedicated shelter for Ibagué's own displaced residents was found,
and no Ibagué-targeted scam or missing-persons case turned up —
unchanged from pass 66.

## Round 6 complete

All twelve tracked cities (Pereira, Cali, Manizales, Armenia, Quibdó,
Buenaventura, Popayán, Dosquebradas, San José del Palmar, Pijao,
Ibagué) have now had a sixth research round, spanning passes 69
through 80. Argelia, Valle del Cauca joined the tracker mid-round
(pass 79) as a thirteenth-pass-pending addition — its first dedicated
deep-research pass follows separately rather than as part of this
round's count.

### Next steps
Process Argelia's first dedicated deep-research pass once it
completes. After that, begin round 7 across all twelve established
cities in rotation order, continuing to check for round-7-specific
developments.

## Pass 81 (2026-08-16) — Argelia, Valle del Cauca, first deep pass

Five agents, immediately following pass 79's addition of this city.

### The interception question: no corroboration found

This was the reason the user asked to add and heavily research this
city — a report that aid meant for Argelia was being intercepted and
sent elsewhere. All five agents, independently, searching dozens of
distinct term combinations (desviada, interceptada, robada,
corrupción, denuncia, acaparamiento, politiquería, clientelismo,
combined with Argelia/terremoto, in Spanish, across news search, X,
Instagram, Facebook, and TikTok) found **zero corroboration**. No
news coverage, official statement, Procuraduría/Contraloría action,
or even fringe social chatter alleges aid destined for Argelia was
stolen or redirected. One agent noted that Google's own "Missing:
[keyword]" annotations confirmed not a single indexed page pairing
Argelia's earthquake coverage with any theft/diversion term.

What IS real and well-documented, across four independent mainstream
outlets, is a different story: Argelia is genuinely overshadowed and
slow to receive aid, not a victim of theft.
- **Canal Trece** (Aug 11, the earliest dedicated piece): "S.O.S.
  Norte del Valle: El Cairo, Argelia, El Águila, Ansermanuevo y
  Roldanillo piden no ser olvidados" — explicit thesis that national
  attention concentrated on Cali, Pereira, and Manizales while these
  towns face "aparente aislamiento mediático."
- **Vanguardia** (Aug 16): rural families near Ansermanuevo and
  Argelia describe receiving aid only from passing drivers ("una
  libra de arroz"), with El Cairo's own acting mayor admitting on the
  record that a rural census hadn't even started as of that date.
- El País's own subhead on its Argelia coverage: "Este municipio
  clama por ayudas en el proceso de reconstrucción."
- The GoFundMe organizer's own appeal states it plainly: "While major
  rescue efforts focus on metro areas, remote towns like Argelia are
  neglected."

**Caveat, stated honestly**: every agent hit the same tooling wall —
X was blocked outright in this session, and Instagram/Facebook
returned JS-gated empty shells to non-browser fetches. Grassroots
WhatsApp/Facebook-group-level complaints — exactly the kind of
content that would carry an unverified rumor like this one — could
not be directly swept. This is a real, meaningful negative result
("no evidence found in searchable sources"), not proof the claim is
false. If the source of the original claim can be narrowed down (a
screenshot, a specific account, a date), that would allow a far more
targeted follow-up search.

### The "90% affected" figure: confirmed real

Pass 79 explicitly declined to cite this headline because the only
trace was an unreachable Google News redirect. This pass found and
verified the live article: El País (Cali), "Sismo en Argelia, Valle:
Más del 90% del municipio afectado" (Aug 15), directly quoting Cuerpo
de Bomberos officer Yulian Giraldo — "el municipio se ha visto
afectado en un 90%" — independently echoed by a community Instagram
account using nearly identical language. Not logged as a TollRecord
(nothing in the schema maps to "% of municipio affected"), but now a
confirmed, citable fact rather than an open question.

### New toll figures (3)
- 70+ families (~400 people) affected, with a named barrio —
  Monserrate — that must be relocated entirely: a 100+ meter fissure
  runs through homes there and threatens a landslide toward the "La
  Pista" sector. Named by the mayor, Wilson Vanegas, and confirmed
  by the governor's own quote.
- Zero deaths, doubly confirmed by two independent official channels
  agreeing: the Cuerpo de Bomberos officer's on-record statement to
  Semana, and the mayor's own separate "parte de tranquilidad"
  Facebook post.
- The town's one hospital, out of service without a working
  generator, corroborated by three independent outlets — the
  Gobernación later installed an emergency generator.

### New aid points (3)
Two live, directly-verified GoFundMe campaigns — donor ledgers loaded
and read firsthand, not just search snippets — and a medium-confidence
WhatsApp contact for a named volunteer firefighter that circulated
organically across two independent posts.

Several informal Nequi/DaviPlata donation numbers and out-of-town
collection points (Buga, Cali) also surfaced but were **not seeded**:
confidence was too low and control too unverifiable to publish even
through the moderation queue. Also documented, not seeded: an
official Gobernación del Valle confirmation that 80+ tons of
humanitarian aid have already been delivered to Argelia specifically
through the Unidad para las Víctimas — directly relevant context for
the interception question, since it shows the official pipeline is
demonstrably active, but not itself a donor-facing channel.

### Next steps
Begin round 7 across all thirteen tracked cities in rotation order.
A future pass on Argelia specifically should retry the interception
question with working social-media search access, and try to
disambiguate the housing-damage percentage (reported inconsistently
across sources as 70%, 80%, or 90%+ depending on whether the metric
is housing stock specifically or the municipio broadly).

## Pass 82 (2026-08-16) — Argelia, second deep pass + solidarity hunt

Per an explicit user request: dig further into Argelia itself, and
specifically hunt for other cities/towns organizing aid for it.

### Headline result: the padrino is Pamplona, confirmed

Argelia's official sponsor municipio under Fedemunicipios' Plan
Padrino entre Alcaldes is **Pamplona, Norte de Santander** (alcalde
Klaus Faber Mogollón) — this resolves pass 81's headline-only lead.
Confirmed directly by fetching Pamplona's own official Instagram reel
(@alcaldiadepamplona), which announces "Solidaridad por Argelia" and
lists accepted donation items (sealed non-perishables with 3+ months
before expiry, hygiene supplies, construction materials, pet food).
Cross-referenced against Fedemunicipios' own live tracking database
and coverage from El País, Diario Occidente, and Emisora Nueva Época.
Status as of this pass: "en proceso" — no shipment confirmed
delivered yet. The same mayor is simultaneously co-padrino of
neighboring El Cairo, splitting Pamplona's capacity across two towns.
One minor, single-commenter complaint under Pamplona's own post
accused its mayor of not personally contributing funds — this is
about Pamplona's own mayor, not about Argelia's aid being diverted,
and isn't treated as evidence toward the interception question.

### New aid points (3)
Two newly-verified GoFundMe campaigns explicitly naming Argelia: one
from an individual with grandparents' family land there, one from a
Salento (Quindío)-based family/volunteer group personally delivering
supplies to Argelia and three neighboring norte-del-Valle towns.
Plus the Pamplona padrino channel itself.

### A caution on verification — three leads checked and NOT seeded
Research surfaced several other candidate Cali-based collection
points said to serve Argelia. Before writing any to the database,
each was checked directly:
- **Surtifamiliar's "Caravana por la Vida" drive** — checked directly.
  The supermarket's own post names its destination as "Buenaventura y
  otros municipios del norte," not Argelia specifically. The
  Argelia-specific address that surfaced came only from a reposting
  account, not from Surtifamiliar itself. Excluded — same "must name
  Argelia specifically" bar this project already applies to Palmira's
  diocesan campaign, which has the identical problem.
- **An influencer's home-address collection point** ("Vamos a
  Pueblear") — checked directly; nothing matching the claimed
  campaign appeared in the account's current visible content. May
  have lived only in expired Stories. Not seeded without independent
  confirmation.
- **The Alcaldía de Cali's official redistribution point**, claimed
  (via a search snippet only) to have delivered 146 kg of aid to
  Argelia specifically — could not be independently verified beyond
  that snippet despite a direct attempt. Not seeded.

### A genuine solidarity story, not seeded but worth telling
**Bruselas**, a corregimiento of Pitalito, Huila — a full department
away from Valle del Cauca — saw community leaders organize a truck
that physically delivered mercados, agua, and kits básicos to
Argelia, independently covered by two separate Pitalito news outlets.
A one-time completed delivery rather than an ongoing channel, so not
an aid point, but a real, corroborated act of solidarity worth
recording. Similarly, Cali Informa (414K+ Facebook followers) has
been personally trucking donations to Argelia while running an
ongoing public call for donations — real, but with no fixed drop-off
address of its own to seed as a distinct point.

Tuluá and Cartago outlets both gave Argelia sustained, sympathetic
coverage, but neither has an organized, addressed collection drive
specific to Argelia as of this pass — their contribution so far is
attention, not aid infrastructure.

### Interception question: still nothing
No corroboration found again this round. The only adjacent material
was a single vague, unattributed Instagram comment about "personas
inescrupulosas" — no named target, no specific incident. Conclusion
unchanged from pass 81: this remains an access/attention-gap story,
not a diversion story.

### Other confirmations, not separately logged
Reconstruction has formally begun: the governor named Argelia (with
El Cairo) among the first municipios where roof repairs ("poner
techos") would start. A 21-inch pipeline serving seven towns
including Argelia was repaired and water service restored Aug 12,
10pm. A general (not Argelia-specific) Policía Nacional warning about
post-earthquake donation scams was reported Aug 16 — impersonated
relief-org leaders, hijacked WhatsApp/social accounts, personal bank
accounts collecting "donations." The two GoFundMe campaigns already
on file were reconfirmed still active and growing.

### Next steps
Begin round 7 across all thirteen tracked cities in rotation order,
now including Argelia.

## Pass 83 (2026-08-17) — Ibagué, one user-submitted resource

A single find, shared directly with the user and passed along for
research and entry — not a research-pass sweep.

**INTECS** (Instituto Nacional de Técnicas), a real technical
institute with campuses in Ibagué and Honda (Tolima, confirmed via
its own Instagram), organized a student/staff-run acopio for people
and animals affected by wildfires in the Tolima veredas/municipios of
Valle de San Juan, San Luis, Coello, and Payandé — collecting at its
Ibagué "sede principal" Aug 18-19. Entered as both a PendingAidPoint
and a PendingSocialPost, per the user's explicit request to review
and approve later rather than auto-publish. One caution carried into
the pending note: Instagram's own "AI content" label appears on the
source post — flagged for the reviewer, not treated as evidence
against the institute or the drive being real.

**Also researched, not entered**: a second resource the user was
given — a "Red de Mujeres Kambirí" volunteer callout (aid-unloading
at an address near Carabantú, plus a request for help at Centro
Comercial Tranvía Plaza) — traced the org (Red Nacional de Mujeres
Afrocolombianas Kambirí, redkambiri.org) and both addresses, but both
resolve to **Medellín**, not any of this project's thirteen tracked
cities, and no citable permalink was found for the specific callout
text itself (not visible in the account's public post grid — likely
a Story or a forward). Flagged back to the user rather than entered
speculatively.

### Next steps
Get the user's read on the Kambirí resource (source link if
available, and whether it's meant to tie to Quibdó/Chocó relief
specifically) before deciding whether/how to enter it. Otherwise,
begin round 7 across all thirteen tracked cities.

## Pass 84 (2026-08-17) — Kambirí resolved: three Medellín acopio
## points, attached to Buenaventura

A deeper crawl (Google, Instagram, and a purpose-built donation
directory) resolved pass 83's open question. Confirmed three real,
currently-active Medellín acopio points, all independently verified
in Movilizatorio's "Directorio Ayudas Colombia" (a curated directory
built specifically for this earthquake): **Red de Mujeres Kambirí**
(Calle 58 #41-64), **Centro Comercial Tranvía Plaza** (Cra 40 #48-95,
Local 323), and **Colectivo AfroUdeA** (Universidad de Antioquia,
Bloque 9) — addresses matching the text the user was sent almost
exactly. All three entered as pending aid points.

**Not added: Medellín as a tracked city.** The user's instinct was to
add Medellín with its own severity assessment, but nothing in this
project's research — six-plus rounds, plus this pass's own fresh
search — has ever placed Medellín/Antioquia among the affected
departments. Medellín is playing a donor/staging role here, the same
role Pamplona plays for Argelia or Cali/Buga/Salento/Pitalito played
as Argelia collection points — none of those were added as tracked
disaster cities either. These three points are attached to
**Buenaventura** instead, per that established pattern.

**Beneficiary, sourced two ways**: a Fundación Juntos Se Puede
Instagram post naming the Tranvía Plaza point explicitly ("cargue de
ayudas para su traslado hacia Buenaventura"), corroborating the
addresses independently confirmed in the Movilizatorio directory.
Some adjacent posts frame the same Medellín corridor as feeding
Chocó/Pacific relief more broadly rather than Buenaventura
specifically — Kambirí's own Afro-Colombian, Pacific-coast identity
fits either reading. Buenaventura was chosen because it's the one
point with a direct, dated quote naming it; flagged in each pending
entry's note so a moderator with better information can correct it.

### Next steps
Begin round 7 across all thirteen tracked cities in rotation order.

## Pass 85 (2026-08-17) — adds Medellín, Antioquia (14th tracked city)

Per an explicit, repeated user instruction: track Medellín "as equal
as the other cities" — its own page, its own hub of points and
resources, its own dedicated research pass.

### What makes this addition different
Nothing in this project's research — six-plus rounds across every
other city, plus two dedicated passes chasing this exact lead — has
ever placed Medellín/Antioquia among the affected departments (Chocó,
Valle del Cauca, Risaralda, Caldas, Quindío, Tolima only). Medellín
wasn't struck by the Aug 10 quake. It's added here honestly as a
**donor/logistics hub city** — not a disaster site — per the user's
explicit direction to track it fully regardless. Two things are
deliberately not faked to make it "look like" the other cities:
`severityLabel` stays null (nothing happened here to rate) and
`redAlert` stays false. The alertNote states its hub role plainly. If
a future pass ever finds real local damage, this should be revisited.

### Re-homed
The three Medellín acopio points from pass 84 (Red de Mujeres
Kambirí, Centro Comercial Tranvía Plaza, Colectivo AfroUdeA) moved
from Buenaventura (their likely destination) to Medellín (their
actual physical location), now that Medellín is trackable — more
consistent with how every other city's aid points work. Each entry's
needsText still states the Buenaventura/Pacific destination.

### Basics
DIVIPOLA 05001, department Antioquia ('05', already existed in the
DB), population 2,427,129 (2018 DANE census), coordinates 6.2502,
-75.5676 — cross-verified across Spanish Wikipedia and
citypopulation.de, both agreeing on the code.

### Next steps
A dedicated 5-agent deep-research pass on Medellín's hub role is
running — process its results once complete (more acopio points,
verification that no local damage was missed, community posts,
crowdfunding). After that, begin round 7 across all fourteen tracked
cities in rotation order.

## Pass 86 (2026-08-17) — Medellín's first deep pass, and a correction

### Correcting pass 85: Medellín did feel real, minor effects
Pass 85 assumed zero local impact. This pass found — and directly
verified firsthand against the source, not just an agent's report —
the Alcaldía de Medellín's own account: after 600+ technical building
inspections, 16 homes were temporarily evacuated (Carlos E. Restrepo,
buildings from the early 1970s, and Laureles), and roughly 250 of the
city's 421 public school campuses reported some damage, mostly minor.
Mayor Federico Gutiérrez explicitly stated no building required
demolition and the city "no presenta riesgo estructural." No deaths
or injuries have been reported. Real, sourced, minor incidental
impact — not the "Medellín is a disaster zone" scenario, but not
zero either. `severityLabel` moves from null to **LEVE** (the lowest
tier) to reflect this honestly; the hub role remains the dominant
story and is otherwise unchanged. Logged as two toll records: 16
viviendas averiadas, 250 centros educativos afectados.

Separately — **not about Medellín, not entered**: Antioquia's own
DAGRAN risk agency is inspecting real, confirmed damage (290 homes,
54 schools, 13 churches per one source) across roughly 26 unnamed
municipios in the department's Suroeste/Oriente subregions, bordering
the Chocó/Caldas/Risaralda epicenter zone — geographically distinct
from Medellín itself (Valle de Aburrá). Flagged as a lead for a
future pass to identify and potentially track those specific
municipios.

### New aid points (10)
The best-corroborated of a much longer list this pass surfaced,
mostly from official Alcaldía press releases plus Infobae, Blu Radio,
Telemedellín, and El Colombiano: the city's official multi-site
acopio network (179 tons and $1.813M COP collected to date), the
Corporación Presentes monetary channel (boosted by an Aug 15 benefit
concert that alone raised $6,000M COP + 31 tons in a single day), a
football club's stadium-store collection point, an airport-community
convoy explicitly bound for Cartago/Valle del Cauca, a shopping
mall's collection point, and Universidad EAFIT's internal $1,000M COP
emergency fund for its own ~800 students from affected regions. Also
seeded: the four Movilizatorio-directory points flagged but not yet
entered in pass 85 (Colegio Padre Manyanet, Cola del Zorro, La Kombi,
Politécnico Gran Colombiano).

### New community embeds (3)
178 tons collected (El Colombiano), the benefit concert's results
(Enfoque Cinco) — and a serious one: an aid truck from that same
concert was attacked with gunfire on the Bolombolo–Ciudad Bolívar
corridor en route to Chocó, over 10 rounds hitting the lead truck,
both drivers escaping unharmed. Verified directly (35K reactions) and
independently corroborated by at least five other regional Facebook
pages — a real security risk for Medellín-origin aid convoys, worth
watching in future passes.

### Next steps
Begin round 7 across all fourteen tracked cities in rotation order.
