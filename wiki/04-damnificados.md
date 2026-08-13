# Damnificados / Damage Toll — National Running Log

Append-only. UNGRD severity categories: leve / moderado / severo (destroyed).

| Date reported | Damnificados/afectados | Houses destroyed | Houses damaged | Source | Tier | Notes |
|---|---|---|---|---|---|---|
| 2026-08-11 | — | — | 1,575 (total "viviendas afectadas") | Infobae/Wikipedia agg | 6 | Early aggregate figure, category unclear (destroyed vs damaged combined) |
| 2026-08-12 07:30 | 49,214 personas / 24,324 familias | 9,215 | 45,457 | **UNGRD official balance** | 2 | Big jump vs Aug 11 figure — reflects better assessment reach, not necessarily new damage. Treat Aug 11 number as stale/incomplete, not contradicted. |
| 2026-08-12 18:30 | 49,214 personas / **30,324 familias** | — (combined figure below) | — | **OCHA Flash Update 004** (PRIMARY, direct browser fetch) | **1** | Same personas total as UNGRD's morning balance, but higher familias count (30,324 vs 24,324) — same-day discrepancy. Combined destroyed+averiadas: **54,900 viviendas**. Also: "brechas de atención" (gaps in response) explicitly flagged as especially severe in Risaralda, Valle del Cauca, Chocó, and Caldas. USD 5 million CERF allocation announced to expand response. |
| 2026-08-13 | **53,816 personas** / 25,872 familias | (see wiki/03-death-toll.md, 9,000+ destroyed per snippet) | — | UNGRD balance (via teleSUR/7N Noticias/DW) | 2 | **RESOLVES the 24,324-vs-30,324 familias contradiction (wiki/08-contradictions.md): this third data point (25,872) sits between the two Aug 12 figures, confirming genuine report-to-report volatility rather than a data error.** Personas total also grew to 53,816 from 49,214 — real continued assessment growth, not a revision of the same headcount. |

## Infrastructure damage (UNGRD 2026-08-12 balance)
| Category | Count |
|---|---|
| Buildings collapsed | 140 |
| Centros educativos (schools) affected | 1,667 |
| Centros comunitarios affected | 530 |
| Centros de salud affected | 188 |
| Airports with suspended operations | 6-7 (sources vary: El Caraño/Quibdó, La Nubia/Manizales, El Edén/Armenia, + others) |

## Geographic scope
14 departamentos, 403 municipios affected (UNGRD).

## By city
See per-city tables in `wiki/02-cities/<city-slug>.md` — this file is the national rollup only.

## Open items
- Building-collapse count varies by source: 61 / 140 (UNGRD) / 153 — logged in `08-contradictions.md`
- ~~Need direct UNGRD informe de situación PDF/page~~ — partially resolved 2026-08-14: OCHA's Flash Update 004 (fetched directly, see above) serves this role well, sourced from "El Equipo Humanitario País Colombia" which includes UNGRD-fed data. UNGRD's own document repository remains genuinely unreachable (confirmed network-level block, not a tool limitation — see wiki/03-death-toll.md).
- New open-source find: Microsoft AI for Good Lab ran automated building-damage detection (satellite imagery) for both Cali and Pereira specifically, downloadable via HDX — see wiki/13-opensource-tools.md. Could eventually cross-check against UNGRD's building-collapse figures.
