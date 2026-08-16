/**
 * Rollout of the per-city aid-point geocoding formula (see
 * geocode-pereira-aidpoints.ts, 2026-08-15/16 pilot) to every OTHER tracked
 * municipio. Same three-strategy approach (freeform -> structured street=
 * -> bare landmark name), same distance-based rejection, same
 * duplicate-coordinate revert pass -- just parameterized per city instead
 * of hardcoded to Pereira, and run across all of them in one sequential
 * pass (still 1 request/second total, shared across cities, to stay within
 * Nominatim's usage policy).
 *
 * Only points with a non-null `address` and still-null `lat`/`lng` are
 * attempted. Run once via `npx tsx prisma/geocode-all-cities-aidpoints.ts`,
 * NOT part of the repeatable prisma/seed.ts. Safe to re-run --
 * EXCEPT for one real false-positive class found on a 2026-08-16 re-run:
 * the duplicate-coordinate revert can't tell "generic city-center fallback
 * shared by unrelated venues" (a real bad match, correctly reverted) apart
 * from "two different orgs that genuinely share one building" (e.g. a
 * Cruz Roja blood bank and "Hemocentro del Café" being the same physical
 * hemocentro; a whole sports complex's multiple coliseums sharing one
 * manually-verified landmark coordinate) -- it reverted several legitimate
 * matches this way, including ones set by a *manual* landmark search, not
 * even a Nominatim guess. Those had to be restored by hand afterward. If
 * re-running this after manually assigning a shared coordinate to several
 * related points on purpose, expect this pass to revert them again --
 * check the log for REVERTED entries you know are actually correct.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'SOSColombia/1.0 (https://www.soscolombia.xyz; earthquake aid-point mapping)'
const MAX_DISTANCE_KM = 20
const REQUEST_DELAY_MS = 1100

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

type GeocodeResult = { lat: number; lng: number; displayName: string }

async function geocodeFreeform(query: string): Promise<GeocodeResult | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=co`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  if (results.length === 0) return null
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), displayName: results[0].display_name }
}

async function geocodeStructured(street: string, city: string): Promise<GeocodeResult | null> {
  const url = `${NOMINATIM_URL}?street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&country=Colombia&format=json&limit=1&countrycodes=co`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  if (results.length === 0) return null
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), displayName: results[0].display_name }
}

const STREET_PATTERN = /(?:Cra|Carrera|Cl|Calle|Av|Avenida|Tv|Transversal|Diagonal)\.?\s*\d+/i

function extractStreet(address: string): string | null {
  const match = address.match(/^[^,]+/)
  if (!match) return null
  const first = match[0].trim()
  return STREET_PATTERN.test(first) ? first : null
}

function extractLandmarkName(name: string, address: string): string {
  let candidate = address
    .replace(/\([^)]*\)/g, '')
    .split(/,| - | cerca a| a la altura de| sirve también a| junto al| al lado de| entre /i)[0]
    .trim()
  if (STREET_PATTERN.test(candidate) || /^(mz|manzana|caseta)/i.test(candidate)) {
    candidate = name.replace(/^(Albergue|CAFE|Centro de Acopio -?)\s*/i, '').split(/ - |\(/)[0].trim()
  }
  return candidate
}

async function attemptGeocode(name: string, address: string, cityName: string, deptName: string): Promise<GeocodeResult | null> {
  const strategies: Array<() => Promise<GeocodeResult | null>> = [
    () => geocodeFreeform(`${address}, ${cityName}, ${deptName}, Colombia`),
    async () => {
      const street = extractStreet(address)
      return street ? geocodeStructured(street, cityName) : null
    },
    () => geocodeFreeform(`${extractLandmarkName(name, address)}, ${cityName}, Colombia`),
  ]

  for (const strategy of strategies) {
    const result = await strategy()
    await sleep(REQUEST_DELAY_MS)
    if (result) return result
  }
  return null
}

