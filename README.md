# SOSColombia

Research + eventual webapp collecting data on the recent Colombia earthquake: death toll, damnificados (people who lost homes), official government reports, and per-city aid-point directories (shelters, food, free health).

## Current phase
Stage 1 (research-complete dataset) is done. Stage 2 (MVP webapp) has started — architecture drafted in `wiki/10-app-architecture.md`, stack recommendation pending confirmation.

## Folder map
- `task_plan.md` — phases, progress, decisions (session-to-session control file)
- `findings.md` — raw research discoveries as they're pulled, chronological
- `progress.md` — per-session log (what happened, what's next)
- `wiki/` — accumulated, curated facts. Source of truth. Every numeric claim: value + source + date-observed, never silently overwritten (append, don't replace).
  - `00-INDEX.md` — map of everything below, load first each session
  - `01-event-facts.md` — magnitude, epicenter, depth, aftershocks (SGC)
  - `02-cities/` — one file per affected city (toll, damnificados, status)
  - `03-death-toll.md` — dated, sourced running log
  - `04-damnificados.md` — same pattern
  - `05-gov-reports.md` — decree/informe registry
  - `06-sources.md` — every URL/doc ever pulled, tier + status (fetched/stale/dead/needs-recheck)
  - `07-aid-points/` — shelters/food/health points per city, last-verified date per entry
  - `08-contradictions.md` — conflicting numbers across sources, resolved or open
  - `09-glossary.md` — Colombian disaster-response terms/acronyms
  - `10-app-architecture.md` — webapp design, placeholder until data model settles
- `raw/` — verbatim snapshots of fetched docs/pages, named `<source-slug>-<YYYY-MM-DD>.md`. Re-derive wiki facts from here instead of re-fetching; govt pages get edited or taken down.

## Workflow rule
Every fact that goes into `wiki/` this session also gets `ctx_knowledge(remember)`'d via lean-ctx the same turn — markdown is the readable source of truth, the knowledge graph is the fast cross-session index. Don't let them drift apart.

## Source tiers (highest first)
1. SGC — seismic facts
2. UNGRD — casualties/damage/aid (primary backbone)
3. DANE/DNP — demographic/economic context
4. Gobernación/Alcaldía official channels — local specifics
5. Cruz Roja / Defensa Civil — relief ops detail
6. Major verified news — cross-check/gap-fill only, never sole source
7. Social media — flag only, never cited as fact
