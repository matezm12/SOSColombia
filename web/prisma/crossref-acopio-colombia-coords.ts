/**
 * Coordinate cross-reference pass (2026-08-16) -- follow-up to the geocoding
 * rollout, going to the actual sources instead of re-guessing from address
 * text. emergency-rosy.vercel.app ("Acopio Colombia") is itself a live map
 * app: its homepage embeds every center's own asserted lat/lng directly in
 * the Next.js page payload, tagged with a `location_precision` of "exact",
 * "approximate", or "municipality" (a generic city-centroid fallback, not a
 * real point -- explicitly excluded here, same judgment call this project
 * already made when reverting Nominatim's own generic-fallback matches).
 *
 * Fuzzy-matches Acopio Colombia's centers (name, normalized) against our
 * AidPoints in the same city, and where matched, PREFERS the source's own
 * coordinate over whatever this project's Nominatim geocode already had --
 * it's the primary source these addresses originated from in the first
 * place, more authoritative than a downstream text-address guess. This
 * both filled in points Nominatim couldn't resolve at all (e.g. "Complejo
 * Bodeguero Alpaca", "CAFE Perla del Otún", "Centro de eventos Expofuturo")
 * and corrected a few where Nominatim's guess was off by 1-4km (e.g.
 * "Antigua Licorera del Valle", "Casa Loma").
 *
 * One additional manual fix folded in here: S.C.A.R.E.'s Popayán office
 * (confirmed via https://scare.org.co/noticias/juntos-somos-colombia-scare-
 * fepasde/, "Carrera 9 No 18N231 oficina 205 edificio terrazas del Norte")
 * turned out to be the exact same building as an "ACSC Popayán" entry in
 * Acopio Colombia's own dataset -- different org name, same office -- which
 * the automated name-fuzzy-match legitimately couldn't have caught on its
 * own. Applied by hand after independently confirming the address match.
 *
 * Run once via `npx tsx prisma/crossref-acopio-colombia-coords.ts`, NOT
 * part of the repeatable prisma/seed.ts. Safe to re-run.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const OUR_CITIES = [
  'Pereira', 'Cali', 'Manizales', 'Armenia', 'Buenaventura',
  'Quibdo', 'Popayan', 'Ibague', 'Dosquebradas', 'San Jose del Palmar', 'Pijao',
]

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

type AcopioCenter = {
  name: string
  municipality: string
  lat: number
  lng: number
  precision: string
}

async function fetchAcopioCenters(): Promise<AcopioCenter[]> {
  const res = await fetch('https://emergency-rosy.vercel.app/')
  const html = await res.text()
  // Centers are embedded in the page's Next.js RSC payload as escaped JSON
  // fragments -- extracted via regex rather than a full parse since the
  // payload isn't valid standalone JSON (streaming format with $-refs).
  const re =
    /\\"id\\":\\"([a-f0-9-]+)\\".{0,50}?\\"name\\":\\"([^"]*?)\\".{0,400}?\\"municipality\\":\\"([^"]*?)\\".{0,300}?\\"address\\":\\"([^"]*?)\\",\\"latitude\\":(-?\d+\.\d+),\\"longitude\\":(-?\d+\.\d+),\\"location_precision\\":\\"([a-z]+)\\"/g
  const results: AcopioCenter[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    results.push({ name: m[2], municipality: m[3], lat: parseFloat(m[5]), lng: parseFloat(m[6]), precision: m[7] })
  }
  return results
}

async function main() {
  const centers = await fetchAcopioCenters()
  console.log(`Fetched ${centers.length} centers from Acopio Colombia`)

  const relevant = centers.filter(
    (c) => c.precision !== 'municipality' && OUR_CITIES.some((city) => norm(c.municipality).includes(norm(city))),
  )

  const aidPoints = await prisma.aidPoint.findMany({ include: { municipio: true } })

  let updated = 0
  for (const c of relevant) {
    const cn = norm(c.name)
    const candidates = aidPoints.filter(
      (a) => norm(a.municipio.name).includes(norm(c.municipality).split(' ')[0]) || norm(c.municipality).includes(norm(a.municipio.name)),
    )
    for (const a of candidates) {
      const an = norm(a.name)
      if (an === cn || an.includes(cn) || cn.includes(an)) {
        await prisma.aidPoint.update({ where: { id: a.id }, data: { lat: c.lat, lng: c.lng } })
        console.log(`Updated: ${a.name} (${a.municipio.name}) -> ${c.lat}, ${c.lng} [precision=${c.precision}]`)
        updated++
      }
    }
  }

  // Manual fix: S.C.A.R.E. Popayán, confirmed via scare.org.co to share an
  // address with Acopio Colombia's "ACSC Popayán" entry (see comment above).
  const scare = await prisma.aidPoint.findFirst({
    where: { name: { contains: 'S.C.A.R.E.' }, municipio: { name: 'Popayán' } },
  })
  if (scare) {
    await prisma.aidPoint.update({ where: { id: scare.id }, data: { lat: 2.478589, lng: -76.560104 } })
    console.log(`Updated: ${scare.name} (Popayán) -> 2.478589, -76.560104 [manual cross-reference]`)
    updated++
  }

  console.log(`\nTotal updated: ${updated}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
