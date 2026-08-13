# Sources Registry

Every URL/doc ever pulled. Check here before re-fetching. Tier per README source-tier list.

## Confirmed working (fetch these directly, no issues)

| URL/doc | Tier | Access method | Status | Notes |
|---|---|---|---|---|
| earthquake.usgs.gov (USGS event feed) | 1 | Direct API (JSON) | **live, works great** | Event us6000tjl2 — magnitude/depth/coords/time, clean structured data |
| www2.sgc.gov.co (SGC newsroom) | 1 | Direct WebFetch | live | Official bulletins, aftershock counts |
| geoportal.dane.gov.co/descargas/divipola/*.xlsx | 1 | Direct WebFetch (binary) | **confirmed scriptable, no browser needed** | DIVIPOLA_Municipios.xlsx (~293KB), DIVIPOLA_Departamentos.xlsx (~220KB) — valid OOXML |
| dane.gov.co/files/censo2018/.../DCD-area-proypoblacion-Mun-2020-2035-ActPostCOVID-19.xlsx | 1 | Direct WebFetch (binary), needs xlsx parsing (openpyxl or similar) | **confirmed, this is THE authoritative population source** | Official DANE 2020-2035 municipal population projections |
| mapadelterremoto.com | 2 | Direct WebFetch | live | Third-party aggregator, /municipio/{slug} pages per city confirmed working for cali, manizales, pereira, buenaventura, armenia, quibdo, bogota, medellin |
| paho.org natural-hazards-monitoring pages | 1.5 | Direct WebFetch | live | Dated rolling pages, not a numbered PDF sitrep series as originally assumed |
| pereira.gov.co (individual publicación pages) | 1 | Direct WebFetch | live for specific pages found via search | No site-wide index found, individual URLs work |
| risaralda.gov.co | 1 | Direct WebFetch | live but thin | Homepage has no decree text/casualty balance, only general news items |
| ukumari.org | 1 | Direct WebFetch | live | /contacto page has real address/phone/hours |
| gofundme.com/f/* (individual campaign pages) | varies | Direct WebFetch | **works — retry if it failed before** | Contrary to earlier assumption, individual campaign pages (not the relief hub) return real goal/raised/donor figures on direct fetch |
| cauca.gov.co (Gobernación del Cauca, homepage + /Prensa/SaladePrensa/Paginas/*) | 1 | Direct WebFetch | **live, best primary source for Popayán/Cauca** | Dated, named-official press releases fetch cleanly — used for death-toll and acopio-point data in wiki/02-cities/popayan.md |
| elnuevoliberal.com (homepage, ?s= search, /sitemap.xml) | 6 (local outlet, confirmed real) | Direct WebFetch | live but **stale for this event** | Confirmed as Popayán/Cauca's local paper via its own tagline. Its post-sitemap.xml lastmod is 2026-06-01 (pre-dates the quake); on-site search for terremoto/sismo surfaces only a 2024 article. Unclear if outlet hasn't covered the quake or its sitemap/search index is broken — open gap |
| mapadelterremoto.com/municipio/popayan | 2 | Direct WebFetch | live | Zero albergues/acopio listed for Popayán, 16 documented damage points, no consolidated official figures — consistent with wiki/13a's caveat about summarized-fetch reliability |
| periodicovirtual.com | 3-4 (regional aggregator) | Direct WebFetch | live | Cauca-wide municipio damage roundup, incl. Guapi figures |
| medicinalegal.gov.co | 1 | Direct browser navigation | **live, primary source** | Full comunicado history + named victim lists — see "RESOLVED" table below, this was a WebFetch-only TLS issue |
| reliefweb.int/report/... (individual report pages) | 1 | Direct browser navigation | **live, primary source** | OCHA Flash Update 004 fetched cleanly — was a WebFetch-only 403 issue |
| data.humdata.org | 1 | Direct browser navigation | **live** | Microsoft AI for Good Lab building-damage datasets found — was a WebFetch-only 403 issue |
| gofundme.com/c/act/colombia-earthquake-relief | 1 | Direct browser navigation | **live, fully enumerable** | 17 pages of verified fundraisers — was a WebFetch-only JS-rendering issue |

## RESOLVED via browser automation 2026-08-14 — were WebFetch-only limitations, not real blocks

| URL/doc | Tier | Was blocked by | Resolution |
|---|---|---|---|
| medicinalegal.gov.co (INMLCF) | 1 | TLS cert error | **Loads perfectly via real browser.** Full 6-comunicado history + 164-victim list captured directly — see wiki/03-death-toll.md |
| reliefweb.int (all endpoints) | 1 | HTTP 403 | **Loads perfectly via real browser.** OCHA Flash Update 004 fetched directly — see wiki/05-gov-reports.md |
| data.humdata.org (HDX) | 1 | HTTP 403 | **Loads perfectly via real browser.** Found Microsoft AI for Good Lab's building-damage datasets for Cali AND Pereira — see wiki/13-opensource-tools.md |
| gofundme.com/c/act/colombia-earthquake-relief (relief hub) | 1 | JS-rendered listing | **Fully enumerable via browser** — 17 pages of individually verified fundraisers, page 1 (12 campaigns) captured — see wiki/11-crowdfunding-campaigns.md |

## Confirmed BLOCKED (genuine, re-verified via browser 2026-08-14 — not tool limitations)

| URL/doc | Tier | Blocker | Notes |
|---|---|---|---|
| repositorio.gestiondelriesgo.gov.co (UNGRD DSpace) | 1 | Redirects to :8443, real connection error | **Confirmed via direct browser navigation** — genuine network-level block, the port isn't publicly serving. Not a WebFetch limitation. |
| catalogosismico.sgc.gov.co | 1 | Loads fine, data-lag not access-block | **Confirmed via browser**: full interactive app works (16,290 historical records, filterable), but filtering for 2026-08-10 to 08-15 returns ZERO records at any magnitude. Manually-reviewed/curated catalog — the Aug 2026 event hasn't been through QA/review yet. Data-availability gap, not a technical block. |
| sish.sgc.gov.co | 1 | N/A — wrong tool | Not blocked, just doesn't contain this event (it's a pre-instrumental historical catalog) |
| vaki.co campaign pages | 1/2 | Genuinely zero donations, not JS-rendering failure | **Confirmed via browser**: "Yo Tengo Fe por el Pacífico" shows "Sé el primer Vaker" — genuinely zero donors despite press coverage, not a rendering artifact. |
| datos.gov.co "Emergencias UNGRD" Socrata dataset | — | **DEAD, not blocked** | Confirmed via direct API query: newest record is dated 2022-12-31. Not updated in 3+ years. Drop as a source entirely, do not keep re-checking. |
| donadora.co / donadora.org | — | DNS failure / ECONNREFUSED, also wrong country | donadora.co doesn't resolve; donadora.org is a Mexican platform, not Colombian. Deprioritize. |
| colombiaenmapas.gov.co (IGAC) specific REST endpoints | 1 | Unconfirmed | Page references WCS/ArcGIS endpoints in principle but no concrete scriptable URL found; not re-checked via browser this pass |
| hotosm.org Tasking Manager link | 1/2 | Shortened bit.ly link didn't resolve to underlying URL | Landing page confirmed active; actual task data best reached via Overpass API against a Chocó/Risaralda bounding box instead of the HOT site itself; not re-checked via browser this pass |
| popayan.gov.co (homepage + /NuestraAlcaldia/SaladePrensa) | 1 | JS-rendered ("Cargando noticias...") | Not re-checked via browser this pass — use cauca.gov.co (departmental) as the working substitute for now |
| portal.gestiondelriesgo.gov.co internal navigation | 1 | Loads fine, navigation didn't surface an archive | Homepage and Comunicación page load fine via browser; clicking through nav tabs/search didn't reach a numbered sitrep archive this pass — not confirmed as a hard block, just not yet cracked |

## Partially useful / needs care

| URL/doc | Tier | Notes |
|---|---|---|
| Al Jazeera earthquake coverage | 2 | Good independent corroboration source, explicitly explains the missing-persons two-track discrepancy |
| El Colombiano (elcolombiano.com) | 6, but carries direct UNGRD quotes | Highest-confidence secondary source for UNGRD's Aug 12 07:30 balance |
| colombiamagico.com | 3 (aggregator) | Consistently useful as a lead list but every claim needs independent verification — caught overstating Ukumarí's role, for example |

## Sources found this session but not yet fetched
- x.com/sgcol, x.com/UNGRD — official bulletin accounts, individual posts ARE indexed by search even without login
- OCHA Flash Update No. 001/002 PDFs — titles located, content blocked by ReliefWeb 403
- catalogosismico.sgc.gov.co — needs browser automation to query (deferred)

## Old TODO (superseded/resolved this session)
- ~~Fetch sgc.gov.co directly for primary informe de situación documents~~ — done, see wiki/01-event-facts.md and wiki/05-gov-reports.md
- ~~Pull DANE population baselines per city~~ — done, see wiki/14-context-reference.md
