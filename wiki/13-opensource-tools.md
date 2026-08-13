# Open-Source Tools, Datasets & APIs — Registry

Verified execution pass, 2026-08-13. See wiki/06-sources.md for the general fetch-status table this overlaps with; this file is specifically the dataset/API layer for the eventual webapp's data model.

## Live and usable

| Source | URL/endpoint | Schema/content | Status | Recommendation |
|---|---|---|---|---|
| USGS Earthquake API | earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson | magnitude, depth, coords, time, event ID | **live, clean JSON** | Use as the primary seismic-parameters source alongside SGC bulletins |
| DANE population projections | dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/DCD-area-proypoblacion-Mun-2020-2035-ActPostCOVID-19.xlsx | Municipal population by DIVIPOLA code, Cabecera+Rural, 2020-2035 | **live, direct binary download, no auth** | THE authoritative population source going forward — see wiki/14-context-reference.md for extracted 2026 figures per city |
| DANE Geoportal DIVIPOLA files | geoportal.dane.gov.co/descargas/divipola/DIVIPOLA_Municipios.xlsx and DIVIPOLA_Departamentos.xlsx | Municipio/department code-name lookup | **live, direct download confirmed** | Use as the canonical DIVIPOLA lookup table |
| mapadelterremoto.com | mapadelterremoto.com/municipio/{slug} | Per-municipio aggregated data: albergues (shelters) vs centros de acopio (donation points), tracked separately | **live** | Best current analog for the aid-directory feature — but re-verify exact counts against raw page/JSON before shipping any number (counts were inconsistent across fetches in this pass, see wiki/13a-mapadelterremoto-watch.md) |
| PAHO Natural Hazards Monitoring | paho.org/en/natural-hazards-monitoring/natural-hazards-monitoring-{date} | Dated rolling bulletin, not numbered PDFs as originally assumed | **live** | Good secondary corroboration source, cites Blu Radio/UNGRD |
| **Microsoft AI for Good Lab — building damage detection (2026-08-14)** | data.humdata.org, datasets "Colombia - 2026 Earthquake" (Cali) and "Colombia 2026 Earthquake Pereira" | AI-detected building damage from satellite imagery, two building-footprint sources (Google, Overture) cross-checked. **Cali**: Google source 320,178 buildings identified / 621 damaged; Overture 97,085 / 266 damaged. **Pereira**: Google 75,262 footprints (613 of non-cloud-covered predicted damaged, 0.8%); Overture 35,760 footprints (309 damaged, 0.9%). Formats: GeoJSON, GeoTIFF, Geopackage. | **live, downloadable, found via HDX (only reachable via browser — WebFetch 403'd this domain)** | Genuinely new, high-value source — real AI-detected building damage for 2 of the 5 red-alert cities, immediately usable for a damage-map layer. **CONFIRMED 2026-08-14 (Pass 3): no Manizales/Armenia/Quibdó equivalent exists** — searched all 11 Colombia-earthquake datasets on HDX directly, only Cali+Pereira have Microsoft AI for Good data. This is a genuine data gap, not a missed search — don't re-check unless the Lab announces an expansion. Worth cross-referencing against UNGRD's building-collapse figures (140 nationally) since these AI-damage-percentages read low relative to UNGRD's count — could mean AI detection is conservative, or UNGRD's figure includes damage types (structural cracks, etc.) satellite imagery can't detect. |
| OCHA ReliefWeb Flash Update series | reliefweb.int/report/colombia/colombia-flash-update-{NNN} | Multi-sector situation reports, numbered sequentially (004 found so far, dated Aug 12) | **live via browser** | Best single aggregator of primary humanitarian figures found — see wiki/05-gov-reports.md. Only reachable via browser (WebFetch 403's the whole domain). |
| **UNOSAT satellite assessment (NEW, Pass 3, 2026-08-14, not yet opened)** | data.humdata.org, "M 7.4 in South of San José del Palmar, Colombia 10 August 2026" (UNOSAT code EQ20260810COL, GDACS ID 1557236) | Satellite-based geospatial assessment centered on the epicenter region, XLSX format | **found, not yet downloaded/parsed** | Queued in wiki/16-deferred-queue.md — could be a useful map layer for the epicenter area specifically (San José del Palmar/Chocó), distinct from the Cali/Pereira city-level Microsoft datasets. |

## Confirmed dead or wrong tool — stop checking these

| Source | Why dead | 
|---|---|
| datos.gov.co "Emergencias UNGRD" Socrata dataset (wwkg-r6te) | Newest record confirmed via `$select=max(fecha)` query: **2022-12-31**. Not updated in 3+ years. Was the single most promising-looking lead from the scoping pass (ideal DIVIPOLA-keyed schema) but is simply abandoned. Drop entirely. |
| sish.sgc.gov.co | Wrong tool — pre-instrumental historical catalog, doesn't contain modern instrumental events like this one |
| donadora.co / donadora.org | .co doesn't resolve (DNS failure); .org is a Mexican platform, not Colombian, and is currently unreachable (ECONNREFUSED) anyway |

## Blocked — needs browser automation (deferred per project decision)

| Source | Blocker | What it would give us |
|---|---|---|
| reliefweb.int (disaster hub, API, individual reports) | HTTP 403 on every endpoint tried, confirmed WAF/bot block not URL-specific | Aggregated multi-agency sitreps (UNGRD, OCHA, WFP, PAHO) under one disaster ID |
| data.humdata.org (HDX) | HTTP 403, same as ReliefWeb | 511+ Colombia datasets from 65 orgs (general Colombia group exists; quake-specific dataset unconfirmed) |
| medicinalegal.gov.co (INMLCF) | TLS certificate validation failure | Direct numbered Comunicado Oficial bulletins — currently recovered only via press quotes |
| repositorio.gestiondelriesgo.gov.co (UNGRD) | Redirects to :8443, connection refused | UNGRD's actual document archive — currently have zero direct access, all figures via press |
| catalogosismico.sgc.gov.co | JS-rendered SPA | The actual instrumental seismic catalog entry for this event |
| vaki.co campaign pages | Goal/raised/donor figures render client-side | Live crowdfunding totals for Vaki-hosted campaigns |
| HOT OSM Tasking Manager project | Landing page only links via unresolvable bit.ly shortlink | Building-damage trace completion status; underlying data is in mainline OSM regardless, reachable via Overpass API directly (see below) — the HOT website itself isn't the blocker for the data, just for browsing progress |

## Worth exploring further (not fully resolved this pass)

- **Overpass API** against a Chocó/Risaralda bounding box — HOT OSM's building-damage traces land in mainline OpenStreetMap regardless of whether the Tasking Manager site itself is browsable. This is the concrete path to get the actual geodata without needing browser automation on hotosm.org.
- **colombiaenmapas.gov.co (IGAC)** — references WCS/OGC Web Services and ArcGIS FeatureLayer/MapServer/ImageServer endpoints in principle, but no concrete REST URL for municipio boundaries was found. Points to a GitBook (colombia-mapas.gitbook.io) for endpoint specifics — worth a dedicated follow-up read.

## Confirmed to have nothing for this event

- GitHub — no event-specific repos found (`site:github.com colombia earthquake 2026 terremoto` returns only generic earthquake-viz tooling)
- datasketch.co — homepage has zero earthquake mention, general company site
- linternaverde.org — homepage is entirely 2026 Colombian election-monitoring content, unrelated
- Ushahidi, CrisisCleanup, Sahana Eden, ACLED — no evidence of deployment for this event (from Phase 2 scoping pass, not re-checked this execution pass — still worth periodic re-checks since the event is recent)

## Data model implication

`datos.gov.co`'s field schema (fecha, departamento, municipio, evento, divipola, fallecidos, heridos, desaparecidos, personas, familias, viviendas_destruidas, viviendas_averiadas, centros_de_salud, centros_educativos, centros_comunitarios) is still worth using as a **schema reference** for the app's own per-municipio data model, even though the dataset itself is dead — it's DIVIPOLA-keyed and matches Colombia's official administrative hierarchy, which is the right shape regardless of where the actual live data ends up coming from.
