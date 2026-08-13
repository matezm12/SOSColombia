# Country/City Context & Reference Data

## Population baselines — DANE official (verified 2026-08-13, supersedes earlier aggregator figures)

Source: DANE's own file `DCD-area-proypoblacion-Mun-2020-2035-ActPostCOVID-19.xlsx` (dane.gov.co, directly downloaded and parsed — see wiki/13-opensource-tools.md). This is the authoritative source; the earlier telencuestas.com aggregator figures are superseded below.

| City | DIVIPOLA | DANE 2026 population (official) | Earlier aggregator figure | Discrepancy |
|---|---|---|---|---|
| Pereira | 66001 | **482,851** | 487,820 | aggregator was +1.0% high |
| Cali | 76001 | **2,284,775** | 2,269,983 | aggregator was −0.6% low |
| Manizales | 17001 | **461,278** | 475,690 | aggregator was +3.1% high |
| Armenia | 63001 | **311,959** | never found by aggregator | resolved directly from DANE |
| Quibdó | 27001 | **148,945** | 143,332 | aggregator was −3.8% low |
| San José del Palmar | 27660 | **5,907** | aggregator's 2025 figure (5,130) was wrong | see resolution below |
| Popayán | 19001 (CONFIRMED 2026-08-14, direct pull) | **349,671** (284,898 cabecera + 64,773 rural) | 346,403 (es.wikipedia) / 318,059 (en.wikipedia, stale 2018 census) / 355,000 (mapadelterremoto.com, unsourced) | Resolved 2026-08-14 (Pass 2) — DIVIPOLA inference confirmed correct, all three secondary figures were in the right ballpark but none exact; es.wikipedia's 346,403 was closest |

**San José del Palmar population — resolved, no real decrease.** DANE's own series shows continuous growth: 2023=5,597 → 2024=5,697 → 2025=**5,809** → 2026=5,907. The earlier aggregator's "2025=5,130" figure was simply an error, not a real demographic decline. See wiki/08-contradictions.md.

Use these DANE figures (not the aggregator's) for any "% of population affected" calculation in the app.

## Geographic/boundary data

- **geoportal.dane.gov.co/descargas/divipola/** — DIVIPOLA_Municipios.xlsx and DIVIPOLA_Departamentos.xlsx confirmed directly downloadable via plain HTTP GET, no browser/auth needed. Use as the canonical municipio/department code-name lookup.
- **Actual boundary shapefiles (MGN — Marco Geoestadístico Nacional)** live under a similarly structured DANE `/descargas/` path per search results, but the exact shapefile filename/URL wasn't confirmed by direct fetch this pass — the `/servicios/descarga-y-metadatos/` page appears JS-rendered. One more targeted search or manual browse needed to nail down the exact MGN shapefile URL.
- **IGAC / colombiaenmapas.gov.co** — references WCS/ArcGIS endpoints in principle but no concrete scriptable REST URL confirmed. DANE looks more directly usable than IGAC for now.

## SGC seismic record for the 2026-08-10 event — still incomplete

- `sish.sgc.gov.co` is the WRONG tool — it's a pre-instrumental historical catalog (entries from 1827, 1875, 1973, 2008), doesn't contain this event. Confirms the earlier 1983-Popayán-lookup pattern was also mismatched to the wrong tool.
- `catalogosismico.sgc.gov.co` (the real instrumental catalog) is a JS-rendered SPA — needs browser automation to query, not yet done (deferred).
- What IS confirmed directly from SGC's own channels (newsroom + @sgcol bulletins, not third-party journalism): preliminary M6.7/82km → revised M6.6/96km → final ~M7.4/103km; USGS coords 4.8436°N/-76.2422°W vs SGC ~4.99°N/-76.29°W; 18 aftershocks by noon Aug 10, 130+ by Aug 12. See wiki/01-event-facts.md for full detail.
- **Gap**: no formal SGC catalog event-ID/permalink retrieved yet — needs a Chrome-based session against catalogosismico.sgc.gov.co once browser automation work starts.

## Historical earthquake comparison — 1999 Eje Cafetero

**Regional totals** (secondary/journalistic sourcing, original DANE/FOREC report not located): 1,185-1,900 dead (range across sources) / 8,536 injured / 35,972 homes destroyed / >200,000 damnificados nationally.

**Armenia** (best-documented city in secondary sources): ~800 dead, ~75% of city population damnificados, ~95,000 homes damaged/destroyed.

**Pereira and Manizales — NOT found in primary form.** Only secondary/journalistic mentions surfaced this pass:
- Pereira: ~17-18 deaths (varies by source, via mayoral quotes to Caracol Radio in a secondary article — not FOREC/DANE)
- Manizales: ~2 deaths, 20-30 homes collapsed (same secondary sourcing)

These are far smaller than Armenia's toll and NOT corroborated by a primary DANE/FOREC document. **This is a genuine, still-open gap** — worth noting because it means the 2026 quake, if Pereira's current toll (55-83+ deaths depending on source) holds up, would represent a dramatically worse outcome for Pereira specifically than 1999 did, unlike Armenia where 1999 was catastrophic and 2026's Armenia toll (so far, undetermined — see wiki/02-cities/armenia.md gap) appears comparatively lighter. Don't state this as fact in the app without the primary 1999 figures to back the comparison.

**FOREC** (Fondo para la Reconstrucción del Eje Cafetero) is cited as a World-Bank-praised successful reconstruction model — worth studying further as a template for what Colombia's 2026 recovery fund ("Fondo Milagro") might look like structurally, once more is known about Fondo Milagro's own design.

## 1983 Popayán earthquake (secondary context, from Phase 2 scoping pass, not re-verified this pass)
M5.5, 15km depth, ~250 dead, ~1,500 injured, 4,964 destroyed + 13,796 severely damaged structures in Cauca. Legacy: Colombia's first seismic-resistant building code (NSR).

## DNP damage-assessment methodology — no 2026-specific report yet

Colombia uses the internationally standardized PDNA (Post-Disaster Needs Assessment) framework, adopted 2008, with sectoral technical tables (productive, environmental, social, infrastructure, human impact). Precedent: CONPES 3146 for the 1999 quake.

**As of 2026-08-13 (3 days post-event), no CONPES document or PDNA-style report has been published for this earthquake** — confirmed as genuinely not-yet-existing, not a search failure. This is expected timing; watch for one to appear as the response matures. The initial government relief measures so far are Decreto 1171 de 2026 and the announced "Fondo Milagro" fund under a declared economic emergency (see wiki/05-gov-reports.md).
