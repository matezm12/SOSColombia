/**
 * Pass 31a (2026-08-15) — first-ever municipio-level toll figures for San
 * José del Palmar, the earthquake's epicenter, surfaced during the
 * follow-up social pass. Previously only Chocó department-level figures
 * existed. Sourced to a Burbuja Política article (Aug 13) directly quoting
 * the Chocó Governor (Nubia Carolina Córdoba Curi) and the San José del
 * Palmar Mayor (León Fabio Marín Moncada). Notably: zero confirmed deaths
 * in the urban zone as of that date, with rural areas still being
 * verified — logged as-is rather than assumed complete.
 * Run once via `npx tsx prisma/seed-pass31a-sanjosepalmar-toll-update.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sjp = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const sourceUrl = 'https://www.burbujapolitica.com/2026/08/san-jose-del-palmar-epicentro-terremoto-balance.html'
  const sourceOrg = 'Burbuja Política, citando a la Gobernadora del Chocó (Nubia Carolina Córdoba Curi) y al Alcalde de San José del Palmar (León Fabio Marín Moncada)'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 3 } })
    console.log('Created Source: burbuja_politica_sjp_0813')
  }

  const tollDefs = [
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 0,
      asOf: '2026-08-13T12:00:00-05:00',
      notes: 'Cero muertes confirmadas en la zona URBANA de San José del Palmar a la fecha; las zonas rurales del municipio seguían en proceso de verificación por el difícil acceso (ver también el hallazgo de la pasada 31b: 45+ derrumbes seguían aislando comunidades rurales al 14 de agosto). No asumir que esto significa cero muertes en todo el municipio.',
    },
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 400,
      asOf: '2026-08-13T12:00:00-05:00',
      notes: 'Aproximadamente 400 viviendas afectadas, según balance conjunto de la Gobernación del Chocó y la Alcaldía de San José del Palmar.',
    },
    {
      metric: 'EDIFICIOS_COLAPSADOS' as const,
      value: 20,
      asOf: '2026-08-13T12:00:00-05:00',
      notes: 'Al menos 20 estructuras colapsadas en el municipio, per el mismo balance. Población municipal aproximada: 5,800 habitantes; más de 130 réplicas locales registradas a la fecha (esta última cifra no tiene una métrica TollMetric correspondiente y no se registra aquí).',
    },
  ]

  let created = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: sjp.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: sjp.id,
        metric: t.metric,
        value: t.value,
        sourceId: src.id,
        tier: 3,
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
