# Findings — SOSColombia

Chronological research log. Raw discoveries land here first; curated/sourced facts get promoted into `wiki/`. Don't skip this step — findings.md is the scratch layer, wiki/ is the cleaned layer.

Format per entry:
```
## YYYY-MM-DD — <topic>
Source: <url or doc name> (tier N)
Finding: <what was learned>
Promoted to: <wiki file, or "pending">
```

---

## 2026-08-13 — Event identity confirmed
Source: WebSearch "terremoto Colombia agosto 2026" + "earthquake Colombia this week August 2026" (tier 6 aggregated)
Finding: M7.4 earthquake, 2026-08-10 07:34 local, epicenter San José del Palmar, Chocó, depth 103 km (SGC). Most-affected: Risaralda, Valle del Cauca.
Promoted to: wiki/01-event-facts.md

## 2026-08-13 — Wikipedia aggregator deep pull
Source: es.wikipedia.org/wiki/Terremoto_de_Colombia_de_2026 (tier 6, cites SGC/USGS)
Finding: Full casualty timeline Aug 10→13, coordinates (with internal inconsistency — two coord sets in same article), aftershock counts, department death breakdown, per-city casualty figures, government response (USAR teams, PMU).
Promoted to: wiki/01-event-facts.md, wiki/03-death-toll.md, wiki/04-damnificados.md

## 2026-08-13 — UNGRD official balance (via news coverage)
Source: WebSearch surfaced El Colombiano coverage of UNGRD balance, tier 2 content relayed via tier 6 outlet
Finding: 2026-08-12 07:30 UNGRD balance: 239 muertos, 3,755 heridos, 287 desaparecidos, 14 departamentos, 403 municipios, 24,324 familias/49,214 personas afectadas, 9,215 viviendas destruidas, 45,457 averiadas, 140 edificios colapsados, 1,667 centros educativos, 530 centros comunitarios, 188 centros de salud afectados. Department deaths: Valle del Cauca 125, Risaralda 94, Chocó 14, Caldas 6, Antioquia 1.
Promoted to: wiki/03-death-toll.md, wiki/04-damnificados.md, wiki/05-gov-reports.md
Note: this is UNGRD's data but I have NOT yet fetched it from ungrd.gov.co directly — currently secondhand via press. Flagged as TODO.

