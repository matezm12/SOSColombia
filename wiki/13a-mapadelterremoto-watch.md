# mapadelterremoto.com — Dedicated Watch File

Naboo Intelligence's third-party aggregator. Closest existing analog to this project's own goals — worth tracking over time rather than treating as a one-off source.

## Confirmed structure (verified 2026-08-13)
- Site is live and working. Key pages: `/mapa` (map view), `/municipios` (list view), `/municipio/{slug}` (per-city detail — confirmed working for: cali, manizales, pereira, buenaventura, armenia, quibdo, bogota, medellin)
- Aggregates from 172 public sources (UNGRD, SGC, MinTIC, municipal authorities), uses DIVIPOLA codes and EDAN (Evaluación de Daños y Análisis de Necesidades) standard vocabulary
- Explicitly preserves cross-source discrepancies rather than resolving them — philosophically aligned with this project's own "timestamp everything, never collapse contradictions" approach (see wiki/08-contradictions.md)

## THE key finding: acopio ≠ albergue, confirmed directly from the site

This resolves the single biggest open product question from Phase 1/2 (are aid points donor drop-off or victim distribution?). Fetched `/municipio/pereira` directly:

- The page **explicitly separates two categories**: "albergues" (shelters — 6 listed for Pereira, where displaced people actually stay) and "centros de acopio" (~15 listed for Pereira, described as: *"se reciben cobijas, colchonetas, medicamentos y alimentos no perecederos"* — i.e. places where donors deliver goods IN)
- The homepage's donor guidance ("Solo lo que se está pidiendo, y a un punto que siga recibiendo") is written for donors, reinforcing the acopio = collection-point reading
- **Conclusion: acopio points are donor drop-off points, not aid-distribution points for damnificados. Albergues are the distribution/shelter side.** Treat as two different categories in the app's data model — do not conflate "206 albergues y centros de acopio" into one "aid point" bucket.

## Caveat — numbers were inconsistent across fetches (WebFetch-era, superseded below)

- Prior scoping pass reported 206 total shelter/acopio points nationally, 31 specifically in Pereira, across 317 municipios
- Execution pass's `/municipios` fetch showed **411 municipios / 2,082 puntos**
- These earlier counts came via WebFetch's lossy small-model summarization — **superseded by the Pass 3 raw browser re-verification below.**

## Pass 3 re-verification (2026-08-14) — RAW browser fetch, exact counts, no summarization

Navigated directly to each city's `/municipio/{slug}` page and read the actual "puntos afectados" / "de daño físico" counters plus the national footer ranking. All 5 red-alert cities confirmed (page-own count matches the national footer ranking exactly — cross-checked, no discrepancy):

| City | Puntos afectados (total) | De daño físico | DIVIPOLA | Afectación label |
|---|---|---|---|---|
| Cali | **266** | 186 | 76001 | Afectación crítica |
| Manizales | **247** | 203 | 17001 | Afectación crítica |
| Pereira | **136** | 85 | 66001 | Afectación crítica |
| Armenia | **60** | 44 | 63001 | Afectación **alta** (one notch below the other 4) |
| Quibdó | **54** | 39 | 27001 | Afectación crítica |

National footer also shows (not deep-verified individually this pass, but from the same live ranking): Buenaventura 91, Bogotá D.C. 53, Medellín 42, Villamaría 26, Montenegro 24, Chinchiná 23, Ibagué 21, Roldanillo 20 — 411 municipios total in the full ranking.

**These are point-count totals (damage reports + aid points + infrastructure + everything the site tracks), not death/damnificados figures** — don't conflate with wiki/03/04's official tolls. Use this table as the current ground truth for "how many discrete tracked incidents does this site have per city," replacing the earlier inconsistent WebFetch-summarized numbers above.

**Bonus finds surfaced by the raw fetch (Pereira page specifically):**
- **P-420 "Centro de eventos Expofuturo"** — officially confirmed (2 fuentes) as "Punto de recepción y distribución de la campaña nacional de recolección de ayudas para las familias afectadas de Pereira, anunciado por la primera dama Ana Lucía Pineda durante la visita del presidente al Puesto de Mando Unificado." This is a stronger primary confirmation than the flyer permalink chased in Pass 2 — see wiki/07-aid-points/pereira.md, resolves that gap outright.
- **P-090 "Antiguo Colegio La Enseñanza"** — a 7th Pereira site (95 patients transferred from Comfamiliar), functioning as a health-support point, not in our original 6-shelter list. Worth adding.
- **P-720/P-721** — two acopio points added "en el segundo día de la emergencia": 2.500 Lotes and Tokio, beyond the original 7 CAFE network.
- **P-271 Bioparque Ukumarí** — labeled "Confirmado, 7 fuentes" for "Atención veterinaria de emergencia para mascotas de damnificados" — this is a stronger confirmation than what led our own contradiction log to downgrade Ukumarí's emergency-vet-point role to unconfirmed. Flagging as a re-open candidate, not resolved this pass — see wiki/16-deferred-queue.md.

## Open format promise
Site states data will be published "permanently in open format" after Nov 30 2026 — worth revisiting then for a bulk-download alternative to page-by-page scraping.

## Next steps
- Re-verify Pereira's albergue/acopio list against a raw fetch (not summarized) before committing specific names/addresses to wiki/07-aid-points/pereira.md
- Pull the same per-city breakdown for Cali, Manizales, Armenia, Quibdó once Pereira's is solid
- Consider reaching out to Naboo Intelligence directly given the strong alignment with this project's goals
