# Task Plan — SOSColombia

## Goal
Collect complete, sourced data on the recent Colombia earthquake (death toll, damnificados, official gov reports, per-city aid points), structured so a webapp can be built on top once the data model is proven.

## Governing process (established 2026-08-14 — read this before starting any session)

**Two-stage launch, in order:**
1. **Research-complete dataset** (current stage) — all core data categories verified to a consistent floor across all 7 cities, contradictions resolved or explicitly flagged, no ad-hoc rabbit-holing. The wiki IS the deliverable at this stage, not a webapp.
2. **MVP webapp** — starts only after stage 1 is declared done. Detailed plan for this stage waits until we get there (depends on stack/hosting decisions not yet made).

**The queue discipline (the actual behavior change):** mid-pass, if a new interesting lead surfaces that isn't the current pass's explicit target, it gets ONE line logged in `wiki/16-deferred-queue.md` — not chased in the moment. Passes stay bounded to their stated scope. The queue only gets triaged at a pass boundary (promote to a future pass, or drop), never worked top-to-bottom mid-task.

**Stage 1 exit criteria (Phase A, below) — when these 3 passes are done, stage 1 is declared complete and we move to stack/architecture decisions for stage 2:**
- [x] Pass 1 — Contradiction closure (Popayán death toll, familias-damnificadas count) — DONE 2026-08-14
- [x] Pass 2 — Small city-level gaps (Armenia shelter confirmation, Decreto 1171 text, Risaralda decree number, Manizales/Armenia cifras pages, Pereira Expofuturo permalink, Popayán+Quibdó DANE population) — DONE 2026-08-14
- [x] Pass 3 — Open-source/tooling closure (HDX check for the other 3 cities' building-damage data, mapadelterremoto.com re-verification for the 5 red-alert cities) — DONE 2026-08-14

**STAGE 1 IS DONE.** Everything else currently sitting in various "top priorities" lists across the wiki that ISN'T in Pass 1-3 has been moved to `wiki/16-deferred-queue.md` — it's not blocking, triage opportunistically during stage 2.

## Stage 2 — MVP webapp (starts now)
Begin with `wiki/10-app-architecture.md`: data model (entities: Event, City, AidPoint, Report — per the existing stub), the data-update-mechanism strategy (tiered: APIs for primary sources like USGS/DANE; semi-automated bulletin checks for UNGRD/OCHA/INMLCF; browser-automation or crowdsourced updates for social+aid-point data — all built on the append-only timestamp-everything pattern already proven throughout stage 1), then stack/hosting decisions.

## Phase 2 — Deep research (first execution pass done 2026-08-13)
Full plan in `wiki/research-plan-phase2.md` (produced 2026-08-13 by a 7-agent scoping workflow, "Execution status" section tracks what's landed). Six domains, priority-ordered: (1) primary-source toll tracking — solid pass, missing-persons contradiction resolved, several sources confirmed blocked (need browser automation), (2) hyperlocal aid directories — Pereira deep, Cali/Manizales/Armenia/Quibdó thin (Armenia has zero confirmed shelters), (3) open-source tools/APIs — solid pass, datos.gov.co dead, mapadelterremoto.com and DANE files live, (4) veterinary/animal aid — folded into each city's aid-points file, (5) country/city reference data — solid pass, real DANE population figures pulled, (6) crowdfunding campaigns — solid pass, Camila Franco's real campaign confirmed via user-supplied link. See that file for sources, search queries, and per-domain checklists — don't duplicate the checklist here, it will drift.

**Explicit deferral (user decision, 2026-08-13):** all social-media/logged-in platform access (X/Instagram/Facebook/TikTok/WhatsApp/Telegram — "the universal wall") is deferred to a later session requiring browser automation (claude-in-chrome). Do not attempt this work until the user asks for it.

**Update 2026-08-14: the deferral is lifted for X/Instagram/Facebook/TikTok.** User confirmed all 4 logged in and asked to proceed. First live pass done — see `wiki/15-social-media-methodology.md` for approach and `wiki/07-aid-points/{pereira,cali,manizales,quibdo}.md` for what it surfaced (official shelter list, all 7 Pereira collection-point addresses, a 5-city blood-donation network, the "Colombia Un Solo Corazón" campaign fully detailed, urgent individual needs, and an embed/permalink answer for the eventual webapp). **WhatsApp/Telegram remain deferred** — they need actual group invites, not just a login, so they're a different kind of task. Still need to replicate this pass for Armenia, San José del Palmar, and Popayán.

**Update 2026-08-13 (second execution pass):** domain 2 (hyperlocal aid) is now reasonably filled for all 7 city profiles (Pereira, Cali, Manizales, Armenia, Quibdó, San José del Palmar, Popayán) — remaining gaps are small/specific (a few missing addresses) rather than whole-city blanks. Two cities (Armenia, San José del Palmar) confirmed zero deaths as real findings, not data gaps. Cali now has an authoritative municipal-government toll figure (cali.gov.co, 96 deaths). The next big lever is the deferred browser-automation work, not more WebSearch/WebFetch passes on these 7 cities.

**Update 2026-08-14 (social media, remaining 3 cities + blocked-sources retry):** social media pass completed for Armenia/San José del Palmar/Popayán, closing out domain 2 across all 7 cities. Separately, retried every source flagged "blocked" in domain 1 (primary toll) and domain 3 (open-source tools) using the same browser automation — 4 of 7 were pure tool limitations (INMLCF, ReliefWeb, HDX, GoFundMe hub all load fine via browser), yielding a major primary-source upgrade: INMLCF's full comunicado history + 164-victim list, OCHA's Flash Update 004 (updated national toll + a USD 5M CERF fact), and a new open-source find (Microsoft AI building-damage datasets for Cali/Pereira). The other 3 (UNGRD's repository, SGC's reviewed catalog, one Vaki campaign) were confirmed genuinely blocked/empty, not tool artifacts. **Domains 1-6 of Phase 2 are now solidly executed; remaining work is reconciling 2 new contradictions (Popayán death toll, familias-damnificadas count) and small follow-ups, not fresh research.**

## Phase 0 — Confirm event identity
- [x] Event confirmed via news aggregation (tier 6): M7.4, 2026-08-10 07:34, epicenter San José del Palmar, Chocó
- [ ] Pull SGC (Servicio Geológico Colombiano) latest bulletin directly — still only have tier-2/6 secondhand figures, not primary
- [x] Aftershock sequence noted (47+, first major M4.8)
- Output → `wiki/01-event-facts.md` (populated, needs tier-1 upgrade)

## Phase 1 — Affected geography
- [x] Departments + municipios count from UNGRD (14 deptos, 403 municipios) — via secondhand press, not direct UNGRD fetch
- [x] 6 cities ranked/started: Pereira, Cali, Quibdó, Manizales, Armenia, San José del Palmar
- [ ] Popayán mentioned, not yet detailed
- [ ] DANE population baselines — not started
- Output → `wiki/02-cities/` (6 of unknown-total cities populated)

## Phase 2 — Death toll
- [ ] UNGRD situation reports — have figures via press only, direct fetch pending
- [ ] INMLCF confirmations — not yet checked
- [ ] Local hospitals/Secretarías de Salud per city — not yet checked
- [ ] Cruz Roja bulletins — not yet checked
- [x] Cross-checked against major news, contradictions logged not silently resolved
- Output → `wiki/03-death-toll.md` populated, actively rising, `wiki/08-contradictions.md` has 7 entries (missing-persons count is the big open one: 287 vs 4,210)

## Phase 3 — Damnificados / damage toll
- [x] Houses destroyed/damaged captured (9,215 destroyed / 45,457 averiadas, UNGRD via press)
- [ ] People in albergues — count/location NOT yet found (see Phase 5 gap)
- [x] Infrastructure damage: schools, health centers, community centers, airports captured nationally
- Output → `wiki/04-damnificados.md` populated

## Phase 4 — Official government reports
- [x] Decreto de emergencia + "emergencia económica" — announced, decree number/date NOT yet found
- [x] UNGRD balance cadence observed (near-daily so far)
- [ ] Ministry statements (Salud, Vivienda) — not yet pulled
- Output → `wiki/05-gov-reports.md` populated, needs primary decree docs

## Phase 5 — Aid/relief infrastructure by city
- [x] 5 cities populated with DONOR collection points (Bogotá hub, Cali, Pereira, Manizales, Armenia)
- [ ] **GAP: this is donor drop-off data, not distribution points where affected people get help — wrong shape for the actual feature goal, needs different sources next session**
- [ ] Quibdó/San José del Palmar aid points not found at all
- Output → `wiki/07-aid-points/<city-slug>.md`

## Phase 6 — Webapp architecture (NOT STARTED — waits on Phase 0-5 data shape)
- [ ] Only begin once real city/toll/aid-point data exists to design schema against
- Output → `wiki/10-app-architecture.md`

## Decisions log
- 2026-08-13: Chose markdown wiki + lean-ctx knowledge graph combined (not lean-ctx alone) — wiki stays human-readable/diffable, knowledge graph is the fast cross-session index.
- 2026-08-13: Skipped Sernix-style repo/DB/CI scaffold — too early, no proven data model yet. Revisit at Phase 6.
- 2026-08-13: Numbers are append-only in wiki (never overwrite a toll figure) — govt revises death tolls; history matters, not just latest value.
- 2026-08-13 (session 2): Discovered aid-point data found so far (El Tiempo map) is donor-collection-focused, not distribution-focused — the actual product goal (help people find shelters/food/health) needs a different source category entirely. Flagged as top priority gap, not yet solved.
