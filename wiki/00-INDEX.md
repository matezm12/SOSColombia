# Wiki Index — SOSColombia

Load this file first each session — map of everything below.

## Event summary (quick reference)
M7.4 earthquake (USGS primary: depth 110.3km; SGC: ~103km), 2026-08-10 07:34 local, epicenter near San José del Palmar, Chocó. SGC's own ranking: 3rd-largest in Colombian history (after 1906 M8.8, 1979 Tumaco M8.1). As of the latest PRIMARY-SOURCE figures (OCHA Flash Update 004, 2026-08-12 18:30): **241 dead** (administrative), 3,771 injured, 49,214 personas afectadas, 30,324 familias damnificadas, 54,900 viviendas destruidas+averiadas, 13 departamentos. INMLCF's own forensic count (also primary, direct-fetched): 230 bodies received / 205 identified (Comunicado 06, Aug 12) — tracked as a separate metric from the administrative toll, see wiki/03-death-toll.md. Missing-persons RESOLVED as two different metrics: 287 official (UNGRD/OCHA) vs ~4,200 crowdsourced self-reports ("Colombia Te Busca"). Government declared national disaster + economic emergency (Decreto 1171 de 2026), created "Fondo Milagro" relief fund; UN's CERF allocated USD 5 million. Red-alert cities: Cali, Pereira, Manizales, Armenia, Quibdó.

| File | Contents | Status |
|---|---|---|
| `01-event-facts.md` | Magnitude, epicenter, depth, aftershocks | populated (tier 2-6, needs direct SGC check) |
| `02-cities/` | One file per affected city | 7 cities populated (Pereira, Cali, Quibdó, Manizales, Armenia, San José del Palmar, Popayán) |
| `03-death-toll.md` | Dated, sourced death toll log | populated, actively rising |
| `04-damnificados.md` | Dated, sourced damnificados/damage log | populated |
| `05-gov-reports.md` | Decree/informe registry | populated, needs primary UNGRD/decree docs |
| `06-sources.md` | Every URL/doc pulled, tier + status | populated, 4 fully fetched, 9 seen-in-snippet only |
| `07-aid-points/` | Shelters/food/health points per city | 6 cities populated (Bogotá=hub, Cali, Pereira, Manizales, Armenia, Popayán) — mostly collection points, NOT distribution/shelter data yet |
| `08-contradictions.md` | Conflicting numbers across sources | 7 logged, 1 resolved, 6 open |
| `09-glossary.md` | Colombian disaster-response terms | populated |
| `10-app-architecture.md` | Webapp design | drafted 2026-08-14 — data model, update-mechanism strategy, stack recommendation (Next.js/Postgres/MapLibre) pending user confirmation |
| `11-crowdfunding-campaigns.md` | GoFundMe/Vaki campaign registry + verification rubric | populated, 4 GoFundMe campaigns with live figures, 2 Vaki campaigns (figures blocked, JS-rendered) |
| `13-opensource-tools.md` | Open-data/API registry | populated — datos.gov.co dead, mapadelterremoto.com + DANE files live |
| `13a-mapadelterremoto-watch.md` | Dedicated tracker on the closest existing analog project | populated, acopio-vs-albergue distinction confirmed |
| `14-context-reference.md` | Population baselines, geo data, historical earthquakes, DNP methodology | populated, real DANE figures for all 6 cities |
| `15-social-media-methodology.md` | X/Instagram/Facebook/TikTok approach + reusable findings | populated — "universal wall" is closed, browser automation works well when logged in |
| `17-allied-resources-and-community.md` | `/recursos` (allied-sites directory) + `/comunidad` (moderated social embeds) — schema, routes, oEmbed-avoidance rationale, research pass | populated 2026-08-14 |

