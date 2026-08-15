/**
 * One-off backfill: Dosquebradas (DIVIPOLA 66170) was created without
 * lat/lng during the allied-resources seed pass (2026-08-14), which meant it
 * was silently excluded from /mapa (MapaPage only queries municipios with
 * both coordinates set). Coordinates cross-checked against two independent
 * sources (2026-08-15):
 *   - OSM Nominatim: 4.8339551, -75.6713013
 *   - Wikipedia (es) infobox: 4°50'10"N 75°40'34"O = 4.8361111, -75.6761111
 * Close agreement (~0.3km apart); using the Wikipedia infobox value, rounded
 * to 4 decimals to match this project's existing municipio-coordinate
 * precision (e.g. Pereira: 4.8087, -75.6906).
 *
 * Run once via `npx tsx prisma/backfill-dosquebradas-coords.ts`, NOT part of
 * the repeatable prisma/seed.ts.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.municipio.updateMany({
    where: { divipolaCode: '66170' },
    data: { lat: 4.8361, lng: -75.6761 },
  })
  console.log(`Updated ${result.count} municipio row(s)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
