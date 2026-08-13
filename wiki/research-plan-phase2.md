# Deep Research Plan — Phase 2

Produced 2026-08-13 by a 7-agent workflow (6 parallel domain scopers + 1 synthesis pass). Domain agents did light real scouting (real searches/fetches) to make this concrete, not generic — see each domain's linked stub file in `wiki/` for the raw leads found.

## Execution status (updated 2026-08-13, same-day execution pass)

Most domains have now had a first execution pass (6 more agents, WebSearch/WebFetch only, browser automation still deferred per user decision). Checkboxes below are NOT individually updated — see these files for what actually landed:
- `wiki/01-event-facts.md`, `wiki/03-death-toll.md`, `wiki/08-contradictions.md`, `wiki/05-gov-reports.md`, `wiki/06-sources.md` — primary toll sources (domain 1): USGS confirmed as clean primary source, SGC bulletins reached directly, missing-persons 287-vs-4,210 contradiction RESOLVED (two different metrics, not an error), INMLCF/ReliefWeb/HDX/UNGRD-repositorio remain blocked (confirmed dead ends without browser automation)
- `wiki/07-aid-points/pereira.md` — Pereira hyperlocal (domain 2): shelter statuses, 7 CEDE addresses, vet section corrected (Ukumarí's emergency-pet-point role downgraded to unconfirmed), La Tarde confirmed defunct (El Diario is the real successor)
- `wiki/07-aid-points/cali.md`, `manizales.md`, `armenia.md`, `quibdo.md` — first-pass replication to the other 4 red-alert cities (thinner than Pereira, as expected — flagged gaps in each file)
- `wiki/13-opensource-tools.md`, `wiki/13a-mapadelterremoto-watch.md` — open-source tools (domain 3): datos.gov.co Socrata dataset confirmed DEAD (stale since Dec 2022, dropped), mapadelterremoto.com confirmed live with the acopio-vs-albergue distinction verified directly from the site, DANE population/DIVIPOLA files confirmed directly downloadable
- Animal/vet aid (domain 4): folded into each city's `wiki/07-aid-points/<city>.md` rather than a separate file (category didn't grow large enough to warrant a fork) — Fixit hotline confirmed active, Hospital Maraya confirmed still closed, ICA livestock gap confirmed still empty, new leads added for Manizales/Armenia/Cali
- `wiki/14-context-reference.md` — country/city data (domain 5): real DANE population figures for all 6 cities (superseding the aggregator), San José del Palmar population-decrease contradiction resolved (was an aggregator error), 1999 Eje Cafetero comparison deepened (Pereira/Manizales tolls still not found in primary form — flagged as a real gap)
- `wiki/11-crowdfunding-campaigns.md` — crowdfunding (domain 6): Camila Franco's campaign confirmed real via the user's direct link ($1,600 goal / $1,262 raised / 19 donors, Pereira-focused), 3 more GoFundMe campaigns got live figures, Vaki campaigns confirmed real but figures are JS-blocked, donadora.co/org confirmed irrelevant (wrong country/unreachable)

**Still deferred (explicit user decision, 2026-08-13):** all social-media/logged-in access work (X/Instagram/Facebook/TikTok/WhatsApp/Telegram hashtag & timeline browsing) — this is "the universal wall" and needs browser automation (claude-in-chrome), planned for later, not this pass.

**Scope correction from the user (post-synthesis):** the Pereira hyperlocal methodology (domain 2 below, and its output file `wiki/15-social-media-methodology.md`) is a **template to replicate across every affected city** — Cali, Manizales, Armenia, Quibdó, San José del Palmar, not just Pereira. Pereira stays priority #1 (hometown, highest toll, most concrete leads found), but `wiki/07-aid-points/<city>.md` for the other four red-alert cities needs the same categorized-table treatment (shelters/food/health/vet/donation, each row sourced+timestamped) once the Pereira pass proves out the method.

## Overview

Phase 1 established the national toll skeleton, 6 city profiles, and ~40 donor drop-off points — but left the core product gap unsolved: the webapp needs *distribution* points (where affected people actually get shelter/food/health/vet aid), not *collection* points, and its toll numbers rest on press-relayed figures with an unresolved contradiction (287 vs 4,210 missing). Phase 2 covers six domains — primary-source toll data, hyperlocal city sourcing (piloted on Pereira, then replicated), open-source disaster-tech tools, veterinary/animal aid, crowdfunding, and country/city reference data — chosen to close those two gaps directly.

## Priority order

