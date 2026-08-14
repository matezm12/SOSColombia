/**
 * Incremental update — 2026-08-14 afternoon research pass.
 *
 * Appends newly-researched toll/damage figures found since the last capture
 * (2026-08-13). Does NOT touch or delete any existing row — this project's
 * discipline is append-only (govt revises tolls, history matters, see
 * wiki/03-death-toll.md). Every row here traces to wiki/03-death-toll.md and
 * wiki/04-damnificados.md's "2026-08-14 afternoon update" sections.
 *
 * Run once: `npx tsx -r dotenv/config prisma/update-2026-08-14-pm.ts`
 * Safe to re-run only if you first delete the rows it created — it does not
 * upsert, running it twice will duplicate rows.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findUniqueOrThrow({ where: { divipolaCode: '76001' } })

  // ── New sources ──────────────────────────────────────────────────────
  const sourceDefs = [
    {
      key: 'ocha_flash_005',
      url: 'https://reliefweb.int/report/colombia/colombia-flash-update-005-update-impact-earthquake-colombia-august-13-2026',
      org: 'OCHA / Equipo Humanitario País Colombia',
      tier: 1,
    },
    {
      key: 'ungrd_balance_0813_2230',
      url: 'https://www.infobae.com/colombia/2026/08/14/terremoto-en-colombia-deja-284-muertos-379-desaparecidos-y-mas-de-102000-afectados/',
      org: 'UNGRD (via Infobae)',
      tier: 2,
    },
    {
      key: 'ungrd_balance_0814_1123',
      url: 'https://www.eluniversal.com.co/colombia/2026/08/14/ultimo-balance-del-terremoto-en-colombia-285-muertos-y-379-desaparecidos/',
      org: 'UNGRD (via El Universal)',
      tier: 2,
    },
    {
      key: 'inmlcf_comunicado_07',
      // Direct medicinalegal.gov.co fetch failed this pass (DNS error, tool-level —
      // same domain the project previously confirmed loads fine via real browser,
      // see wiki/03-death-toll.md "Update 2026-08-14" note). Retry direct next pass.
      url: 'https://www.medicinalegal.gov.co/inicio/-/asset_publisher/t0LBQNMxVOxe/content/plantilla_comunicado',
      org: 'INMLCF (Medicina Legal) — via aggregator, direct fetch not re-verified this pass',
      tier: 2,
    },
    {
      key: 'inmlcf_comunicado_08',
      url: 'https://www.infobae.com/colombia/2026/08/14/a-medicina-legal-llegaron-mas-cuerpos-de-victimas-fatales-tras-el-terremoto-222-ya-fueron-entregados-a-sus-familias/',
      org: 'INMLCF (Medicina Legal) — via aggregator, direct fetch not re-verified this pass',
      tier: 2,
    },
    {
      key: 'cali_reporte_009',
      url: 'https://www.semana.com/nacion/cali/articulo/cali-actualiza-el-numero-de-muertos-desaparecidos-y-heridos-por-terremoto-estas-son-las-cifras-oficiales/202637/',
      org: 'Alcaldía de Cali (Reporte Oficial 009, via Semana)',
      tier: 2,
    },
  ]
  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    const row = await prisma.source.create({
      data: { url: s.url, org: s.org, tier: s.tier, status: 'LIVE', lastFetchedAt: new Date('2026-08-14') },
    })
    sources[s.key] = row.id
  }

  // ── National toll records ───────────────────────────────────────────
  await prisma.tollRecord.createMany({
    data: [
      // OCHA Flash Update 005 (PRIMARY, tier 1) — as of 2026-08-13 18:30
      {
        metric: 'DEATHS_REPORTED_OFFICIAL',
        value: 266,
        unit: 'personas',
        sourceId: sources.ocha_flash_005,
        tier: 1,
        asOf: new Date('2026-08-13T18:30:00-05:00'),
        notes:
          'OCHA Flash Update 005. Close to but distinct from the same-day UNGRD figure (265) already on file — same-day inter-agency variance, not treated as an error (consistent with the familias-count pattern already logged for Aug 12).',
      },
      {
        metric: 'VIVIENDAS_DESTRUIDAS',
        value: 11789,
        sourceId: sources.ocha_flash_005,
        tier: 1,
        asOf: new Date('2026-08-13T18:30:00-05:00'),
      },
      // UNGRD balance, 2026-08-13 22:30 (via Infobae)
      {
        metric: 'DEATHS_REPORTED_OFFICIAL',
        value: 284,
        unit: 'personas',
        sourceId: sources.ungrd_balance_0813_2230,
        tier: 2,
        asOf: new Date('2026-08-13T22:30:00-05:00'),
        notes: 'UNGRD balance read out during President De La Espriella\'s emergency briefing.',
      },
      { metric: 'INJURED', value: 3977, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'MISSING_OFFICIAL', value: 379, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'DAMNIFICADOS_PERSONAS', value: 102263, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'DAMNIFICADOS_FAMILIAS', value: 45523, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'VIVIENDAS_DESTRUIDAS', value: 12597, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'VIVIENDAS_AVERIADAS', value: 71763, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      { metric: 'EDIFICIOS_COLAPSADOS', value: 121, sourceId: sources.ungrd_balance_0813_2230, tier: 2, asOf: new Date('2026-08-13T22:30:00-05:00') },
      // UNGRD balance, 2026-08-14 11:23 (via El Universal) — latest as of this pass
      {
        metric: 'DEATHS_REPORTED_OFFICIAL',
        value: 285,
        unit: 'personas',
        sourceId: sources.ungrd_balance_0814_1123,
        tier: 2,
        asOf: new Date('2026-08-14T11:23:00-05:00'),
        notes: 'Latest national death toll as of this pass. 15 departamentos, 426 municipios (38% of the country).',
      },
      { metric: 'INJURED', value: 3975, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'MISSING_OFFICIAL', value: 379, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'DAMNIFICADOS_PERSONAS', value: 102262, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'DAMNIFICADOS_FAMILIAS', value: 45523, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'VIVIENDAS_DESTRUIDAS', value: 12828, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      {
        metric: 'VIVIENDAS_AVERIADAS',
        value: 73455,
        sourceId: sources.ungrd_balance_0814_1123,
        tier: 2,
        asOf: new Date('2026-08-14T11:23:00-05:00'),
        notes: 'UNGRD itself noted this figure was revised DOWN from 74,873 after engineering teams completed further structural assessments — a methodology correction, not a sign of improving conditions.',
      },
      { metric: 'EDIFICIOS_COLAPSADOS', value: 121, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'CENTROS_EDUCATIVOS_AFECTADOS', value: 2205, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      { metric: 'CENTROS_SALUD_AFECTADOS', value: 240, sourceId: sources.ungrd_balance_0814_1123, tier: 2, asOf: new Date('2026-08-14T11:23:00-05:00') },
      // INMLCF forensic count
      {
        metric: 'DEATHS_CONFIRMED_FORENSIC',
        value: 250,
        unit: 'cuerpos recibidos',
        sourceId: sources.inmlcf_comunicado_07,
        tier: 2,
        asOf: new Date('2026-08-13T00:00:00-05:00'),
        notes: 'INMLCF Comunicado Oficial No. 07.',
      },
      {
        metric: 'DEATHS_CONFIRMED_FORENSIC',
        value: 228,
        unit: 'cuerpos identificados',
        sourceId: sources.inmlcf_comunicado_07,
        tier: 2,
        asOf: new Date('2026-08-13T00:00:00-05:00'),
        notes: 'INMLCF Comunicado 07 — 13 menores entre los identificados.',
      },
      {
        metric: 'DEATHS_CONFIRMED_FORENSIC',
        value: 260,
        unit: 'cuerpos recibidos',
        sourceId: sources.inmlcf_comunicado_08,
        tier: 2,
        asOf: new Date('2026-08-13T19:00:00-05:00'),
        notes: 'INMLCF Comunicado Oficial No. 08, 7:00pm — latest as of this pass.',
      },
      {
        metric: 'DEATHS_CONFIRMED_FORENSIC',
        value: 243,
        unit: 'cuerpos identificados',
        sourceId: sources.inmlcf_comunicado_08,
        tier: 2,
        asOf: new Date('2026-08-13T19:00:00-05:00'),
        notes:
          'INMLCF Comunicado 08 — 17 menores, 222 cuerpos entregados. Sourcing caveat: one aggregator independently reported 246 identified for this same comunicado instead of 243 — could not resolve which is the transcription error without a direct medicinalegal.gov.co fetch (blocked this pass, DNS). Treat as 243 ± 3 pending re-verification.',
      },
    ],
  })

  // ── Cali municipio update ───────────────────────────────────────────
  await prisma.tollRecord.createMany({
    data: [
      {
        municipioId: cali.id,
        metric: 'DEATHS_REPORTED_OFFICIAL',
        value: 110,
        sourceId: sources.cali_reporte_009,
        tier: 2,
        asOf: new Date('2026-08-14T00:00:00-05:00'),
        notes: 'Alcaldía de Cali Reporte Oficial 009 — up from the Aug 12 cali.gov.co figure of 96. 92 cuerpos ya entregados a sus familias.',
      },
      { municipioId: cali.id, metric: 'INJURED', value: 1410, sourceId: sources.cali_reporte_009, tier: 2, asOf: new Date('2026-08-14T00:00:00-05:00') },
      { municipioId: cali.id, metric: 'MISSING_OFFICIAL', value: 115, sourceId: sources.cali_reporte_009, tier: 2, asOf: new Date('2026-08-14T00:00:00-05:00') },
      {
        municipioId: cali.id,
        metric: 'EDIFICIOS_COLAPSADOS',
        value: 81,
        sourceId: sources.cali_reporte_009,
        tier: 2,
        asOf: new Date('2026-08-14T00:00:00-05:00'),
        notes: '46 con colapso total + 35 con colapso parcial (sumados). 1,408 edificaciones adicionales con daños estructurales, 457 con orden de evacuación.',
      },
    ],
  })

  // ── New contradiction: same-day national toll variance (OCHA vs UNGRD) ─
  await prisma.contradiction.create({
    data: {
      topic: 'Muertos nacional, 2026-08-13 (mismo día, dos agencias)',
      valueA: '265 (UNGRD, corroborado vía 3 medios)',
      sourceA: 'UNGRD balance 2026-08-13 (via teleSUR/7N/DW)',
      valueB: '266 (OCHA Flash Update 005, 18:30, tier 1)',
      sourceB: 'OCHA Flash Update 005',
      status: 'RESOLVED',
      resolutionText:
        'Diferencia de 1 entre dos agencias el mismo día — consistente con el patrón ya visto en familias damnificadas (24,324 vs 30,324 el 12 de agosto). Tratado como volatilidad esperada entre reportes de distintas agencias que consolidan en horarios distintos, no un error de datos.',
      resolvedAt: new Date('2026-08-14'),
    },
  })

  console.log('Update complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
