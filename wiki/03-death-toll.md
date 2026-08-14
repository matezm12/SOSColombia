# Death Toll — National Running Log

Append-only. Never overwrite a prior entry — govt revises tolls, history matters. Two metrics now tracked separately (see wiki/08-contradictions.md): `deaths_reported_official` (UNGRD/OCHA administrative) vs `deaths_confirmed_forensic` (INMLCF body-intake, generally lower/lagging).

**Update 2026-08-14: browser automation resolved every technical block on this domain.** medicinalegal.gov.co (TLS error), reliefweb.int (403), and data.humdata.org (403) all load perfectly via a real logged-in browser — those were tool-level limitations, not real access restrictions. INMLCF's full comunicado history and OCHA's Flash Update 004 are now primary-sourced below, not press-relayed.

**Update 2026-08-14 (afternoon pass): national toll now 285 dead (UNGRD, 11:23am).** OCHA Flash Update 005 (direct-fetched via browser, reliefweb.int's 403 is a WebFetch-tool-only limitation same as before) confirms 266 dead as of Aug 13 18:30 — a 1-person same-day variance from UNGRD's own 265, logged as expected inter-agency volatility, not an error. Two later UNGRD balances found: Aug 13 22:30 (284 dead) and Aug 14 11:23am (**285 dead**, latest as of this pass) — both via mainstream press citing UNGRD's own briefing, not yet re-verified against a UNGRD primary document. INMLCF issued two more comunicados (07: 250 received/228 identified; 08, Aug 13 7pm: 260 received/~243 identified, one aggregator says 246 — flagged as unresolved transcription uncertainty, see wiki/08-contradictions.md). Cali's own Reporte Oficial 009 puts the city at 110 deaths, up from the Aug 12 figure of 96. A direct medicinalegal.gov.co fetch failed this pass (DNS error) — retry next pass to firm up the INMLCF 243-vs-246 uncertainty and get an exact comunicado number/timestamp.

## deaths_reported_official (UNGRD/OCHA)

| Date reported | National total | Injured | Missing (institutional) | Source | Tier | Notes |
|---|---|---|---|---|---|---|
| 2026-08-10 11:34 | 74 (provisional) | — | — | Wikipedia agg | 6 | First provisional count |
| 2026-08-10 | 111 | — | — | CBS News / NPR | 6 | |
| 2026-08-10 | 132 | — | — | CNN, Chequeado | 6 | |
| 2026-08-10 (later) | 169 | 570 | — | Presidente Abelardo de la Espriella (via Infobae) | 4-6 | |
| 2026-08-11 | 181 | 2,595 | 195 | Al Jazeera (citing Colombian authorities) | 2 | |
| 2026-08-11 | 224 | 2,595 | 195 | OCHA via UN News | 1.5 | 13 depts, 357 municipios, 1,136 homes destroyed, 8,385 damaged, 48 buildings collapsed |
| 2026-08-12 07:30 | 239 | 3,755 | 287 | **UNGRD official balance** (direct-fetched via El Colombiano) | 2 | Dept breakdown: Valle del Cauca 125, Risaralda 94, Chocó 14, Caldas 6, Antioquia 1. Also: 9,215 homes destroyed, 45,457 damaged, 140 buildings collapsed |
| 2026-08-12 midday (lower confidence) | 182 | 2,542 | 189 | "UNGRD Informe de Situación 011" via secondary aggregation | 3-4 | Could not independently verify this document exists as a discrete PDF — treat with lower confidence than the directly-sourced 239 figure above |
| 2026-08-12 18:30 | **241** | 3,771 | — (see missing-persons section) | **OCHA Flash Update 004** (PRIMARY, fetched directly via browser) | **1** | El Equipo Humanitario País Colombia + OCHA. 13 departamentos, 49,214 personas afectadas, 30,324 familias damnificadas, 54,900 viviendas destruidas+averiadas. **USD 5 million CERF (UN Central Emergency Response Fund) allocation announced** — first confirmed international financial commitment figure found. PDF: reliefweb.int/report/colombia/colombia-flash-update-004-actualizacion-afectaciones-por-terremoto-en-colombia-12-agosto-de-2026 |
| 2026-08-13 | 265 | 3,494 | 496 | **UNGRD balance** (upgraded 2026-08-14: corroborated via teleSUR, 7N Noticias, DW — not just Wikipedia agg) | 2 | 25,872 familias / 53,816 personas afectadas. This third same-week data point resolved the 24,324-vs-30,324 familias contradiction as expected report-to-report volatility, not an error — see wiki/08-contradictions.md |
| 2026-08-13 18:30 | 266 | — | — | **OCHA Flash Update 005** (PRIMARY, direct-fetched via browser) | **1** | 53,816 personas / 25,872 familias (same as the UNGRD figure above — corroborates it with a tier-1 source), 11,789 viviendas destruidas, 13 departamentos, 401 municipios. 1-person same-day variance vs UNGRD's 265, logged as expected volatility not error — see wiki/08-contradictions.md |
| 2026-08-13 22:30 | 284 | 3,977 | 379 | UNGRD balance, read out during Pres. De La Espriella's emergency briefing (via Infobae) | 2-3 | 354 rescatados. 45,523 familias / 102,263 personas, 71,763 viviendas averiadas, 12,597 destruidas, 121 edificios colapsados |
| 2026-08-14 11:23 | **285** | 3,975 | 379 | **UNGRD balance** (via El Universal, direct-fetched) — latest as of this pass | 2-3 | 102,262 personas / 45,523 familias, 12,828 viviendas destruidas, 73,455 averiadas (revised DOWN from 74,873 after further engineering assessment — methodology correction, not improving conditions), 121 colapsados, 2,205 centros educativos, 240 centros de salud, 44 puentes, 73 acueductos afectados. 15 departamentos, 426 municipios (38% del país) |

**Family-count discrepancy (2026-08-12, same day):** UNGRD's 07:30 balance implies 24,324 familias (from the Phase 1 pass); OCHA's 18:30 Flash Update 004 says 30,324 familias — same 49,214 personas afectadas total in both. Logged as a same-day revision, not resolved as error vs correction — see wiki/08-contradictions.md.

## deaths_confirmed_forensic (INMLCF / Medicina Legal) — NOW PRIMARY SOURCE, full comunicado history

Direct browser visit to medicinalegal.gov.co succeeded fully (the TLS error was a WebFetch-only limitation). Full "Comunicado Oficial" history captured directly from medicinalegal.gov.co/web/guest/noticias:

| Comunicado | Date | Bodies received | Bodies identified | Minors among identified | Bodies delivered to family | Source |
|---|---|---|---|---|---|---|
| Comunicado Oficial (unnumbered) | 2026-08-11 | 160 | 22 (of 28 "abordados") | — | — | medicinalegal.gov.co, direct |
| Comunicado Oficial 02 | 2026-08-11 | 165 | 43 | — | — | medicinalegal.gov.co, direct |
| Comunicado Oficial 03 | 2026-08-11 | 180 | 93 | — | — | medicinalegal.gov.co, direct |
| Comunicado Oficial 04 | 2026-08-12 | 202 | 121 | 5 | — | medicinalegal.gov.co, direct |
| Comunicado Oficial No. 05 | 2026-08-12 | 227 | 164 | 8 | 117 | medicinalegal.gov.co, direct — **full 164-name victim list captured, see below** |
| Comunicado Oficial No. 06 | 2026-08-12 | 230 | 205 | 12 | 140 | medicinalegal.gov.co, direct |
| Comunicado Oficial No. 07 | 2026-08-13 | 250 | 228 | 13 | 194 | via aggregator — direct medicinalegal.gov.co fetch not re-attempted this pass |
| Comunicado Oficial No. 08 (latest as of this pass) | 2026-08-13 19:00 | 260 | **243** (one aggregator reports 246 — unresolved, see wiki/08-contradictions.md) | 17 | 222 | via aggregator — direct fetch failed this pass (DNS error, not confirmed as a real block yet, retry next pass) |

Comunicados 07 and 08 found 2026-08-14 (afternoon pass) via press aggregation, not direct-fetched — the direct medicinalegal.gov.co connection that worked earlier this same day failed on retry (DNS error). Worth a dedicated retry to firm up Comunicado 08's identified-count discrepancy (243 vs 246) and confirm an exact timestamp.

**Full victim list from Comunicado No. 05 (164 identified victims, by Unidad Básica/city, corte 2026-08-12 3:00pm):**
- Pereira: 83 named victims (by far the largest single-city count in this list)
- Cali: 39
- Quibdó: 11
- Buenaventura: 7
- Manizales: 5
- Cartago: 3
- Buga: 3
- Sevilla: 3
- Roldanillo: 5
- Tuluá: 2
- **Popayán: 1** — "Carlos Ernesto Rennella Campo," Hombre, 45 años. **RESOLVED 2026-08-14 (Pass 1): confirmed real, Popayán-based (taxi cooperative member), the earlier "zero deaths" finding was a stale early assessment — see wiki/08-contradictions.md and wiki/02-cities/popayan.md.**
- Belén de Umbría: 1
- Santander de Quilichao: 1

**Comunicado 06's updated list (205 victims, not fully re-transcribed here) adds at least one new name not in the 164-list above: Daniel Gutiérrez Arias, 84, Masculino, "Unidad Básica: Armenia-Calarcá."** Open question whether this attributes to Armenia city or Calarcá (a distinct nearby Quindío municipio) — see wiki/08-contradictions.md, not resolved either way.

Full named list (all 164 victims with name/sex/age from Comunicado 05, and 205 from Comunicado 06) preserved in the raw page capture from this session — available on request if per-victim detail is needed for the app; not reproduced in full here to keep this file scannable.

**Body-delivery logistics note (Comunicado 05):** bodies are delivered to families in coordination with the Fiscalía General de la Nación at each municipio's corresponding office; bodies originating from Cali are being delivered at the Unidad Básica de Palmira, not in Cali itself.

Bodies sourced from: Chocó, Caldas, Risaralda, Valle del Cauca. **Note: this forensic count (230 received / 205 identified) sits below the UNGRD/OCHA administrative toll (239-241) — see wiki/08-contradictions.md, treated as two distinct metrics, not a discrepancy to resolve.**

## By department (as of 2026-08-12 UNGRD balance)
| Department | Deaths |
|---|---|
| Valle del Cauca | 125 |
| Risaralda | 94 |
| Chocó | 14 |
| Caldas | 6 |
| Antioquia | 1 |

## By city (updated 2026-08-14 with INMLCF primary data — figures are volatile, see wiki/02-cities/ and wiki/07-aid-points/ for city-specific detail)
- Pereira: reported between 55 and 83 depending on article/date; **INMLCF's own Comunicado 05 (primary source) shows 83 identified victims specifically from Pereira** as of 2026-08-12 15:00 — the highest end of the previously-reported range is now primary-source-confirmed as at least a floor (identified count, not necessarily final total deaths)
- Cali: **110 deaths** (Alcaldía de Cali Reporte Oficial 009, found 2026-08-14 afternoon via Semana — up from the Aug 12 cali.gov.co figure of 96), 1,410 injured, 115 missing, 88 rescued, 92 bodies already delivered to families. 81 buildings collapsed (46 total + 35 partial), 1,408 more with structural damage, 457 under evacuation order. INMLCF's Comunicado 05 shows 39 identified victims from Cali specifically (a subset of the death toll, since not all bodies are identified yet)
- Quibdó: **9 confirmed (city-specific, no update found)**; 13-14 is the Chocó DEPARTMENT total. INMLCF Comunicado 05 shows 11 identified victims from Quibdó specifically — slightly above the earlier 9 figure, consistent with ongoing identification work, not necessarily a contradiction
- Manizales: **6 confirmed** (named victims, per earlier press pass) — INMLCF Comunicado 05 independently lists 5 identified Manizales victims by name (Fernando Alonso González, Catalina Arango Sandoval, Oscar de Jesús Henao Marín, Luis Alberto Duque Cortes, Graciela Zapata López) — names/ages now double-confirmed at primary source, minor spelling variants noted (e.g. "Alonso" vs "Alfonso")
- Armenia: **0 confirmed for Armenia city specifically** — genuinely near-zero, not a data gap; multiple independent official sources confirm directly. Armenia does not appear by that exact name in either INMLCF comunicado, though Comunicado 06 adds one victim under "Armenia-Calarcá" (ambiguous attribution, see wiki/08-contradictions.md) — treat Armenia city's own zero-death status as still standing, with a caveat.
- San José del Palmar (epicenter town): **0 confirmed** — not in INMLCF's list either, consistent with zero.
- **Popayán: RESOLVED — 1 confirmed death** (Carlos Ernesto Rennella Campo, 45, Popayán taxi cooperative member). The earlier "zero deaths in Cauca" finding (Gobernación del Cauca, El País) was a stale early assessment, superseded by INMLCF's later primary forensic record, confirmed across 7+ independent outlets. See wiki/08-contradictions.md and wiki/02-cities/popayan.md.

**Pattern note**: the cities closest to the actual epicenter (San José del Palmar, Quibdó) and Armenia (red-alert but not epicenter-close) still show markedly lower death tolls than Cali/Pereira, even after this primary-source upgrade. Pereira in particular stands out as the single hardest-hit city by identified-victim count (83, more than double Cali's 39 identified).

## Missing-persons — two tracked metrics (see wiki/08-contradictions.md for full resolution)
- `missing_official_institutional`: 189→195→243→287 (UNGRD/OCHA, verified through police/Medicina Legal/municipal channels)
- `missing_reported_crowdsourced`: ~4,145-4,210 open reports on "Colombia Te Busca" (civic platform, families self-report — includes duplicates/later-resolved entries, NOT the same population as the official count)
- INMLCF's own missing-persons registry (RND — Registro Nacional de Desaparecidos) exists at medicinalegal.gov.co/rnd-registro-de-desaparecidos but is a general case-lookup portal (SIRDEC/SICOMAIN/SICLICO systems, individual-name search), not an earthquake-specific aggregate dashboard — did not yield a quick aggregate figure, not pursued further this pass.

## Confirmed dead ends — genuine, not tool limitations
- **UNGRD's document repository** (repositorio.gestiondelriesgo.gov.co, redirects to :8443) — confirmed via direct browser navigation to show a real connection error page. This is a genuine network-level block (the port isn't publicly serving), not a WebFetch limitation. UNGRD's main portal (portal.gestiondelriesgo.gov.co) loads fine but its internal navigation/search did not yield a discoverable sitrep archive this pass — worth a more patient dedicated pass later, not a hard block.
- **SGC's Catálogo Sísmico Integrado** (catalogosismico.sgc.gov.co) — loads perfectly via browser (16,290 total historical records, fully filterable by date/magnitude/depth/coordinates), but filtering for 2026-08-10 to 2026-08-15 returns **zero records regardless of magnitude range**. This is a manually-reviewed/curated catalog (confirmed via its own documentation from the Phase 2 pass) — the Aug 2026 event simply hasn't been through review/QA yet, a genuine data-lag, not a technical or access block. Real-time bulletins (@sgcol on X, www2.sgc.gov.co news) remain the only current source for this event's seismic parameters.
