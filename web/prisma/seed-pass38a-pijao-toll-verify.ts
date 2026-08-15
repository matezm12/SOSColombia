/**
 * Pass 38a (2026-08-15) — verification pass on Pijao's earthquake toll.
 * The second deep-research pass found the 73-predios/7-colapsos figure
 * directly on the Alcaldía de Pijao's own Instagram (the mayor speaking
 * on camera, repeated verbatim across 3 posts), upgrading it from a
 * tier-3 third-party-tracker citation (pass 37b) to a tier-1/2 primary
 * source. Logged as a new row rather than editing the old one, per this
 * project's append-only toll discipline — the two entries corroborate
 * each other rather than one superseding the other. Also adds a new
 * figure found only via the primary source: the Alcaldía's own explicit
 * statement that no deaths were reported in the municipality.
 * Run once via `npx tsx prisma/seed-pass38a-pijao-toll-verify.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  const sourceUrl = 'https://www.instagram.com/p/Db61mFEsNvQ/'
  const sourceOrg = 'Alcaldía de Pijao (alcalde John Jairo Restrepo Gallego), declaración en video en su cuenta oficial de Instagram'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 2 } })
    console.log('Created Source: alcaldia_pijao_ig_primary')
  }

  const tollDefs = [
    {
      metric: 'EDIFICIOS_COLAPSADOS' as const,
      value: 7,
      asOf: '2026-08-12T12:00:00-05:00',
      tier: 2,
      notes: 'Confirmación de fuente primaria: el alcalde John Jairo Restrepo Gallego declara en video, en la cuenta oficial de la Alcaldía, "el balance es de 73 predios afectados, de los cuales 48 corresponden al área urbana y 25 al sector rural. De estos, 7 presentan colapso total y son inhabitables." Corrobora (no reemplaza) la fila ya registrada en la pasada 37b, que citaba la misma cifra vía un rastreador de terceros (mapadelterremoto.com) - esta fila sube la confianza de esa cifra de tier 3 a tier 2, con fecha ajustada a la declaración original del alcalde (~12 de agosto) en vez de la fecha estimada del rastreador.',
    },
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 0,
      asOf: '2026-08-11T12:00:00-05:00',
      tier: 2,
      notes: 'Declaración inicial de la Alcaldía tras el sismo (11 de agosto): "no se reportan pérdidas humanas en el municipio... únicamente se han identificado algunas afectaciones menores en estructuras... interrupciones en el servicio de energía eléctrica y en las comunicaciones." Cifra específica de Pijao, no departamental. Corroborada indirectamente: el único fallecido por el sismo encontrado en cobertura de Quindío se ubicó en el corredor vial entre Montenegro y Quimbaya, no en Pijao.',
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
