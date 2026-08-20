/**
 * One-off: replaces every live occurrence of the generic
 * "Detección automática — revisar" / "Detección automática (revisada por
 * moderación)" placeholder with a real, derived source name, per direct user
 * request 2026-08-20. Historical rows predate sourceOrg being reliably set at
 * detection time (fixed in gov-news-check/route.ts, discover.py,
 * api/cron/discovery/route.ts) and predate the fallback in
 * admin/moderacion/actions.ts + admin/boletines/actions.ts deriving a name
 * from the URL instead of using the generic string.
 *
 * Run once via `npx tsx prisma/backfill-source-names.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { deriveSourceName } from '../src/lib/sourceName'
import { AID_KIND_LABEL } from '../src/lib/labels'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PLACEHOLDER_NAME = 'Detección automática — revisar'
const PLACEHOLDER_ORG_PATTERNS = [
  'Detección automática (revisada por moderación)',
  'Detección automática — revisar',
]

async function main() {
  // 1. Source.org rows carrying the generic placeholder.
  const sources = await prisma.source.findMany({
    where: { org: { in: PLACEHOLDER_ORG_PATTERNS } },
  })
  let sourcesFixed = 0
  for (const s of sources) {
    const derived = deriveSourceName(s.url)
    if (!derived) continue
    await prisma.source.update({ where: { id: s.id }, data: { org: derived } })
    sourcesFixed++
  }
  console.log(`Source: ${sourcesFixed}/${sources.length} renamed via URL (rest left — no derivable name)`)

  // 2. PendingAidPoint.name rows carrying the generic placeholder (any status).
  const pendingAid = await prisma.pendingAidPoint.findMany({
    where: { name: PLACEHOLDER_NAME },
    include: { municipio: { select: { name: true } } },
  })
  let pendingFixed = 0
  let aidPointsFixed = 0
  for (const p of pendingAid) {
    const kindLabel = AID_KIND_LABEL[p.kind] ?? p.kind
    const newName =
      p.sourceOrg ?? deriveSourceName(p.sourceUrl) ?? `${kindLabel} en ${p.municipio.name} (sin nombre confirmado)`
    if (newName === p.name) continue

    await prisma.pendingAidPoint.update({ where: { id: p.id }, data: { name: newName } })
    pendingFixed++

    if (p.promotedAidPointId) {
      await prisma.aidPoint.update({ where: { id: p.promotedAidPointId }, data: { name: newName } })
      aidPointsFixed++
    }
  }
  console.log(`PendingAidPoint: ${pendingFixed}/${pendingAid.length} renamed (${aidPointsFixed} promoted AidPoint rows updated too)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
