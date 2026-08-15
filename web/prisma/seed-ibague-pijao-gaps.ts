/**
 * One-off loader closing two data gaps flagged during a /mapa audit
 * (2026-08-15): Ibagué had zero TollRecords (no casualty/damage figures at
 * all) and Pijao had zero AidPoints. Checked the DB right before running
 * this and found the concurrent session had already added 8 real AidPoints
 * for Ibagué in the minutes before this ran -- that half of the original gap
 * is already closed, so this script only adds what's still missing:
 * Ibagué's toll figures, and one real aid point for Pijao.
 *
 * Run once via `npx tsx prisma/seed-ibague-pijao-gaps.ts`, NOT part of the
 * repeatable prisma/seed.ts.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ibague = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '73001' } })
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  // ── Ibagué toll figures — Alcaldía de Ibagué's preliminary balance
  // (alcaldesa Johana Aranda), reported via Pulzo 2026-08-11. ──────────────
  const pulzoUrl =
    'https://www.pulzo.com/nacion/temor-ibague-48-familias-evacuadas-danos-que-dejo-terremoto-PP5271359'
  let pulzoSource = await prisma.source.findFirst({ where: { url: pulzoUrl } })
  if (!pulzoSource) {
    pulzoSource = await prisma.source.create({
      data: {
        url: pulzoUrl,
        org: 'Alcaldía de Ibagué (alcaldesa Johana Aranda), vía Pulzo',
        tier: 3,
        status: 'LIVE',
        lastFetchedAt: new Date(),
      },
    })
  }

  const asOf = new Date('2026-08-11T09:59:00-05:00')
  const ibagueTollDefs = [
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 0,
      notes: 'Balance preliminar de la Alcaldía de Ibagué tras el sismo: sin fallecidos reportados en el municipio.',
    },
    {
      metric: 'INJURED' as const,
      value: 0,
      notes: 'Mismo balance preliminar de la Alcaldía de Ibagué: sin heridos reportados en el municipio.',
    },
    {
      metric: 'CENTROS_SALUD_AFECTADOS' as const,
      value: 4,
      notes: 'Balance preliminar de la Alcaldía de Ibagué: 4 instituciones prestadoras de servicios de salud (IPS) afectadas.',
    },
    {
      metric: 'CENTROS_EDUCATIVOS_AFECTADOS' as const,
      value: 4,
      notes: 'Balance preliminar de la Alcaldía de Ibagué: 4 instituciones educativas afectadas.',
    },
    {
      metric: 'DAMNIFICADOS_FAMILIAS' as const,
      value: 48,
      unit: 'familias',
      notes:
        '48 familias evacuadas del conjunto residencial Alta Vista por daños del sismo -- no es un total consolidado del municipio, es el único conteo de familias afectadas reportado hasta ahora. El mismo balance mencionó 17 edificaciones afectadas en general (sin desglose colapsadas/averiadas), cifra que no se registra aquí por no encajar en ningún TollMetric existente sin sobre-representar severidad.',
    },
  ]

  for (const def of ibagueTollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: ibague.id, metric: def.metric, sourceId: pulzoSource.id },
    })
    if (existing) {
      console.log(`Skipping Ibagué ${def.metric} — already seeded`)
      continue
    }
    await prisma.tollRecord.create({
      data: {
        municipioId: ibague.id,
        metric: def.metric,
        value: def.value,
        unit: 'unit' in def ? def.unit : null,
        sourceId: pulzoSource.id,
        tier: 3,
        asOf,
        notes: def.notes,
      },
    })
    console.log(`Created Ibagué TollRecord: ${def.metric}`)
  }

  // ── Pijao aid point — ORIQUIN's reception/distribution point at the
  // Tatadrúa indigenous reserve, reported by Servindi 2026-08-14. ─────────
  const servindiUrl = 'https://www.servindi.org/14/08/2026/apoya-los-afectados-por-el-terremoto-de-forma-directa'
  let servindiSource = await prisma.source.findFirst({ where: { url: servindiUrl } })
  if (!servindiSource) {
    servindiSource = await prisma.source.create({
      data: {
        url: servindiUrl,
        org: 'Servindi (Servicios de Comunicación Intercultural), citando a ORIQUIN',
        tier: 4,
        status: 'LIVE',
        lastFetchedAt: new Date(),
      },
    })
  }

  const oriquinExisting = await prisma.aidPoint.findFirst({
    where: { municipioId: pijao.id, name: { contains: 'ORIQUIN' } },
  })
  if (!oriquinExisting) {
    await prisma.aidPoint.create({
      data: {
        municipioId: pijao.id,
        kind: 'ACOPIO',
        name: 'ORIQUIN — Punto de recepción y distribución, resguardo indígena de Tatadrúa',
        address: 'Resguardo indígena de Tatadrúa, Pijao, Quindío',
        phone: '321 591 6223',
        status: 'ACTIVE',
        accessRestriction: 'Distribuye a 6 resguardos indígenas de Quindío -- contacto: Jorge Ramírez, consejero mayor.',
        sourceId: servindiSource.id,
        lastVerifiedAt: new Date('2026-08-14'),
      },
    })
    console.log('Created Pijao AidPoint: ORIQUIN')
  } else {
    console.log('Skipping Pijao ORIQUIN aid point — already seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
