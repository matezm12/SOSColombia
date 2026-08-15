/**
 * Pass 23a (2026-08-14, afternoon) — casualty/damage figure update surfaced
 * incidentally during the Pereira follow-up social pass: President de la
 * Espriella toured Pereira and cited significantly higher national and
 * Pereira-city figures than anything on file (latest national figure on
 * file was 265 dead as of Aug 13; this is 285-287 dead as of Aug 14
 * afternoon). Also captures the first Pereira CITY-level toll figures ever
 * recorded (previously only Risaralda department-level existed). Two
 * same-day sources give slightly different numbers (285 vs 287 national
 * dead; 94 vs 95 Pereira dead) — both logged per the project's
 * never-overwrite, log-the-volatility discipline, not resolved to one.
 * Run once via `npx tsx prisma/seed-pass23a-toll-update-aug14.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const risaralda = await prisma.department.findFirstOrThrow({ where: { divipolaCode: '66' } })

  const sourceDefs = [
    {
      key: 'efe_pereira_tour_0814',
      url: 'https://x.com/MarioJPenton/status/2088445571954851972',
      org: 'EFE (vía Mario J. Pentón, adn Noticias, NotiExpressColo — cobertura de la gira presidencial a Pereira)',
      tier: 2,
    },
    {
      key: 'alcaldia_pereira_pmu_0814',
      url: 'https://www.facebook.com/Taxistas2020/posts/pfbid02yUvLzLPQzVhMDP4sEUSSa6RTLrM1deXcAgQXBozt8CVu1G62oemdeMXtDiGuLxbgl',
      org: 'Alcaldía de Pereira - balance del PMU, alcalde Mauricio Salazar (relayed vía Amarillos de Oro news)',
      tier: 3,
    },
  ] as const

  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    let src = await prisma.source.findFirst({ where: { url: s.url } })
    if (!src) {
      src = await prisma.source.create({ data: { url: s.url, org: s.org, tier: s.tier } })
      console.log(`Created Source: ${s.key}`)
    }
    sources[s.key] = src.id
  }

  const tollDefs = [
    // ── National (Aug 14 afternoon, two independently-sourced readings) ──
    { scope: 'national', metric: 'DEATHS_REPORTED_OFFICIAL', value: 287, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T14:00:00-05:00', notes: 'adn Noticias reading of the same-day EFE wire — see 285 reading below from a different repost of the same wire copy, logged separately as expected same-day volatility, not resolved.' },
    { scope: 'national', metric: 'DEATHS_REPORTED_OFFICIAL', value: 285, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T13:00:00-05:00', notes: 'NotiExpressColo reading of the EFE wire, ~7h before capture. Both this and the 287 reading significantly exceed the last figure on file (265, Aug 13) — a real one-day jump, not just noise.' },
    { scope: 'national', metric: 'INJURED', value: 3975, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T13:00:00-05:00', notes: 'EFE wire, same article as the 285-dead reading' },
    { scope: 'national', metric: 'MISSING_OFFICIAL', value: 379, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T13:00:00-05:00', notes: 'EFE wire — down from the Aug 12 figure of 287 on file under a DIFFERENT count basis (that one was tier-2 UNGRD morning balance); a second same-day reading (~400) also circulated, see next row.' },
    { scope: 'national', metric: 'MISSING_OFFICIAL', value: 400, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T14:00:00-05:00', notes: 'adn Noticias rounded reading ("~400") of the same-day figure, logged alongside the more precise 379 EFE reading rather than merged.' },
    { scope: 'national', metric: 'VIVIENDAS_DESTRUIDAS', value: 12828, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T13:00:00-05:00', notes: 'Up from 9,215 on file (Aug 12) — consistent with an ongoing structural-assessment process finding more total-loss homes over time, not a contradiction.' },

    // ── Pereira (municipio) — first-ever city-level toll figures on file for Pereira specifically, previously only Risaralda department-level existed ──
    { scope: 'pereira', metric: 'DEATHS_REPORTED_OFFICIAL', value: 95, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'Alcalde Mauricio Salazar\'s PMU (Puesto de Mando Unificado) balance, relayed by a local news page. A second same-day reading (94, from the presidential-tour coverage) is logged separately below rather than merged.' },
    { scope: 'pereira', metric: 'DEATHS_REPORTED_OFFICIAL', value: 94, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T14:00:00-05:00', notes: 'Figure cited during President de la Espriella\'s Pereira tour coverage — this matches the existing Risaralda DEPARTMENT-level figure (94, Aug 12) almost exactly, consistent with Pereira accounting for nearly all of the department\'s toll as its capital and the area closest to the most severe shaking.' },
    { scope: 'pereira', metric: 'INJURED', value: 259, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance; matches the 259 figure separately cited in the presidential-tour coverage for Risaralda department, again consistent with Pereira driving nearly all of the departmental toll.' },
    { scope: 'pereira', metric: 'MISSING_OFFICIAL', value: 270, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance; a second same-day departmental reading (260) is logged separately at the Risaralda level rather than merged, since the two are attributed to different scopes (Pereira city vs. Risaralda dept) by their respective sources.' },
    { scope: 'pereira', metric: 'DAMNIFICADOS_PERSONAS', value: 120000, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance: "40,000+ damnificados (~120k personas)". A second same-day reading (~140,000) from the presidential-tour coverage is logged separately below.' },
    { scope: 'pereira', metric: 'DAMNIFICADOS_PERSONAS', value: 140000, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T14:00:00-05:00', notes: 'Figure cited during the presidential tour — ~41,600 families.' },
    { scope: 'pereira', metric: 'DAMNIFICADOS_FAMILIAS', value: 40000, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance.' },
    { scope: 'pereira', metric: 'DAMNIFICADOS_FAMILIAS', value: 41600, sourceKey: 'efe_pereira_tour_0814', tier: 2, asOf: '2026-08-14T14:00:00-05:00', notes: 'Presidential-tour coverage.' },
    { scope: 'pereira', metric: 'VIVIENDAS_AVERIADAS', value: 35200, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance: "35,200+ viviendas afectadas (15% de la vivienda de la ciudad)".' },
    { scope: 'pereira', metric: 'EDIFICIOS_COLAPSADOS', value: 66, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance: 66 edificios en colapso total.' },
    { scope: 'pereira', metric: 'CENTROS_SALUD_AFECTADOS', value: 7, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance.' },
    { scope: 'pereira', metric: 'CENTROS_EDUCATIVOS_AFECTADOS', value: 165, sourceKey: 'alcaldia_pereira_pmu_0814', tier: 3, asOf: '2026-08-14T15:00:00-05:00', notes: 'PMU balance total. A narrower, independently-sourced figure (67 instituciones educativas siendo evaluadas por ingenieros estructurales antes de autorizar regreso a clases) comes from the Alcaldía de Pereira\'s own official reel (facebook.com/reel/1678233543280127, Aug 11) — that 67 is a subset (schools formally under structural evaluation), not a contradiction of this broader 165-affected total.' },
  ] as const

  let created = 0
  for (const t of tollDefs) {
    const municipioId = t.scope === 'pereira' ? pereira.id : undefined
    const existing = await prisma.tollRecord.findFirst({
      where: {
        municipioId: municipioId ?? null,
        departmentId: null,
        metric: t.metric,
        value: t.value,
        asOf: new Date(t.asOf),
      },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: municipioId ?? undefined,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    created++
  }
  console.log(`TollRecord: ${created} created`)

  // ── Risaralda department: a second same-day MISSING_OFFICIAL reading (260)
  // distinct from Pereira's own 270 PMU figure — kept at department scope
  // since that's how the presidential-tour coverage framed it. ──────────────
  const existingDeptMissing = await prisma.tollRecord.findFirst({
    where: { departmentId: risaralda.id, metric: 'MISSING_OFFICIAL', value: 260, asOf: new Date('2026-08-14T14:00:00-05:00') },
  })
  if (!existingDeptMissing) {
    await prisma.tollRecord.create({
      data: {
        departmentId: risaralda.id,
        metric: 'MISSING_OFFICIAL',
        value: 260,
        sourceId: sources.efe_pereira_tour_0814,
        tier: 2,
        asOf: new Date('2026-08-14T14:00:00-05:00'),
        notes: 'Presidential-tour coverage figure for Risaralda department, distinct from Pereira city\'s own 270 PMU-balance reading logged above.',
      },
    })
    console.log('Created TollRecord: Risaralda MISSING_OFFICIAL 260')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
