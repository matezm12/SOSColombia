/**
 * Pilot geocoding pass for the per-city aid-point map (2026-08-15, extended
 * 2026-08-16) -- see wiki/16-deferred-queue.md for the feature this backfills
 * data for. Geocodes Pereira's AidPoints (most addresses of any tracked
 * city) via OSM Nominatim, the same provider this project already trusts for
 * municipio centroids (see backfill-dosquebradas-coords.ts). Only points
 * with a non-null `address` and still-null `lat`/`lng` are attempted.
 *
 * A first pass (2026-08-15, freeform "{address}, Pereira, Risaralda,
 * Colombia" query only) geocoded 16/54 -- most of the misses are Colombian
 * addresses with "Bis"/"#" tokens Nominatim's free-text parser chokes on, or
 * bare landmark names ("Plaza de Ferias", "Parque Kennedy") that resolve far
 * better as a name search than buried in a full descriptive sentence. This
 * version tries three query strategies per point, in order, and keeps the
 * first one that lands within MAX_DISTANCE_KM of Pereira's centroid:
 *   1. Freeform original address (same as before -- catches anything new).
 *   2. Structured query (Nominatim's `street=` param) for addresses that
 *      look like a real Cra/Calle/Av/Tv + number pattern.
 *   3. Bare venue/landmark name only, stripped of street-address noise --
 *      catches named POIs (parks, plazas, stadiums, malls, universities)
 *      that exist in OSM but don't match on the full descriptive sentence.
 *
 * Never blind-trusts a geocode result: rejects any match further than 15km
 * from Pereira's own centroid. Also runs a post-pass reverting any
 * coordinate shared by 2+ points with genuinely DIFFERENT names back to
 * null -- a shared coordinate between differently-named venues is a strong
 * signal of a generic/ambiguous-query fallback match, not a real result.
 * (Points that happen to share a name -- e.g. duplicate rows from a
 * concurrent research pass -- are allowed to share a coordinate; that's
 * expected, not a red flag.)
 *
 * Run once via `npx tsx prisma/geocode-pereira-aidpoints.ts`, NOT part of
 * the repeatable prisma/seed.ts. Safe to re-run -- it only targets rows
 * still missing coordinates.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'SOSColombia/1.0 (https://www.soscolombia.xyz; earthquake aid-point mapping)'
const MAX_DISTANCE_KM = 15
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

// Colombian street-address pattern: Cra/Calle/Av/Tv/Diagonal + number, with
// optional "Bis"/"#"/letter-suffix noise Nominatim's freeform parser trips on.
const STREET_PATTERN = /(?:Cra|Carrera|Cl|Calle|Av|Avenida|Tv|Transversal|Diagonal)\.?\s*\d+/i

function extractStreet(address: string): string | null {
  const match = address.match(/^[^,]+/)
  if (!match) return null
  const first = match[0].trim()
  return STREET_PATTERN.test(first) ? first : null
}

// Strips relative/descriptive clauses ("cerca a", "a la altura de", "sirve
// también a", parentheticals) to leave just a bare landmark name worth
// trying as a standalone Nominatim search.
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

async function attemptGeocode(name: string, address: string): Promise<GeocodeResult | null> {
  const strategies: Array<() => Promise<GeocodeResult | null>> = [
    () => geocodeFreeform(`${address}, Pereira, Risaralda, Colombia`),
    async () => {
      const street = extractStreet(address)
      return street ? geocodeStructured(street, 'Pereira') : null
    },
    () => geocodeFreeform(`${extractLandmarkName(name, address)}, Pereira, Colombia`),
  ]

  for (const strategy of strategies) {
    const result = await strategy()
    await sleep(REQUEST_DELAY_MS)
    if (result) return result
  }
  return null
}

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const points = await prisma.aidPoint.findMany({
    where: { municipioId: pereira.id, address: { not: null }, lat: null, lng: null },
  })

  console.log(`${points.length} Pereira aid points to geocode`)

  let geocoded = 0
  let rejected = 0
  let notFound = 0

  for (const point of points) {
    const result = await attemptGeocode(point.name, point.address as string)

    if (!result) {
      console.log(`NOT FOUND (all strategies): ${point.name} -- "${point.address}"`)
      notFound++
      continue
    }

    const distance = haversineKm(pereira.lat as number, pereira.lng as number, result.lat, result.lng)
    if (distance > MAX_DISTANCE_KM) {
      console.log(
        `REJECTED (${distance.toFixed(1)}km from Pereira): ${point.name} -- matched "${result.displayName}"`,
      )
      rejected++
      continue
    }

    await prisma.aidPoint.update({
      where: { id: point.id },
      data: { lat: result.lat, lng: result.lng },
    })
    console.log(`OK (${distance.toFixed(2)}km): ${point.name} -> ${result.lat}, ${result.lng} ("${result.displayName}")`)
    geocoded++
  }

  // Duplicate-coordinate pass, skipping groups that share a name (expected
  // when the same real place got seeded twice, not a bad-match signal).
  const geocodedPoints = await prisma.aidPoint.findMany({
    where: { municipioId: pereira.id, lat: { not: null } },
  })
  const byCoord = new Map<string, typeof geocodedPoints>()
  for (const p of geocodedPoints) {
    const key = `${p.lat},${p.lng}`
    byCoord.set(key, [...(byCoord.get(key) ?? []), p])
  }
  let reverted = 0
  for (const group of byCoord.values()) {
    if (group.length <= 1) continue
    const distinctNames = new Set(group.map((p) => p.name.toLowerCase().replace(/\s+/g, ' ').trim()))
    if (distinctNames.size <= 1) continue // same-name duplicates are fine
    for (const p of group) {
      await prisma.aidPoint.update({ where: { id: p.id }, data: { lat: null, lng: null } })
      console.log(`REVERTED (duplicate coordinate shared by unrelated venues): ${p.name}`)
      reverted++
    }
  }

  console.log(
    `\nDone: ${geocoded} geocoded, ${rejected} rejected (too far), ${notFound} not found, ${reverted} reverted (duplicate coordinate)`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