1. **Primary-source toll & damnificados tracking** — foundational: every other domain's numbers are only as credible as this pipeline, and it directly resolves the open 287-vs-4,210 contradiction plus feeds three existing wiki files (03, 04, 08). Strong concrete leads (PAHO sitrep fetched successfully, INMLCF communiqué URL pattern found, ReliefWeb/HDX hub identified) make this immediately actionable, not just aspirational.
2. **Hyperlocal aid directory — Pereira first, then Cali/Manizales/Armenia/Quibdó** — hometown priority *and* the best-evidenced fix for the flagged "donor points ≠ distribution points" gap: the Pereira pass already named 6 shelters with locations, 7 activated collection-center addresses, and specific vet leads — more concrete yield than any other domain. Same method replicates to the other 4 cities.
3. **Open-source tools/datasets & APIs** — potential force-multiplier: mapadelterremoto.com and HOT OSM's Tasking Manager could supply distribution/shelter-point data for *all five* red-alert cities at once (not just Pereira), and datos.gov.co's Socrata schema is ready to become the app's canonical per-municipio data model the moment it's populated.
4. **Veterinary/animal welfare directory** — "free vet health" is an explicit named category of the webapp's aid-directory feature, and this domain already produced Pereira-specific, addressable leads (Ukumarí, Maraya, Fixit hotline) rather than just national generalities.
5. **Country/city context/reference data** — necessary denominators (population baselines, historical-earthquake comparison, DNP methodology) that make toll numbers meaningful, but nothing here blocks shipping the core three features — lower urgency than 1–4.
6. **Crowdfunding/donation campaigns** — not one of the three named webapp features (death toll, damnificados, gov reports, aid directories); useful bonus content and scam-protection value, but weakest tie to core scope and the highest data-decay rate (live JS-rendered totals), so it ranks last.

---

## Per-domain plan

### 1. Primary-source toll & damnificados tracking

**Objective**: Move toll/damnificados data off press-relayed numbers onto citable primary sources with explicit `(source, metric, value, as_of_datetime, retrieved_at, url)` records, and resolve or precisely caveat the 287-vs-4,210 missing-persons contradiction.

**Sources**
| Source | URL | Tier | Notes |
|---|---|---|---|
| SGC seismic bulletins | sismo.sgc.gov.co, sish.sgc.gov.co/visor/, catalogosismico.sgc.gov.co, x.com/sgcol | 1 | Multiple overlapping subdomains — determine canonical one; X posts ARE individually indexed |
| UNGRD | portal.gestiondelriesgo.gov.co, repositorio.gestiondelriesgo.gov.co/handle/20.500.11762/764, x.com/UNGRD | 1 | No confirmed downloadable numbered sitrep PDF yet — check repo + X feed directly |
| INMLCF (Medicina Legal) | medicinalegal.gov.co/.../comunicado-oficial-03 (and -04, likely sequential) | 1 | **WebFetch hit TLS cert error** — needs browser automation or alt fetch path |
| DANE | dane.gov.co | unconfirmed | No quake-specific product found; may just be unindexed, not absent |
| ReliefWeb | reliefweb.int/disaster/eq-2026-000146-col, api.reliefweb.int/v1/reports | 1.5 | **403 on WebFetch** — likely bot/WAF block on public API, retry via browser |
| HDX | data.humdata.org/group/col | 1 | **403 on WebFetch** — same likely transient block |
| PAHO/OPS | paho.org SitRep 1 (fetched OK), paho.org "Natural Hazards Monitoring" daily bulletin | 1.5 | SitRep 2/3 not yet located — check numbered PDF pattern |
| OCHA Flash Updates | referenced via UN News, likely hosted reliefweb.int/unocha.org | 1.5 | Direct URL not yet found |
| U.S. Embassy Bogotá alerts | co.usembassy.gov/natural-disaster-alert-... | 2 | Cross-check source, not primary Colombian data |

**Search queries to run**
- `sgc.gov.co sismo San José del Palmar Chocó agosto 2026`
- `site:medicinalegal.gov.co comunicado oficial terremoto agosto 2026`
- `reliefweb.int Colombia earthquake situation report 2 3 4`
- `"informe de situación" UNGRD terremoto agosto 2026 filetype:pdf`
- `OCHA "Flash Update" Colombia terremoto 2026`
- `paho.org informe de situación 2 Colombia terremoto`

**Challenges + workarounds**
- INMLCF TLS cert failure → retry with browser automation (claude-in-chrome) or relaxed-cert fetch, not repeated WebFetch attempts.
- ReliefWeb/HDX 403s → same; both are normally open APIs, so this is almost certainly a WAF/bot wall on the sandboxed fetch tool, not a real restriction.
- Multiple simultaneous "current" tolls exist because sources snapshot at different timestamps, not because they truly conflict — data model must store `(source, metric, value, as_of, retrieved_at, url)` tuples, never a single "current toll" field, or the app will keep re-manufacturing contradictions like 287-vs-4,210.
- 287-vs-4,210 missing-persons gap: circumstantial evidence (Risaralda: 77% of cell towers down day-after) supports the high figure being an early "sin contacto" estimate later walked back — but no source explicitly states the revision. Needs a ReliefWeb/OCHA sitrep timeline pull to confirm sequencing.
- `site:ungrd.gov.co` did not reliably scope results — prefer direct WebFetch of guessed URLs over site-restricted search for .gov.co domains.