async function geocodeCity(
  municipioId: string,
  cityName: string,
  deptName: string,
  centroidLat: number,
  centroidLng: number,
  otherCityNames: string[],
) {
  const points = await prisma.aidPoint.findMany({
    where: { municipioId, address: { not: null }, lat: null, lng: null },
  })

  console.log(`\n=== ${cityName} (${points.length} points to geocode) ===`)

  let geocoded = 0
  let rejected = 0
  let notFound = 0
  let skipped = 0

  for (const point of points) {
    // Some AidPoints are collection points physically located in a
    // DIFFERENT city that routes supplies TO this one (donation drives in
    // Cali/Bogotá for a smaller affected town, etc.) -- their address is
    // genuinely elsewhere, so appending this city's name/centroid check
    // would be wrong. Caught for real once: an address in Cali (Carrera 5
    // #3-76, Barrio San Antonio) matched a bogus point 8.55km from San José
    // del Palmar's centroid purely by chance, close enough to slip past the
    // distance check. Skip these outright rather than risk it again.
    const address = point.address as string
    const mentionsOtherCity = otherCityNames.some((name) => address.includes(name))
    if (mentionsOtherCity) {
      console.log(`SKIPPED (address references a different city): ${point.name} -- "${address}"`)
      skipped++
      continue
    }

    const result = await attemptGeocode(point.name, address, cityName, deptName)

    if (!result) {
      console.log(`NOT FOUND: ${point.name} -- "${point.address}"`)
      notFound++
      continue
    }

    const distance = haversineKm(centroidLat, centroidLng, result.lat, result.lng)
    if (distance > MAX_DISTANCE_KM) {
      console.log(`REJECTED (${distance.toFixed(1)}km): ${point.name} -- matched "${result.displayName}"`)
      rejected++
      continue
    }

    await prisma.aidPoint.update({ where: { id: point.id }, data: { lat: result.lat, lng: result.lng } })
    console.log(`OK (${distance.toFixed(2)}km): ${point.name} -> ${result.lat}, ${result.lng}`)
    geocoded++
  }

  // Duplicate-coordinate revert, skipping same-name groups (see
  // geocode-pereira-aidpoints.ts for why).
  const geocodedPoints = await prisma.aidPoint.findMany({ where: { municipioId, lat: { not: null } } })
  const byCoord = new Map<string, typeof geocodedPoints>()
  for (const p of geocodedPoints) {
    const key = `${p.lat},${p.lng}`
    byCoord.set(key, [...(byCoord.get(key) ?? []), p])
  }
  let reverted = 0
  for (const group of byCoord.values()) {
    if (group.length <= 1) continue
    const distinctNames = new Set(group.map((p) => p.name.toLowerCase().replace(/\s+/g, ' ').trim()))
    if (distinctNames.size <= 1) continue
    for (const p of group) {
      await prisma.aidPoint.update({ where: { id: p.id }, data: { lat: null, lng: null } })
      console.log(`REVERTED (duplicate coordinate, unrelated venues): ${p.name}`)
      reverted++
    }
  }

  console.log(
    `${cityName}: ${geocoded} geocoded, ${rejected} rejected, ${notFound} not found, ${skipped} skipped (other city), ${reverted} reverted`,
  )
  return { geocoded, rejected, notFound, skipped, reverted }
}

async function main() {
  const municipios = await prisma.municipio.findMany({
    where: { NOT: { divipolaCode: '66001' } }, // Pereira already done
    include: { department: true },
    orderBy: { name: 'asc' },
  })
  const allMunicipios = await prisma.municipio.findMany()
  const allCityNames = allMunicipios.map((m) => m.name)

  const totals = { geocoded: 0, rejected: 0, notFound: 0, skipped: 0, reverted: 0 }

  for (const m of municipios) {
    if (m.lat == null || m.lng == null) {
      console.log(`\n=== ${m.name} skipped -- no municipio centroid to validate distance against ===`)
      continue
    }
    const otherCityNames = allCityNames.filter((name) => name !== m.name)
    const result = await geocodeCity(m.id, m.name, m.department.name, m.lat, m.lng, otherCityNames)
    totals.geocoded += result.geocoded
    totals.skipped += result.skipped
    totals.rejected += result.rejected
    totals.notFound += result.notFound
    totals.reverted += result.reverted
  }

  console.log(
    `\n=== TOTAL: ${totals.geocoded} geocoded, ${totals.rejected} rejected, ${totals.notFound} not found, ${totals.skipped} skipped (other city), ${totals.reverted} reverted ===`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