## 2026-08-13 — Aid/collection centers map
Source: El Tiempo "mapa completo de los centros de acopio" (tier 6)
Finding: Detailed list of ~40 donation collection points across 15+ departments, organized mostly by Cruz Roja, Alcaldías, Gobernaciones, and food banks (Bancos de Alimentos). Important distinction discovered: these are DONOR drop-off points, not distribution points where affected people receive aid. That's a real gap for the eventual "help centers" feature — need a different source for shelter/distribution data.
Promoted to: wiki/07-aid-points/*.md (bogota, cali, pereira, manizales, armenia)

## 2026-08-13 — Per-city red-alert breakdown
Source: Infobae "balance de las zonas más afectadas" (tier 6)
Finding: Five red-alert cities identified — Cali, Pereira, Manizales, Armenia, Quibdó — each with distinct casualty/infrastructure figures as of Aug 11. Pereira has highest death toll (66) despite Cali being larger/more damaged overall (95 deaths, more injured/trapped). Quibdó, despite being nearest epicenter, has lowest death toll of the five — likely population/density effect, not severity effect.
Promoted to: wiki/02-cities/pereira.md, cali.md, quibdo.md, manizales.md, armenia.md

## 2026-08-13 — Government response details
Source: mixed search snippets (Infobae x2, tier 6)
Finding: President Abelardo de la Espriella declared national disaster + is declaring "emergencia económica," creating a fund called "Fondo Milagro." Announcement 2026-08-13 of shelter/power/reconstruction plan specifically for Chocó.
Promoted to: wiki/05-gov-reports.md
Note: decree numbers/dates and Fondo Milagro scope not yet found — need direct fetch of these Infobae articles or a government gazette source.

## Gaps identified this session (carried into wiki/00-INDEX.md priorities)
- No tier-1 source fetched yet (sgc.gov.co, ungrd.gov.co) — everything is tier 2-6
- San José del Palmar (epicenter town itself) has almost no dedicated coverage
- Missing-persons count contradiction (287 vs 4,210) unresolved, large gap
- Aid-points data is donor-collection-focused, not distribution/shelter-focused — wrong shape for the eventual "where do I get help" feature
- No DANE population baselines pulled yet for any city
- Popayán mentioned but not detailed

## 2026-08-13 — Phase 2 scoping workflow (7 agents: 6 domain scopers + synthesis)
Source: Workflow tool, 6 parallel agents + 1 synthesis, each doing light real WebSearch/WebFetch scouting (tier varies per finding, see wiki/research-plan-phase2.md)
Finding: Full 6-domain deep research plan produced — primary-source toll tracking, Pereira hyperlocal aid directory (replicable to other cities), open-source tools/APIs, veterinary/animal aid, crowdfunding, country/city reference data. Each domain got real leads, not just a generic outline:
- **Toll data**: INMLCF publishes numbered "Comunicado Oficial" bulletins with per-city body counts (Pereira highest at 69, then Cali 25, Quibdó 11) — distinct data stream from UNGRD's national figure; blocked by a TLS cert error via WebFetch. PAHO SitRep 1 fetched successfully. ReliefWeb/HDX both 403'd (likely WAF, not real block). Strong circumstantial evidence the 287-vs-4,210 missing-persons contradiction is an early comms-outage-driven estimate (Risaralda: 77% of cell towers down day-after) later revised down, but not confirmed by a source stating the revision explicitly.
- **Pereira hyperlocal**: 6 named shelters (Coliseo Mayor, Parque El Vergel, Parque El Oso, Estadio Mora Mora, Parque Olaya Herrera, Plaza de Ferias), 7 activated collection centers, a Dosquebradas relief point (Parroquia San Marcos Evangelista), La Virginia's Centro de Integración Ciudadana, and vet leads (Ukumarí, Hospital de Maraya — closed, Fixit hotline). Confirmed WebSearch cannot browse live hashtag feeds, timelines, or WhatsApp/Telegram content — a universal wall across every domain, not Pereira-specific.
- **Open-source tools**: HOT OSM has an ACTIVE 2026 Colombia earthquake mapping project (Tasking Manager + ChatMap, covers Cali/Pereira/Quibdó). mapadelterremoto.com (Naboo Intelligence) is a previously-unknown third-party aggregator tracking 2,082 points/317 municipios/206 shelter points (31 in Pereira) — closest existing analog to this project's goals, plans an open-format release after Nov 30 2026. datos.gov.co has a Socrata API with an ideal DIVIPOLA-keyed schema but returned empty for Aug 2026 queries (unclear if real lag or query-syntax issue).
- **Crowdfunding**: Could NOT confirm the "Camila Franco" GoFundMe campaign exists for this earthquake — closest match is an unrelated 2020 house-fire fundraiser. Found several real campaigns instead (Rescate x Colombia, Colombia Earthquake: Help Families Rebuild, Willy García's Vaki campaign for Buenaventura/Chocó). Confirmed active scam activity exploiting the earthquake (WhatsApp/SMS phishing, fake victim lists) — informs a verification rubric.
- **Animal/vet aid**: Confirmed thin/decentralized government coordination for this vertical — mostly NGO/informal-volunteer driven (Nicolás Arbeláez's solo brigade, Una Garra por Colombia crowdfunding). Livestock/farm-animal care is an uncovered gap (only found human-food milk/meat aid from Fedegán, not injured-animal treatment).
- **Country/city data**: Got 2026 DANE population figures for Pereira (487,820), Cali (2,269,983), Manizales (475,690), Quibdó (143,332) via a third-party aggregator (needs direct dane.gov.co verification). Armenia's 2026 municipal figure still missing. San José del Palmar shows a population DECREASE between 2024/2025 aggregator figures (5,697→5,130) — unresolved, same pattern as the missing-persons contradiction. Found the 1999 Eje Cafetero earthquake as the key historical precedent (same cities: Armenia ~800 dead/~75% of city population damnificados) for trajectory comparison.
Promoted to: wiki/research-plan-phase2.md (full plan, not yet executed)
Note: this was a PLANNING pass per the user's request — light scouting made the plan concrete, but none of these leads are yet verified/committed as authoritative wiki facts. Next session executes against this plan.

## 2026-08-13 — Phase 2 execution pass (6 agents, WebSearch/WebFetch only)
Source: Agent tool (parallel, not Workflow), 6 agents each executing (not just scoping) against the Phase 2 plan
Finding: A large number of Phase 2 leads got verified, corrected, or resolved:
- **Missing-persons contradiction (287 vs 4,210) RESOLVED**: they're two different metrics (UNGRD/OCHA official institutional count vs "Colombia Te Busca" crowdsourced self-reported platform), not a data error. No revision ever happened between them — they're parallel tracks measuring different things.
- **USGS confirmed as a clean primary seismic source** (direct API, event us6000tjl2: M7.4, depth 110.285km, coords 4.8436°N/-76.2422°W). SGC's own bulletins also reached directly, revealing depth drifted across their own revisions (82km→96km→103km) and diverges from USGS — a genuine inter-agency discrepancy now logged, not an error.
- **Corrected the "strongest earthquake in Colombian history" claim** — SGC's own ranking is 3rd-largest (after 1906 M8.8 and 1979 Tumaco M8.1), not "strongest ever" as an earlier Wikipedia-sourced claim implied.
- **Two real errors caught and fixed**: La Tarde (a Pereira newspaper listed as a source) has actually been defunct since 2016 (merged into El Diario); Ukumarí's "emergency pet point" role, treated as a confirmed lead in the Phase 2 plan, could not be substantiated on direct verification and was downgraded to unconfirmed.
- **datos.gov.co's Socrata "Emergencias UNGRD" dataset — confirmed dead**, not just slow: newest record is from 2022-12-31, a `$select=max(fecha)` query proved it directly. Dropped as a source entirely despite having an ideal schema.
- **mapadelterremoto.com directly answered the core "donor points vs distribution points" question** for the whole project: its own page structure separates "albergues" (shelters, where displaced people stay) from "centros de acopio" (donation collection points) — confirms the acopio≠distribution finding from Phase 1 generalizes, and gives a template for how the app's own data model should split these categories.
- **Real DANE population figures pulled directly** (not via third-party aggregator) for all 6 target cities, correcting 4 of 5 previously-aggregator-sourced numbers and resolving a San José del Palmar "population decrease" that turned out to be a pure aggregator error (DANE shows continuous growth).
- **Crowdfunding**: the user's real GoFundMe link (gofund.me/740d646f4) resolved to a genuine campaign — "Relief Supplies for Colombia Earthquake" by Camila Franco, Pereira-focused, created Aug 10, $1,600 goal/$1,262 raised/19 donors. 3 more GoFundMe campaigns got live figures via direct WebFetch (contrary to the earlier assumption that GoFundMe pages are always JS-blocked — individual campaign pages resolve fine, only the aggregate relief hub is JS-blocked).
- **Confirmed hard blocks needing browser automation** (all retried, all still blocked): medicinalegal.gov.co (TLS cert error), reliefweb.int + data.humdata.org (403 on literally every endpoint tried, including individual report pages — ruling out "only the API/hub is blocked"), repositorio.gestiondelriesgo.gov.co (network-level ECONNREFUSED, not just 403), catalogosismico.sgc.gov.co (JS SPA), Vaki campaign figures (JS-rendered), GoFundMe relief hub listing (JS-rendered).
- **Pereira's aid-points file substantially upgraded**: shelter open/closed status as of last-confirmed Aug 12 snapshot, 7 CEDE collection-center addresses (2 high-confidence, 4 medium, 1 unresolved), corrected veterinary section. Cali/Manizales/Armenia/Quibdó got a first pass each — much thinner (Armenia has zero confirmed named shelters despite repeated searches; Quibdó's addresses are all single-source medium-confidence).
Promoted to: wiki/01-event-facts.md, 03-death-toll.md, 05-gov-reports.md, 06-sources.md, 08-contradictions.md, 09-glossary.md, 11-crowdfunding-campaigns.md (new), 13-opensource-tools.md (new), 13a-mapadelterremoto-watch.md (new), 14-context-reference.md (new), 02-cities/pereira.md, 07-aid-points/{pereira,cali,manizales,armenia,quibdo}.md
Note: per explicit user decision, all social-media/logged-in platform work (X/Instagram/Facebook/TikTok/WhatsApp/Telegram) remains deferred — not attempted this session, needs browser automation.

## 2026-08-14 — Social media live pass (X/Instagram/Facebook/TikTok, logged-in browser automation)
Source: claude-in-chrome, user's own logged-in sessions, driven directly (no subagents — reasoned that parallel agents on one shared live browser session would collide)
Finding: Logged-in social search substantially outperformed everything tried before it — official accounts post detailed graphics (addresses/phones baked into flyer images, invisible to plain WebSearch) and Facebook in particular, previously flagged as "weakest via site: search," turned out to be the single best source once logged in.
- Official Alcaldía de Pereira Facebook post gave the definitive 6-shelter list (resolved the last "Plaza de Ferias" gap); all 7 Pereira CAFE collection-point addresses resolved and cross-verified twice (X + Instagram independently)
- A national 5-city blood-donation flyer (Bogotá/Cali/Manizales/Pereira/Quibdó) with precise addresses/phones, dated Aug 12
- "Colombia Un Solo Corazón" (Canal 6 + Tigresas) fully detailed for the first time — ~15 collection points nationally (2 new: Quibdó, Cali/Yumbo) plus 3 monetary donation orgs with published NITs, a stronger trust signal than most crowdfunding sources found so far
- Cali: an urgent addressable need at a nursing home (roof/bathroom collapsed on disabled elderly residents) and a crowd-organized free-lodging network (motels, named contact)
- Manizales: a rental-subsidy registration mechanism (register with Fire Dept) and a second blood-bank address that conflicts with the one already on file (flagged, unresolved)
- Identified individual/small accounts as an ongoing watchlist (pet-focused Pereira TikTok account, daily-coverage accounts) per user request to track people, not just orgs
- Mid-session the user asked about embeds/link previews for the eventual site: confirmed all 4 platforms support public embedding (TikTok/X fully open oEmbed, Instagram/Facebook need a one-time free app registration for bulk use) — retroactively captured permalink URLs for the highest-value posts found, and made "always capture the permalink" a standing rule going forward (see wiki/15-social-media-methodology.md)
Promoted to: wiki/07-aid-points/{pereira,cali,manizales,quibdo}.md, wiki/11-crowdfunding-campaigns.md, wiki/15-social-media-methodology.md (new)
Note: Armenia, San José del Palmar, and Popayán have NOT yet had a social-media pass — only Pereira/Cali/Manizales/Quibdó this session. WhatsApp/Telegram remain deferred (need group invites, not just login).

## 2026-08-14 — Social media pass, remaining 3 cities (Armenia, San José del Palmar, Popayán)
Source: claude-in-chrome, same direct-drive approach
Finding: Armenia's official X account confirmed dormant since Feb 2025 (explains why no official aid posts were ever found there); Instagram is the actually-active channel but drew public backlash for prioritizing a traffic announcement over shelter info; a crowd-reported shelter (Coliseo del Sur) surfaced but is unconfirmed officially; a resident's own post explained that Armenia's zero-death outcome likely explains its lack of media/government attention — independently confirming a pattern this project had only inferred from official data. San José del Palmar: found a verified journalist (321K followers) who flew to the epicenter and is personally vetting Chocó donation channels. Popayán: found 6 more collection-point addresses via a community campaign, revealing mapadelterremoto.com had undercounted it (listed zero acopio points for Popayán despite these 6+ existing).
Promoted to: wiki/07-aid-points/{armenia,quibdo,popayan}.md, wiki/02-cities/{armenia,san-jose-del-palmar}.md

## 2026-08-14 — Retried every WebFetch-blocked source via browser automation
Source: claude-in-chrome, direct drive
Finding: 4 of 7 previously-blocked sources turned out to be pure tool-level limitations (TLS cert handling, bot/WAF 403s, JS-rendering) — all loaded perfectly via a real logged-in browser:
- **INMLCF** (medicinalegal.gov.co): full primary-source win. All 6 "Comunicado Oficial" bulletins captured with exact dates/figures, plus the complete 164-name victim list from Comunicado 05 broken down by city — Pereira has 83 identified victims, more than double any other city (Cali 39, Quibdó 11). Surfaced a new contradiction: 1 named Popayán victim in this list conflicts with the earlier "zero deaths in Cauca" finding.
- **ReliefWeb**: captured OCHA's "Flash Update 004" directly — the best multi-sector primary document found for this event. Updated toll (241 dead, 49,214 affected) plus a new fact: USD 5 million CERF allocation.
- **HDX**: found Microsoft AI for Good Lab's satellite-based building-damage datasets for Cali and Pereira, fully downloadable — a genuinely new open-source find nobody had surfaced before.
- **GoFundMe's relief hub**: fully enumerable via browser (17 pages of verified campaigns, not JS-blocked as assumed) — captured all 12 campaigns on page 1.

The other 3 blocked sources were confirmed genuinely blocked/empty, not tool artifacts — a useful distinction to preserve: UNGRD's document repository has a real network-level error (not a WebFetch quirk); SGC's manually-reviewed seismic catalog loads and works fine but simply hasn't processed the Aug 2026 event yet (QA lag, not a block); Vaki's highest-profile campaign genuinely has zero donations (not a rendering failure).
Promoted to: wiki/03-death-toll.md, 04-damnificados.md, 05-gov-reports.md, 06-sources.md, 08-contradictions.md, 11-crowdfunding-campaigns.md, 13-opensource-tools.md, 02-cities/popayan.md

## 2026-08-14 — Pass 1-3 closing sequence (new bounded-process discipline)
Source: mixed — Google/browser search (WebSearch budget exhausted), direct DANE file pull, direct browser navigation to mapadelterremoto.com and HDX
Finding: Executed the 3-pass stage-1-closing sequence defined in task_plan.md's new "Governing process" section.
- **Pass 1**: Popayán death toll resolved (1 confirmed, Carlos Ernesto Rennella Campo — real taxi-cooperative member, cross-verified 7+ outlets). Familias contradiction resolved as volatility via a third data point (25,872). New open item surfaced: Armenia-Calarcá victim attribution ambiguity.
- **Pass 2**: Popayán DANE population confirmed (349,671). Decreto 1171 substantive content confirmed (national-character disaster, signed night of Aug 11). Risaralda urgencia-manifiesta powers confirmed (Contraloría oversight); decree number itself stays unfound, queued. Armenia's Coliseo del Sur shelter upgraded to officially confirmed. Manizales official cifras found (6 fallecidos, 2,000+ damnificados, curfew). Pereira Expofuturo flyer permalink not found directly.
- **Pass 3**: HDX confirmed (not assumed) no Manizales/Armenia/Quibdó building-damage dataset exists. mapadelterremoto.com re-verified via RAW browser fetch (not WebFetch's lossy summary) for all 5 red-alert cities — exact current counts logged in wiki/13a-mapadelterremoto-watch.md. This raw fetch also gave a much stronger Expofuturo confirmation than the Pass 2 permalink chase (official national campaign, P-420, announced by the first lady), plus a 7th Pereira site, 2 more acopio points, and reopened the Ukumarí vet-point question with new stronger evidence (queued).
Promoted to: wiki/02-cities/{popayan,armenia,manizales}.md, wiki/03-death-toll.md, wiki/04-damnificados.md, wiki/05-gov-reports.md, wiki/07-aid-points/{pereira,armenia,manizales}.md, wiki/08-contradictions.md, wiki/13-opensource-tools.md, wiki/13a-mapadelterremoto-watch.md, wiki/14-context-reference.md, wiki/16-deferred-queue.md (new), wiki/00-INDEX.md
Note: **STAGE 1 (research-complete dataset) declared done.** Next work is stage 2 (webapp architecture), not further open-ended research.
