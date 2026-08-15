/**
 * Pass 33a (2026-08-15) — Cali casualty figure update surfaced during the
 * third-round follow-up pass. Pass 24 found a Cali-specific conflict
 * (74/96/111 dead) too scattered to resolve confidently and deliberately
 * logged no TollRecord for it. This pass found much stronger convergence:
 * multiple independent outlets (Semana, El País, La FM, Pulzo, Espacio
 * Diario) citing the Alcaldía de Santiago de Cali's own Centro de
 * Coordinación de Información (CPI) report, Aug 14 ~5pm, at 110 dead / 115
 * missing. One same-window Facebook post citing the Alcaldía directly gave
 * 104 dead instead — logged as a separate row rather than merged, per this
 * project's never-overwrite discipline.
 * Run once via `npx tsx prisma/seed-pass33a-cali-toll-update.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const sourceDefs = [
    {
      key: 'semana_cali_balance_0814',
      url: 'https://www.semana.com/nacion/cali/articulo/cali-actualiza-balance-tras-el-terremoto-110-muertos-115-desaparecidos-y-1410-heridos/202637/',
      org: 'Revista Semana, citando el Centro de Coordinación de Información (CPI) de la Alcaldía de Santiago de Cali',
      tier: 2,
    },
    {
      key: 'nuestraregion_cali_104_0814',
      url: 'https://www.facebook.com/ia.republica/posts/pfbid02vn6Rr4wx1mz6H5GjGDfWwNyobVcmX7ky7YBYHxUi7VuRnimY4apvR4KLDXwUfCA7l',
      org: 'IA República / Nuestra Región, citando a la Alcaldía de Cali',
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
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 110, sourceKey: 'semana_cali_balance_0814', tier: 2, asOf: '2026-08-14T17:00:00-05:00', notes: 'Balance CPI/CTI de la Alcaldía de Santiago de Cali, viernes 14 de agosto. Reemplaza en confianza al conflicto no resuelto de la pasada 24 (74/96/111) — 96 dead/111 missing era el corte del miércoles 12 a las 8pm; este es el corte del jueves/viernes. Un segundo dato del mismo día (104) se registra por separado abajo en vez de fusionarse.' },
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 104, sourceKey: 'nuestraregion_cali_104_0814', tier: 3, asOf: '2026-08-14T18:00:00-05:00', notes: 'Lectura distinta del mismo balance oficial de la Alcaldía, citada por una página de Facebook distinta el mismo día — no coincide con la cifra de 110 de Semana/El País, registrada como fila separada en vez de resolverse a un solo número.' },
    { metric: 'MISSING_OFFICIAL' as const, value: 115, sourceKey: 'semana_cali_balance_0814', tier: 2, asOf: '2026-08-14T17:00:00-05:00', notes: 'Balance CPI/CTI. Pulzo cita una variante menor (111) el mismo día — no se registra por separado dado que la diferencia (115 vs 111) es marginal comparada con la brecha entre las dos cifras de muertos.' },
    { metric: 'INJURED' as const, value: 1410, sourceKey: 'semana_cali_balance_0814', tier: 2, asOf: '2026-08-14T17:00:00-05:00', notes: 'Balance CPI/CTI.' },
    { metric: 'EDIFICIOS_COLAPSADOS' as const, value: 46, sourceKey: 'semana_cali_balance_0814', tier: 2, asOf: '2026-08-14T17:00:00-05:00', notes: '46 edificaciones en colapso total, dentro de un total de 89 estructuras con algún tipo de afectación (43 con daño parcial) según el mismo balance — solo se registra el colapso total, que es la lectura más directa de esta métrica.' },
  ]

  let created = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: cali.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: cali.id,
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
