/**
 * Pass 37b (2026-08-15) — Pijao's own earthquake-specific damage figures,
 * previously undocumented in national/departmental coverage (national
 * consolidated reports and the Gobernación del Quindío's own 17,000+
 * edificaciones tally both name Quimbaya as Quindío's worst-hit town and
 * don't break out Pijao at all). Sourced to Mayor John Jairo Restrepo
 * Gallego's Aug 11 preliminary balance, repeated consistently across the
 * Alcaldía's own Instagram posts and independently relayed by
 * mapadelterremoto.com (a crowdsourced tracker, itself citing the same
 * Alcaldía balance — its own disclaimer notes it's a working log, not an
 * official source, so this is logged at tier 3, not tier 1-2).
 * Run once via `npx tsx prisma/seed-pass37b-pijao-toll-update.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  const sourceUrl = 'https://www.mapadelterremoto.com/municipio/pijao'
  const sourceOrg = 'mapadelterremoto.com, citando el balance preliminar del 11 de agosto del Alcalde John Jairo Restrepo Gallego'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 3 } })
    console.log('Created Source: mapadelterremoto_pijao')
  }

  const tollDefs = [
    {
      metric: 'EDIFICIOS_COLAPSADOS' as const,
      value: 7,
      asOf: '2026-08-11T18:00:00-05:00',
      notes: 'De un total de 73 predios afectados por el sismo (48 urbanos, 25 rurales), 7 sufrieron colapso total y fueron declarados inhabitables. La Iglesia de Pijao sufrió daño severo. El acueducto municipal (EPQ) reportó funcionamiento normal, sin afectación. Esta cifra NO forma parte del reporte nacional consolidado de UNGRD ni del balance departamental de la Gobernación del Quindío (que nombra a Quimbaya como el municipio más afectado sin desglosar Pijao) - existe solo por el autoreporte de la propia Alcaldía. Tratar como sembrado institucionalmente pero aún no validado a nivel nacional/EDAN.',
    },
  ]

  let created = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: pijao.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: pijao.id,
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