**Wiki output**: Upgrade `wiki/06-sources.md` (add tier/cadence/access-method columns) + restructure `03-death-toll.md` and `04-damnificados.md` into explicit time-series tables instead of single "current" values; update `08-contradictions.md` with the missing-persons timeline once resolved.

**Checklist**
- [ ] Direct-fetch sish.sgc.gov.co for the actual 2026-08-10 event record (not just the 1983 Popayán precedent already pulled)
- [ ] Retry medicinalegal.gov.co via browser automation to get Comunicados Oficiales 01–05+ with per-city breakdowns
- [ ] Retry reliefweb.int and data.humdata.org via browser automation to bypass the 403s
- [ ] Locate PAHO SitRep 2/3 and OCHA Flash Update direct URLs
- [ ] Crawl repositorio.gestiondelriesgo.gov.co (UNGRD DSpace) for a numbered balance/boletín collection
- [ ] Build the timeline needed to confirm/deny the 287-vs-4,210 reconciliation hypothesis
- [ ] Convert `03-death-toll.md`/`04-damnificados.md` to the `(source, metric, value, as_of, retrieved_at, url)` schema

---

### 2. Hyperlocal city deep-dive — Pereira first, replicate to Cali/Manizales/Armenia/Quibdó

**Objective**: Build address-level directories (shelters, food, health brigades, vet aid, informal donation points) per city, cross-referencing official channels against crowd-reported ground truth. Piloted on Pereira metro (Pereira, Dosquebradas, Santa Rosa de Cabal, La Virginia) given confirmed comms outages there; **same method then runs for Cali, Manizales, Armenia, Quibdó**.

**Sources (Pereira pilot — see `wiki/15-social-media-methodology.md` for the reusable method + per-platform feasibility notes)**
| Source | URL | Tier |
|---|---|---|
| Alcaldía de Pereira (X, Instagram) | x.com/Alcaldiapereira, instagram.com/alcaldiadepereira | 1 |
| Gobernación de Risaralda | risaralda.gov.co | 1 |
| Cruz Roja Colombiana (Pereira line) | cruzrojacolombiana.org, 316 478 1821 | 1/2 |
| El Diario (ex–Diario del Otún) | eldiario.com.co, x.com/eldiariopereira, instagram.com/eldiariopereira | 2 |
| CiudadRegion | ciudadregion.com/regiones/risaralda/pereira | 2 |
| La Patria | lapatria.com/eje-cafetero | 2 |
| colombiamagico.com Pereira blog | colombiamagico.com/blog/pereira-earthquake-how-to-help-es | 3 (aggregator, verify each claim) |
| Red de Apoyo Orión (Johan Vargas) | no direct handle found — via news profile only | 3/4 |
| La Tarde (Pereira) | **unconfirmed active — not found in this pass** | unverified |

**For Cali/Manizales/Armenia/Quibdó**: repeat with each city's own Alcaldía/Gobernación channels + local outlet equivalent (find each city's version of "El Diario"/"CiudadRegion" first — not yet identified for the other 4 cities).

**Search queries to run (Pereira, then swap city name for the other 4)**
- `albergues <city> terremoto agosto 2026`
- `Alcaldía de <city> Twitter terremoto puntos de ayuda`
- `<city metro-area suburb> terremoto albergue ayuda agosto 2026`
- `brigada de salud gratuita <city> terremoto agosto 2026`
- `site:instagram.com <city> terremoto ayuda albergue`
- `Gobernación de <department> terremoto reporte oficial`

