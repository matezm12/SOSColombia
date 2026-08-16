/**
 * Pilot geocoding pass for the per-city aid-point map (2026-08-15) -- see
 * wiki/16-deferred-queue.md for the feature this backfills data for.
 * Geocodes Pereira's AidPoints (most addresses of any tracked city) via OSM
 * Nominatim, the same provider this project already trusts for municipio
 * centroids (see backfill-dosquebradas-coords.ts). Only points with a
 * non-null `address` and still-null `lat`/`lng` are attempted.
 *
 * Never blind-trusts a geocode result: rejects any match further than 15km
 * from Pereira's own centroid (a wrong disambiguation -- e.g. a same-named
 * street in another city -- lands far outside that radius) rather than
 * writing a plausible-looking but wrong coordinate. Also runs a post-pass
 * reverting any coordinate shared by 2+ distinct aid points back to null --
 * the distance check alone let 4 unrelated venues through at 11.13km, all
 * landing on the exact same point (a generic/ambiguous-query fallback
 * match, not a real per-address result). Found by manually auditing the
 * first run's output; folded back in here so later cities don't ship it.
 *
 * Respects Nominatim's usage policy: max 1 request/second, descriptive
 * User-Agent. Run once via `npx tsx prisma/geocode-pereira-aidpoints.ts`,
 * NOT part of the repeatable prisma/seed.ts. Safe to re-run -- it only
 * targets rows still missing coordinates.
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

async function geocode(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=co`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
  if (results.length === 0) return null
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), displayName: results[0].display_name }
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
    const query = `${point.address}, Pereira, Risaralda, Colombia`
    const result = await geocode(query)
    await sleep(REQUEST_DELAY_MS)

    if (!result) {
      console.log(`NOT FOUND: ${point.name} -- "${query}"`)
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
    console.log(`OK (${distance.toFixed(2)}km): ${point.name} -> ${result.lat}, ${result.lng}`)
    geocoded++
  }

  // Duplicate-coordinate pass: two distinct venues landing on the exact same
  // point is a strong signal of a generic/ambiguous-query match, not a real
  // per-address result -- revert those rather than ship a wrong pin.
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
    for (const p of group) {
      await prisma.aidPoint.update({ where: { id: p.id }, data: { lat: null, lng: null } })
      console.log(`REVERTED (duplicate coordinate with ${group.length - 1} other point(s)): ${p.name}`)
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