## Affected cities
- Pereira (Risaralda) — highest death toll (volatile, 55-83 range across sources), comms degraded, hometown priority. Aid-points file has verified shelter statuses + 7 CEDE addresses + corrected vet section.
- Cali (Valle del Cauca) — **96 deaths, 1,224 injured, 111 missing** per cali.gov.co's own updated-figures page (Aug 12 8pm — most authoritative single-city figure found in the whole project). Shelters confirmed as one shared complex (Unidad Deportiva Panamericana).
- Quibdó (Chocó) — epicenter region. First shelter confirmed (Coliseo de Boxeo de Quibdó), 4 collection points now cross-verified against 2-3 independent sources each. El Caraño airport reopened. 9 deaths (city) vs 13-14 (Chocó department) — resolved as city-vs-department, not a contradiction.
- Manizales (Caldas) — 6 confirmed deaths (named victims). Shelters identified incl. the Juan Diego Alvira-covered Coliseo Mayor Jorge Arango Uribe (240 people housed).
- Armenia (Quindío) — **CONFIRMED zero deaths** (not a data gap — multiple independent official sources) despite heavy structural damage (2,000+ structures, 30 demolition orders). **No shelter has been activated at all** — confirmed real gap in the emergency response, not missing data.
- San José del Palmar (Chocó) — literal epicenter, **confirmed zero deaths**, but town was cut off by land (15-24+ landslides) and incommunicado ~30 hours; mayor stated as of Aug 11 the town had received NO national or departmental resources. No hospital, only a basic health center. Deepest human-interest coverage found of any location, but still zero formal aid-point infrastructure.
- Popayán (Cauca) — **CONFIRMED NOT a red-alert city** (excluded from Infobae's own red-alert-city list, absent from UNGRD's department death-toll table, Gobernación del Cauca and El País both report zero deaths/injuries in Cauca as of 2026-08-13). Scattered old-building/church damage, ~76,000 users lost power, airport closed but for volcanic-ash (Puracé), not seismic, reasons. One centro de acopio confirmed (Casa de la Moneda), zero albergues found. Population/DIVIPOLA code NOT DANE-confirmed — open gap. See wiki/02-cities/popayan.md.
- Bogotá, Medellín — no significant structural damage, but Bogotá is national aid hub.

## Pattern worth noting across cities
The 3 cities closest to the actual epicenter — San José del Palmar, Quibdó, and Armenia (not epicenter-close but still red-alert) — all show LOWER death tolls than Cali/Pereira, which are farther away. This likely reflects population density and construction patterns, not lower shaking intensity, but it's a real and consistent pattern across independently-verified sources, not noise.

## Open contradictions (see 08-contradictions.md for full detail)
- **RESOLVED**: Missing-persons count (287 vs 4,210) — confirmed to be two different metrics (official institutional vs crowdsourced self-reports), not an error
- **RESOLVED**: La Tarde (Pereira) — confirmed defunct since 2016, El Diario is the real successor
- **RESOLVED**: San José del Palmar population "decrease" — was an aggregator error, DANE shows continuous growth
- **RESOLVED**: Quibdó deaths (9 vs 14) — city-vs-department scope difference
- **DOWNGRADED**: Ukumarí's "emergency pet point" role — could not be substantiated, treat as unconfirmed
- **NEW, OPEN (2026-08-14)**: Popayán death toll — INMLCF's primary Comunicado 05 lists 1 named identified victim under "Unidad Básica: Popayán," directly conflicting with the earlier "zero deaths in Cauca" finding. Not yet reconciled.
- **NEW, OPEN (2026-08-14)**: Familias damnificadas, same day — UNGRD's 07:30 balance (24,324) vs OCHA's 18:30 Flash Update 004 (30,324), same 49,214 personas total in both
- INMLCF forensic body count (230/205) vs OCHA/UNGRD administrative death toll (239-241) — two distinct metrics, gap now narrowed to 11 with the primary OCHA figure, still tracked separately
- Minor SGC/USGS depth + coordinate + aftershock-magnitude discrepancies — still open, genuine inter-agency differences

## Phase 2 research plan — execution mostly done
See `wiki/research-plan-phase2.md` for the full plan and its "Execution status" section for what's landed. Domains 1 (primary toll), 3 (open-source tools), 5 (country/city data), 6 (crowdfunding) all got a solid execution pass. Domain 2 (hyperlocal aid) is now deep for Pereira/Cali/Manizales, lighter for Armenia/Quibdó. Domain 4 (animal/vet) folded into each city's aid-points file rather than a separate file. **The "universal wall" (X/Instagram/Facebook/TikTok) is CLOSED as of 2026-08-14** — see wiki/15-social-media-methodology.md; browser automation with the user's logged-in sessions works well. WhatsApp/Telegram remain deferred (need group invites, not just login).

## Process going forward (established 2026-08-14)
Two-stage launch: **stage 1 = research-complete dataset** (current), **stage 2 = MVP webapp** (after). Full detail in `task_plan.md` → "Governing process" section — read that first. New discipline: mid-pass discoveries get logged to `wiki/16-deferred-queue.md`, not chased immediately. Stage 1 closes with exactly 3 bounded passes (below); everything else that used to sprawl across this list has been moved to the queue file.