**Challenges + workarounds**
- Plain hashtag search (`#PereiraTeNecesita`) is not real hashtag search — it returns loose keyword matches, not a platform feed. **Workaround**: escalate to claude-in-chrome browser automation with a logged-in X/Instagram session to browse the hashtag/location feed directly — this is the single highest-value tool upgrade for this domain, and applies to all 5 cities equally.
- WhatsApp/Telegram content (e.g. Red de Apoyo Orión's 6 coordination groups) is fully invisible to web search — only reachable via news articles describing them, or by joining via a link if one surfaces.
- Facebook is the weakest platform via `site:` search (highest irrelevant-result ratio of the four tested).
- Per-city tolls are *more* volatile across outlets than the national figure (Pereira alone: 66 vs 79 vs 72 vs 67 dead seen across passes) — every number needs an explicit source+timestamp. Expect the same for the other 4 cities.
- Confirmed real comms outage in Pereira compounds the above: this isn't just a tool limitation, the disaster itself is suppressing real-time crowd reporting — check whether Cali/Manizales/Armenia/Quibdó have similar outages.

**Wiki output**: Expand each existing `wiki/07-aid-points/<city>.md` (do not duplicate into separate hyperlocal files — keep one source of truth per city) with categorized tables (shelters, food, health brigades, vet aid, donation points) each carrying address/status/contact/source+timestamp. `wiki/15-social-media-methodology.md` documents the platform wall and escalation path once, reusably, instead of re-discovering it per city.

**Checklist**
- [ ] Pereira: confirm which of the 6 named shelters (Coliseo Mayor, Parque El Vergel, Parque El Oso, Estadio Mora Mora, Parque Olaya Herrera, Plaza de Ferias) are still open vs consolidated
- [ ] Pereira: itemize the 7 activated collection centers (CDEs: Parque Industrial, 2.500 Lotes, Tokio, Consota, Kennedy, Ormazá, San Nicolás) and confirm distribution vs collection function
- [ ] Pereira: confirm La Tarde's active status with a direct URL check
- [ ] Pereira: run claude-in-chrome against #PereiraTeNecesita and location-tagged posts on X/Instagram
- [ ] Pereira: get a direct answer from Gobernación de Risaralda's site on department-wide balance figures
- [ ] Pereira: identify which comunas are still without mobile signal, and whether a local radio station is broadcasting live aid-point updates
- [ ] **Replicate the full Pereira pass for Cali, Manizales, Armenia, Quibdó** — start by identifying each city's local news outlet equivalent and official Alcaldía/Gobernación social handles
- [ ] San José del Palmar (epicenter town): still has almost no dedicated coverage of any kind — treat as its own priority gap within this domain, not merely folded into Quibdó/Chocó

---

### 3. Open-source projects, datasets, and APIs

**Objective**: Identify existing open-data platforms/APIs/crowdsourced-mapping efforts to pull from or integrate, rather than duplicating them — especially for the distribution-point gap and for map/geo layers. National in scope — covers all cities at once.

**Sources**
| Source | URL | Tier | Status |
|---|---|---|---|
| datos.gov.co "Emergencias UNGRD" (Socrata) | datos.gov.co/resource/wwkg-r6te.json | 1 | API confirmed live, schema confirmed excellent (DIVIPOLA-keyed), but Aug-2026 query returned empty — needs recheck |
| ReliefWeb | reliefweb.int/disaster/eq-2026-000146-col | 1 | 403 on WebFetch, real sitreps confirmed to exist via search |
| HDX | data.humdata.org/group/col | 1 | 403 on WebFetch |
| HOT OSM 2026 Colombia Earthquake Response | hotosm.org/en/projects/2026-colombia-earthquake-response | 1/2 | **Confirmed active** — Tasking Manager + ChatMap field tool, covers Cali/Pereira/Quibdó |
| mapadelterremoto.com (Naboo Intelligence) | mapadelterremoto.com | 2 | **Highest-value new find** — 2,082 affected points, 317 municipios, 206 shelter/acopio points incl. 31 in Pereira; no API/bulk download yet, open format promised after Nov 30 2026 |
| IGAC / Colombia en Mapas | colombiaenmapas.gov.co, igac.gov.co/datos-abiertos | 1 | Boundary geodatabases, download flow untested |

**Search queries to run**
- `site:github.com colombia-earthquake-2026 OR "terremoto-colombia" repo` (re-run periodically — none found yet, but only 3 days old as of this pass)
- `datos.gov.co Emergencias UNGRD JSON API terremoto agosto 2026` (retry filtered query with alt date-field syntax)
- `HOT OSM Tasking Manager Colombia earthquake 2026 project ID`
- `mapadelterremoto.com Pereira puntos de acopio` (then repeat for Cali/Manizales/Armenia/Quibdó)
- `DATASketch OR Linterna Verde terremoto Colombia 2026` (direct site visit, not just search)

**Challenges + workarounds**
- HDX/ReliefWeb 403s: same as domain 1 — retry via browser automation before concluding inaccessible.
- datos.gov.co Socrata query for Aug-2026 rows returned empty — unclear if genuine reporting lag or wrong query syntax; verify via the dataset's own browser filter UI.
- mapadelterremoto.com's 206 "acopio" points carry the same ambiguity as the original ~40 donor points — "acopio" historically means *collection* in Spanish, so treat as unconfirmed distribution data until page-level verification, for ALL cities it covers, not just Pereira.
- No GitHub repo, Ushahidi, CrisisCleanup, or Sahana Eden deployment found for this specific event — absence of evidence isn't proof of nonexistence at only 3 days post-event; re-check periodically.

**Wiki output**: `wiki/13-opensource-tools.md` (registry: tier, URL, API endpoint, confirmed schema, live/stale/blocked status, last-verified date) — the datos.gov.co field list should become the canonical schema reference for the app's own data model. `wiki/13a-mapadelterremoto-watch.md` as a dedicated tracker on the Naboo Intelligence site specifically.

**Checklist**
- [ ] Retry ReliefWeb/HDX access via browser automation
- [ ] Re-poll datos.gov.co Emergencias UNGRD dataset with corrected date-field syntax; if still empty, check the dataset's own web UI filter
- [ ] Visit mapadelterremoto.com's per-city filtered views (Pereira first, then Cali/Manizales/Armenia/Quibdó) and determine collection-vs-distribution status of its points in each
- [ ] Visit HOT OSM's actual Tasking Manager project (not just the landing page) to get the project ID/bounding box and test Overpass API extraction
- [ ] Direct-visit datasketch.co and linternaverde.org (not just search snippets)
- [ ] Test IGAC/Colombia en Mapas' shapefile download flow — confirm scriptable vs GUI-only

---

### 4. Veterinary / animal welfare aid (national + Pereira priority, replicate per city)

**Objective**: Directory of where displaced/affected pets, livestock, and wildlife can get emergency vet care, shelter, food, and reunification — separating government infra, formal NGOs, and informal volunteer efforts, and flagging unverified contact info explicitly rather than omitting real-but-undocumented orgs.

**Sources**
| Source | Details | Tier |
|---|---|---|
| Ukumarí Bioparque (Pereira) | de facto emergency pet point; address/phone not yet confirmed | 1 |
| Pelulandia (Pereira, near Ukumarí) | municipal-linked, pre-existing full-service facility; earthquake role unconfirmed | 1 |
| Hospital Público Veterinario de Maraya (Pereira) | **confirmed temporarily closed** — flag CLOSED, don't list as active | 1 |
| Fundación Siempre a Tu Lado (Dosquebradas/Pereira) | damaged, relocated, no published contact | 3 |
| Fixit remote vet telehealth | 333 602 5800 / 601 438 7525, free 24h, national | 2 |
| "Una Garra por Colombia" (Vaki, Camilo Jaramillo) | vaki.co/vaki/una-garra-por-colombia; covers 32 shelters/~1,870 animals; drop points in Bogotá/Cali/Medellín only — **not Pereira** | 2 |
| Nicolás Arbeláez volunteer vet brigade | Instagram @nicolas.arbelaez.94; targets Pereira/Manizales/Chocó | 3 |
| Gobernación de Risaralda — Secretaría de Desarrollo Agropecuario | risaralda.gov.co; pre-existing program, no confirmed quake-specific activation | 1 |
| Fundación Kenovy (Armenia) | 113 dogs affected, 2 died | 2 |
| Centro de Bienestar Animal de Cali / Royi Pets (Cali) | outbound brigades + private clinic sheltering pets | 2/3 |

**Search queries to run**
- `Ukumarí Pereira terremoto animales dirección teléfono`
- `Centro de Bienestar Animal Pereira mascotas perdidas terremoto`
- `veterinaria brigada terremoto <city> agosto 2026` (Pereira done — repeat for Cali/Manizales/Armenia/Quibdó)
- `ICA Instituto Colombiano Agropecuario terremoto ganado Chocó Risaralda` (unexplored — livestock gap)
- `World Animal Protection Colombia terremoto agosto 2026` (confirm absence, not just re-search same terms)

**Challenges + workarounds**
- Same social-media wall as domain 2 — hashtag search (`#MascotasPerdidasEE`, `#UnaGarraPorColombia`) only surfaces news articles referencing them, not live posts.
- Pervasive contact-info gap: multiple orgs explicitly reported as having "no published phone or account" — the wiki must carry an explicit `contact_verified: true/false` field rather than fabricate or omit.
- No dedicated government animal-welfare task force found for this event — response is NGO/volunteer-driven; represent this honestly, not smoothed over.
- Livestock/farm-animal veterinary care (distinct from Fedegán's human-food milk/meat aid) is essentially uncovered — try ICA and agricultural/campesino-focused outlets, not mainstream news.
- High time-decay: operational status changes daily (e.g., Siempre a Tu Lado had to fully vacate) — needs `last_verified` timestamp more urgently than the static gov-report archive.

**Wiki output**: Extend each `wiki/07-aid-points/<city>.md` with a veterinary/animal-aid subsection, or a parallel `wiki/12-animal-welfare/<city>.md` set mirroring the `07-aid-points/` structure if the category grows large enough to warrant separation.

**Checklist**
- [ ] Call/DM Ukumarí directly to confirm address, hours, phone for its pet-care role
- [ ] Confirm Pelulandia's earthquake-response involvement (or lack thereof)
- [ ] Search ICA (Instituto Colombiano Agropecuario) for livestock/farm-animal relief — untouched gap
- [ ] Verify Fixit hotline is still operating
- [ ] Confirm reopening timeline for Hospital Público Veterinario de Maraya
- [ ] Add `contact_verified` boolean to the animal-aid wiki schema
- [ ] Repeat the vet/animal search pass for Manizales, Armenia, Quibdó (Cali has a start via Centro de Bienestar Animal/Royi Pets)

---

### 5. Country/city contextual & reference data

**Objective**: Population baselines, geographic boundary data, historical-earthquake comparisons, and DNP's official damage-assessment methodology — the denominators and reference layers needed to make toll numbers meaningful (% of population affected) and to preview what an eventual official damage report will look like. Covers all 6 cities (Cali, Pereira, Manizales, Armenia, Quibdó, San José del Palmar).

**Sources**
| Source | URL | Tier |
|---|---|---|
| DANE population projections | dane.gov.co/.../proyecciones-de-poblacion | 1 — primary; figures used so far came from a third-party aggregator (telencuestas.com), needs direct verification |
| DANE Geoportal | geoportal.dane.gov.co; direct: .../descargas/divipola/DIVIPOLA_Municipios.xlsx, DIVIPOLA_Departamentos.xlsx | 1 |
| TerriData (DNP) | terridata.dnp.gov.co | 1 — per-city fichas found for Pereira/Quibdó but may be stale (~2014 data) |
| IGAC / Colombia en Mapas | colombiaenmapas.gov.co, igac.gov.co/datos-abiertos, datos.icde.gov.co | 1 |
| SGC historical seismicity visor | sish.sgc.gov.co/visor/ | 1 — 1983 Popayán precedent pulled; 2026 event itself not yet queried here |
| DNP PDNA/EDANA methodology docs | minambiente.gov.co PDF, colaboracion.dnp.gov.co PDFs, CONPES 3146 (1999 precedent) | 1 |

**Concrete population figures already found (need direct-DANE verification before citing as authoritative)**
- Pereira: 487,820 (2026)
- Cali: 2,269,983 (2026)
- Manizales: 475,690 (2026)
- Quibdó: 143,332 (2026)
- Armenia: only 2023 figure found (304,311) — 2026 municipal figure still missing
- San José del Palmar: DIVIPOLA 27660 — conflicting figures 5,697 (2024) vs 5,130 (2025), unresolved

**Search queries to run**
- `DANE proyección población Armenia Quindío 2026` (Armenia municipal 2026 figure still missing)
- `San José del Palmar Chocó población DANE censo` (resolve the 5,697→5,130 apparent decrease)
- `DANE geoportal descarga shapefile municipios divipola` (test actual scriptable download)
- `terremoto Eje Cafetero 1999 cifras Pereira Manizales DANE FOREC` (isolate Pereira/Manizales tolls, not just Armenia's — 1999 is the single most relevant historical precedent since it hit the same cities now on red alert)
- `CONPES OR PDNA terremoto Colombia agosto 2026` (check for a 2026-specific assessment starting to appear)

**Challenges + workarounds**
- All population figures used so far are third-party-aggregated, not pulled directly from dane.gov.co — every number needs a direct spot-check before being committed to the wiki as authoritative.
- San José del Palmar shows a population *decrease* between 2024/2025 aggregator figures — flag as unresolved (same pattern as the missing-persons contradiction) rather than silently picking one.
- Geographic download portals' landing pages were found but the actual download flow (shapefile/GeoJSON export) was never exercised — may require browser automation if JS-gated.
- 1999 Eje Cafetero comparison figures come from anniversary retrospective journalism citing DANE/CEPAL (1,185 dead / 8,536 injured / 35,972 homes destroyed nationally; Armenia alone ~800 dead, ~75% of city population damnificados), not the original DANE/FOREC report — good enough for planning, not for final citation.
- No CONPES/PDNA-style report exists yet for the 2026 event — this domain's "expected format" preview is necessarily inferential from the 1999 precedent until one appears.

**Wiki output**: `wiki/14-context-reference.md` (split into `14a-population-baselines.md`, `14b-geographic-data-sources.md`, `14c-historical-earthquakes.md`, `14d-dnp-methodology.md` if each grows large), with the 1999 Eje Cafetero comparison flagged as the single most relevant historical precedent.

**Checklist**
- [ ] Pull all 6 population figures directly from dane.gov.co, not the aggregator
- [ ] Resolve the San José del Palmar 2024→2025 population-decrease question
- [ ] Test DANE Geoportal / IGAC shapefile download flow for scriptability
- [ ] Query SGC's sish.sgc.gov.co directly for the actual 2026-08-10 event record
- [ ] Find the original DANE/FOREC 1999 report for a true per-city (not just Armenia) breakdown
- [ ] Watch for a 2026-specific CONPES/PDNA publication as the disaster response matures

---

### 6. Crowdfunding / donation campaigns

**Objective**: Catalog individual crowdfunding campaigns (GoFundMe, Vaki, Donadora) across ALL red-alert cities (Pereira, Cali, Manizales, Armenia, Quibdó) and define a verified/red-flag rubric — lowest priority since it's not one of the three named webapp features, but useful as scam-protection content.

**Sources**
| Source | URL | Tier |
|---|---|---|
| GoFundMe Colombia Earthquake Relief Hub | gofundme.com/c/act/colombia-earthquake-relief | 1 — JS-rendered, needs browser automation to enumerate listings |
| Rescate x Colombia (Laura U) | gofundme.com/f/rescate-x-colombia-movilizamos-ayuda-a-la-zona-del-sismo | 2 |
| Colombia Earthquake: Help Families Rebuild (Dahiana Parra) | gofundme.com/f/colombia-earthquake-help-families-rebuild | 2 |
| Yo Tengo Fe por el Pacífico (Willy García) | via El Tiempo coverage; Vaki-hosted | 1/2 — press-corroborated, targets Buenaventura/Chocó |
| Vaki Uniandina | vaki.co/en/vakiuniandina | 1/2 |
| colombia.com fraud-alert article | colombia.com/.../terremoto-estafas-fraudes | 1 — source for red-flag rubric |
| GoFundMe fraud-recognition doc | support.gofundme.com/.../Recognizing-online-fraud-schemes | 1 — Giving Guarantee as a trust signal |
| "Camila Franco" campaign | **unresolved** — closest match is an unrelated 2020 fundraiser (organizer named Camila Franco, but for a house fire, not this earthquake) | unverified |

**Search queries to run**
- `site:gofundme.com Colombia terremoto Pereira Manizales Armenia Quibdo`
- `vaki.co crear vaki terremoto Pereira Chocó víctimas ayuda`
- `donadora.co terremoto Colombia 2026` (re-run periodically — zero hits so far, real gap or indexing gap unclear)
- `"Camila Franco" terremoto Colombia recaudación fondos` (needs the user to supply the actual link if this is real)

**Challenges + workarounds**
- No login access to X/Instagram/TikTok/Facebook — grassroots campaign discovery via hashtags is invisible to plain search; workaround is claude-in-chrome or reliance on news articles that embed social posts.
- GoFundMe/Vaki pages are JS-rendered — WebFetch gets only the static shell, missing goal/raised figures; every campaign needs a live browser visit, and figures must be timestamped since they change constantly.
- **The "Camila Franco" campaign could not be confirmed to exist for this earthquake at all** — needs a direct link from the user before cataloging as real.
- Long tail of small hyper-local campaigns (a family posting a bank account on Instagram) is systematically invisible to this methodology — the resulting catalog will skew toward press-covered campaigns; flag this bias explicitly rather than presenting the list as exhaustive.

**Wiki output**: `wiki/11-crowdfunding-campaigns.md` — table (Platform | Campaign | Organizer | City Focus | Link | Verification Tier | Goal | Raised | Last Checked) plus a standalone Verification Rubric section (green-flags: platform-hub inclusion, Giving Guarantee, institutional affiliation, press coverage, transparent fund-use plan; red-flags: WhatsApp-only forwarded links, urgency/credential-harvesting, anonymous new organizer, no press mention).

**Checklist**
- [ ] Get the actual "Camila Franco" link from the user, or drop the lead
- [ ] Browser-visit the GoFundMe relief hub to enumerate the full campaign list with live goal/raised figures
- [ ] Browser-visit each already-found campaign for current totals
- [ ] Check whether Vaki has a disaster-relief hub page analogous to GoFundMe's
- [ ] Draft the verification rubric as a reusable badge-logic spec

---

## Cross-cutting notes

- **Platform wall is universal, not domain-specific**: no logged-in access to X/Instagram/Facebook/TikTok/WhatsApp/Telegram means every domain hits the same ceiling — WebSearch surfaces only already-indexed individual posts/pages, never live timelines, hashtag feeds, location tags, or closed-group content. **The single highest-leverage next step across all six domains is standing up claude-in-chrome browser automation with a logged-in session** rather than repeating WebSearch queries with slightly different phrasing.
- **Facebook is the weakest platform via `site:` search** (highest irrelevant-result ratio) across every domain tested — deprioritize it relative to X/Instagram/TikTok when doing platform-specific passes.
- **`site:` scoping is unreliable on some .gov.co domains** (confirmed on ungrd.gov.co) — prefer direct WebFetch of guessed/known URLs over site-restricted search for government domains.
- **ReliefWeb and HDX both 403'd on plain WebFetch** in this pass, most likely a WAF/bot block rather than a genuine access restriction (both are normally open APIs) — retry via browser automation before concluding they're inaccessible; don't let this 403 propagate into the wiki as "source unavailable."
- **Real vs. dead-end tools found**: HOT OSM's 2026 Colombia activation and mapadelterremoto.com are real, active, and directly relevant — prioritize deeper passes on both. Ushahidi, CrisisCleanup, Sahana Eden, ACLED, and Donadora showed zero evidence of deployment for this event — treat as open questions to re-check periodically (event is only 3 days old), not confirmed absences.
- **Timestamp-everything data model**: the 287-vs-4,210 contradiction, the multiple simultaneous "current" national tolls, and the San José del Palmar population discrepancy are all instances of the same root cause — treating asynchronous snapshots as one number. Every ingested figure across every domain needs `(source, metric, value, as_of_datetime, retrieved_at, url)`, never a bare "current value." Apply this retroactively to `03-death-toll.md` and `04-damnificados.md`, not just new files.
- **"Acopio" ≠ distribution**: this ambiguity recurs in the original ~40-point dataset, mapadelterremoto.com's 206 points, and Una Garra por Colombia's collection points. Any new source using "acopio," "punto de recolección," or "centro de acopio" language needs explicit page-level verification of whether affected people can receive aid there, or only donors can drop items off — don't assume based on the org's overall mission.
- **`contact_verified` / `last_verified` fields**: multiple domains (aid points, animal welfare) found orgs explicitly reported as having no published contact info. Add a boolean `contact_verified` flag and a `last_verified` date to every aid-directory schema so the frontend can visually distinguish confirmed from under-documented entries, rather than silently omitting real relief efforts or fabricating details.

**New wiki files/structure for this phase** (numbering continues from existing 00–10):
- `wiki/11-crowdfunding-campaigns.md` — registry + verification rubric (domain 6)
- `wiki/12-animal-welfare/` — per-city directory mirroring `07-aid-points/` structure (domain 4), or a subsection within each existing `07-aid-points/<city>.md` if the category stays small
- `wiki/13-opensource-tools.md` + `wiki/13a-mapadelterremoto-watch.md` — dataset/API registry and a dedicated tracker on the single closest existing analog project (domain 3)
- `wiki/14-context-reference.md` (or split a/b/c/d) — population baselines, geo data sources, historical earthquakes, DNP methodology (domain 5)
- `wiki/15-social-media-methodology.md` — documents the platform wall + browser-automation escalation path once, reusably, instead of re-discovering it in every city pass (domain 2, generalizes to ALL cities per the user's scope correction)
- **Structural change, not a new file**: convert `03-death-toll.md` and `04-damnificados.md` to explicit time-series tables per the timestamp-everything note above (domain 1)
- Expand (don't fork) each `wiki/07-aid-points/<city>.md` with the hyperlocal categorized tables from domain 2, keeping one source of truth per city — Pereira first, then Cali/Manizales/Armenia/Quibdó

---

## Immediate next actions (first session of Phase 2)

- [ ] Stand up claude-in-chrome browser automation and do a first real pass on medicinalegal.gov.co (TLS-blocked), reliefweb.int and data.humdata.org (403-blocked) — this single fix unblocks the highest-priority items in three domains at once
- [ ] Retry the datos.gov.co Emergencias UNGRD Socrata query for Aug-2026 rows via the dataset's own web filter UI, not just the API
- [ ] Visit mapadelterremoto.com's per-city filtered views (Pereira first) and determine whether its points are distribution or collection points — this could close (or definitively confirm still-open) the top-flagged product gap
- [ ] Run a browser-automation pass on #PereiraTeNecesita and @Alcaldiapereira's live X/Instagram feeds for real-time shelter/food status updates
- [ ] Confirm the 6 named Pereira shelters' current open/closed status and itemize the 7 activated collection centers
- [ ] Direct-fetch sish.sgc.gov.co for the actual 2026-08-10 event's primary seismic record
- [ ] Call/DM Ukumarí to get real address/hours/phone for its emergency pet-care role
- [ ] Pull all 6 cities' DANE population figures directly from dane.gov.co (not the aggregator) to unblock the % population baseline
- [ ] Get the "Camila Franco" campaign link from the user or drop the lead from the crowdfunding registry
- [ ] Once Pereira's hyperlocal pass is validated end-to-end, replicate it for Cali, Manizales, Armenia, and Quibdó
