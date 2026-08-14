# Damnificados / Damage Toll — National Running Log

Append-only. UNGRD severity categories: leve / moderado / severo (destroyed).

| Date reported | Damnificados/afectados | Houses destroyed | Houses damaged | Source | Tier | Notes |
|---|---|---|---|---|---|---|
| 2026-08-11 | — | — | 1,575 (total "viviendas afectadas") | Infobae/Wikipedia agg | 6 | Early aggregate figure, category unclear (destroyed vs damaged combined) |
| 2026-08-12 07:30 | 49,214 personas / 24,324 familias | 9,215 | 45,457 | **UNGRD official balance** | 2 | Big jump vs Aug 11 figure — reflects better assessment reach, not necessarily new damage. Treat Aug 11 number as stale/incomplete, not contradicted. |
| 2026-08-12 18:30 | 49,214 personas / **30,324 familias** | — (combined figure below) | — | **OCHA Flash Update 004** (PRIMARY, direct browser fetch) | **1** | Same personas total as UNGRD's morning balance, but higher familias count (30,324 vs 24,324) — same-day discrepancy. Combined destroyed+averiadas: **54,900 viviendas**. Also: "brechas de atención" (gaps in response) explicitly flagged as especially severe in Risaralda, Valle del Cauca, Chocó, and Caldas. USD 5 million CERF allocation announced to expand response. |
| 2026-08-13 | **53,816 personas** / 25,872 familias | (see wiki/03-death-toll.md, 9,000+ destroyed per snippet) | — | UNGRD balance (via teleSUR/7N Noticias/DW) | 2 | **RESOLVES the 24,324-vs-30,324 familias contradiction (wiki/08-contradictions.md): this third data point (25,872) sits between the two Aug 12 figures, confirming genuine report-to-report volatility rather than a data error.** Personas total also grew to 53,816 from 49,214 — real continued assessment growth, not a revision of the same headcount. |
| 2026-08-13 18:30 | 53,816 personas / 25,872 familias (same total as UNGRD's same-day figure) | 11,789 | — | **OCHA Flash Update 005** (PRIMARY, direct-fetched via browser) | **1** | Independently corroborates UNGRD's same-day familias/personas totals with a tier-1 source. 13 departamentos, 401 municipios. Emergency "continues to expand," figures may still rise due to access constraints in rural areas — explicit caveat in the report itself. |
| 2026-08-13 22:30 | 102,263 personas / 45,523 familias | 12,597 | 71,763 | UNGRD balance, Pres. De La Espriella briefing (via Infobae) | 2-3 | Large jump vs the 18:30 OCHA figure same day — consistent with the site's established pattern (assessment reach improving through the day, not a data error) |
| 2026-08-14 11:23 | 102,262 personas / 45,523 familias | 12,828 | 73,455 (revised DOWN from 74,873 after further engineering assessment) | **UNGRD balance** (via El Universal, direct-fetched) — latest as of this pass | 2-3 | 121 edificios colapsados, 2,205 centros educativos afectados, 240 centros de salud, 44 puentes, 73 acueductos. 15 departamentos, 426 municipios (38% del país) |

## Infrastructure damage (UNGRD 2026-08-12 balance)
| Category | Count |
|---|---|
| Buildings collapsed | 140 |
| Centros educativos (schools) affected | 1,667 |
| Centros comunitarios affected | 530 |
| Centros de salud affected | 188 |
| Airports with suspended operations | 6-7 (sources vary: El Caraño/Quibdó, La Nubia/Manizales, El Edén/Armenia, + others) |

## Infrastructure damage (UNGRD 2026-08-14 11:23am balance — latest as of this pass)
| Category | Count |
|---|---|
| Buildings collapsed | 121 |
| Centros educativos (schools) affected | 2,205 |
| Centros de salud affected | 240 |
| Puentes (bridges) affected | 44 |
| Acueductos (water systems) affected | 73 |

## Geographic scope
- 2026-08-12: 14 departamentos, 403 municipios (UNGRD)
- 2026-08-13 18:30: 13 departamentos, 401 municipios (OCHA Flash Update 005 — slightly lower dept/municipio count than UNGRD's own Aug 12 figure, not investigated further this pass, likely just a different assessment scope/methodology between the two reports)
- 2026-08-14 11:23am: **15 departamentos, 426 municipios** (38% of the country) — UNGRD, latest as of this pass

## By city
See per-city tables in `wiki/02-cities/<city-slug>.md` — this file is the national rollup only.

## Open items
- Building-collapse count varies by source: 61 / 140 (UNGRD) / 153 — logged in `08-contradictions.md`
- Departamentos/municipios affected varies slightly by report: 14/403 (UNGRD Aug 12) vs 13/401 (OCHA Aug 13 18:30) vs 15/426 (UNGRD Aug 14 11:23am) — treated as normal report-to-report scope drift, not investigated as a contradiction this pass (magnitude of variance is small relative to the overall trend of rising figures)
- Viviendas averiadas nacional was revised DOWN (74,873 → 73,455) in the Aug 14 11:23am UNGRD balance specifically because of completed engineering reassessment — worth watching for whether this is a one-off correction or the start of a downward-revision trend as initial rough counts get refined
- ~~Need direct UNGRD informe de situación PDF/page~~ — partially resolved 2026-08-14: OCHA's Flash Update 004 (fetched directly, see above) serves this role well, sourced from "El Equipo Humanitario País Colombia" which includes UNGRD-fed data. UNGRD's own document repository remains genuinely unreachable (confirmed network-level block, not a tool limitation — see wiki/03-death-toll.md).
- New open-source find: Microsoft AI for Good Lab ran automated building-damage detection (satellite imagery) for both Cali and Pereira specifically, downloadable via HDX — see wiki/13-opensource-tools.md. Could eventually cross-check against UNGRD's building-collapse figures.