## Stage 1 closing passes (bounded — see task_plan.md for exact scope)
1. **Pass 1 — Contradiction closure — DONE 2026-08-14.** Popayán: resolved, 1 confirmed death (Carlos Ernesto Rennella Campo, a real Popayán taxi cooperative member, confirmed across INMLCF + 7 independent outlets — earlier "zero deaths" was a stale early assessment). Familias count: resolved as expected volatility, not an error — a third data point (25,872, Aug 13) sits between the two contested figures. Bonus find: Comunicado 06 adds an "Armenia-Calarcá" victim not resolved as Armenia-city-specific or not — logged as a new open item.
2. **Pass 2 — Small city-level gaps — DONE 2026-08-14.** Popayán DANE population confirmed (349,671, DIVIPOLA 19001). Decreto 1171 substantive content confirmed (signed night of Aug 11, declares national-character disaster, special legal regime) — PDF itself still not located. Risaralda decree substantive powers confirmed (urgencia manifiesta, 6-month duration, Contraloría oversight) — decree NUMBER still unfound after 2 passes, moved to queue. Armenia's Coliseo del Sur shelter upgraded from crowd-reported to officially CONFIRMED (3 independent sources), restricted to pre-assessed families. Manizales official cifras captured (6 fallecidos, 2,000+ damnificados, 550+ revisiones estructurales, curfew Jueves 13 agosto 12am-5am, La Manzana/La Avanzada neighborhoods flagged). Pereira Expofuturo: exact flyer permalink not relocated (closed as non-blocking) but Expofuturo's real activity independently confirmed, plus a bonus corroboration that Coliseo Mayor was at capacity Aug 11 6pm. Bonus finds: Risaralda Nequi donation number (3184411752), "tres días de duelo nacional" announcement (exact dates queued).
3. **Pass 3 — Open-source/tooling closure — DONE 2026-08-14.** HDX confirmed: only Cali+Pereira have Microsoft AI for Good building-damage datasets (11 total Colombia-earthquake datasets on HDX, none for Manizales/Armenia/Quibdó specifically) — not a search failure, genuinely doesn't exist yet. Bonus: found a UNOSAT satellite geospatial dataset for the epicenter region (queued, not opened). mapadelterremoto.com re-verified via raw browser fetch (not lossy WebFetch summary) for all 5 red-alert cities — exact current counts: Cali 266/186, Manizales 247/203, Pereira 136/85, Armenia 60/44 (only "alta" not "crítica"), Quibdó 54/39. Bonus finds: Pereira's Expofuturo collection point now has a much stronger official confirmation (P-420, national campaign, announced by the first lady) than the flyer permalink Pass 2 was chasing; a 7th Pereira site found (Antiguo Colegio La Enseñanza, medical overflow); 2 more Pereira acopio points found (2.500 Lotes, Tokio); Ukumarí's emergency-vet-point role has new stronger evidence that may partially reverse its earlier downgrade — queued for re-check.

**STAGE 1 (research-complete dataset) IS NOW DONE.** All 3 closing passes complete. Next: stage 2 (MVP webapp) — starting with `wiki/10-app-architecture.md`.

## Last updated
2026-08-14 — **Pass 2 (small city-level gaps) done** — see "Stage 1 closing passes" above for full detail. Moving to Pass 3 (open-source/tooling closure) next.

Prior update, same day — **Major primary-source upgrade via browser automation**: retried every WebFetch-blocked source (INMLCF, ReliefWeb, HDX, GoFundMe hub) and found all four were tool-level limitations, not real blocks. Results: (1) INMLCF's full 6-comunicado history captured directly, including a 164-name victim list by city — Pereira has 83 identified victims, the largest single-city count found anywhere in this project; (2) OCHA's Flash Update 004 captured directly — updated national toll (241 dead, 49,214 affected) plus a new fact, a USD 5 million CERF funding allocation; (3) Microsoft AI for Good Lab's satellite-based building-damage datasets found for Cali and Pereira on HDX; (4) GoFundMe's relief hub turned out to be fully enumerable (17 pages of verified campaigns, page 1 captured). Also confirmed two sources are genuinely blocked/empty, not tool artifacts: UNGRD's document repository (real network error) and SGC's reviewed seismic catalog (event hasn't cleared manual QA yet). New contradiction surfaced: INMLCF's primary victim list names 1 Popayán death, conflicting with the earlier "zero deaths" finding.

Prior update (social-media second pass, same day): covered Armenia/San José del Palmar/Popayán. Armenia's Alcaldía X account confirmed dormant since Feb 2025; a crowd-reported shelter (Coliseo del Sur) surfaced but unconfirmed officially; direct citizen criticism of the government response corroborated across 3 platforms. San José del Palmar got journalist-vetted Chocó donation channels. Popayán got 6 new collection-point addresses, revealing mapadelterremoto.com undercounts it. See wiki/15-social-media-methodology.md.
