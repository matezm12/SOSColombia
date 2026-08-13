# Event Facts

## Primary sources (upgraded 2026-08-13 execution pass)

**USGS (fully primary, direct API):**
- Magnitude: 7.4
- Depth: 110.285 km
- Coordinates: 4.8436°N, -76.2422°W ("5 km S of San José del Palmar")
- Time: 2026-08-10T12:34:28Z (07:34:28 local, UTC-5)
- Event ID: us6000tjl2
- Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson

**SGC (Servicio Geológico Colombiano) — reached directly, not just news-relayed:**
- Depth estimate drifted across bulletins: preliminary M6.7/82km → revised M6.6/96km → final ~M7.4/103km. Diverges from USGS (110.3km) — genuine inter-agency discrepancy, not a data error; cite both.
- Coordinates per SGC: ~4.99°N, -76.29°W (vs USGS 4.8436°N/-76.2422°W) — also diverges, log both.
- Aftershocks: 18 recorded by noon Aug 10 (M1.4–4.8, <100km depth, San José del Palmar/Sipí cluster); 130+ by 2026-08-12 06:00 per SGC director Julio Fierro Morales (magnitude range 0.6–4.8, avg depth ~100km).
- Felt reports: 12,000+ people across 900+ towns, max intensity VII.
- **Historical ranking (per SGC): 3rd-largest earthquake in Colombian history**, after 1906 (M8.8) and 1979 Tumaco (M8.1) — corrects the earlier unverified Wikipedia-sourced claim of "strongest since record-keeping began."
- Sources: https://www2.sgc.gov.co/Noticias/Paginas/SGC-actualiza-la-informacion-sobre-el-sismo-ocurrido-en-San-Jose-del-Palmar-Choco.aspx ; https://www.infobae.com/colombia/2026/08/12/tras-el-terremoto-de-74-en-colombia-ya-son-130-las-replicas-confirmo-el-servicio-geologico-colombiano/

**Duration felt:** ~90 sec to 2 min (unchanged from initial pass, tier-6 sourced, not yet independently reconfirmed).

## Unresolved gap: no formal catalog record

- `sish.sgc.gov.co` ("Sismicidad Histórica de Colombia") queried directly — returned "No existe información relacionada." **This tool is the wrong one**: it's a pre-instrumental historical catalog (entries like 1827, 1875, 1973, 2008), not a modern instrumental-event database. Confirms the earlier 1983-Popayán-lookup pattern was also using the wrong tool for a modern event.
- `catalogosismico.sgc.gov.co` (the actual instrumental catalog) is a JS-rendered single-page app — WebFetch cannot execute/query it. **Getting a definitive primary catalog entry/permalink requires browser automation** (explicitly deferred per project decision as of 2026-08-13 — see task_plan.md).

## Aftershocks
- 18 recorded by noon Aug 10 (SGC, primary)
- 130+ by Aug 12 06:00 (SGC, primary)
- Earlier press aggregation had cited "47+" — superseded by the SGC-sourced 130+ figure, which is more current and more directly sourced.

## Felt-intensity zone
14 departments, 403 municipios affected in total emergency footprint (per UNGRD, see wiki/05-gov-reports.md). Heaviest impact: Chocó (epicenter), Risaralda, Valle del Cauca, Caldas, Quindío.

## Change log
- 2026-08-13 (initial pass): Population from Wikipedia aggregator + Infobae/CNN/NPR news search.
- 2026-08-13 (execution pass): Upgraded to USGS primary API (event ID us6000tjl2) and SGC's own bulletins fetched directly. Corrected "strongest since record-keeping" claim to SGC's actual ranking (3rd-largest in Colombian history). Flagged that a formal SGC instrumental-catalog entry still requires browser automation to retrieve — sish.sgc.gov.co and catalogosismico.sgc.gov.co are both dead ends for this event via WebFetch/WebSearch.
