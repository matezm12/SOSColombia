/**
 * Third geocoding pass for Pereira aid points (2026-08-16), covering
 * addresses the automated multi-strategy pass (geocode-pereira-aidpoints.ts)
 * still couldn't resolve. Each entry here was independently researched via
 * web search and verified against a real, citable source -- not guessed:
 *
 * - Catedral Santísimo Sacramento ACC: official parish address (Calle 21
 *   No 7-37) confirmed via catolia.com's parish directory and corroborated
 *   by Diócesis de Pereira's own site.
 * - CAFE Kennedy (both duplicate rows -- see wiki, a concurrent research
 *   pass seeded this one twice): "Parque Kennedy" itself has a published
 *   coordinate (4°48'30.28"N 75°40'22.66"W) from a barrio history article,
 *   used directly instead of re-geocoding.
 * - Albergue Plaza de Ferias (Cerritos): real venue, confirmed via
 *   pereira.gov.co's own announcement -- it's in the Cerritos corregimiento,
 *   which is legitimately >15km from the urban centroid (near the airport).
 *   The original pass's Nominatim match was correct; only the distance
 *   threshold rejected it. Manually allowed through here since the match
 *   itself was independently verified, not just distance-checked.
 *
 * Explicitly NOT resolved and left off the map -- researched but rejected:
 * - Óptica Bustamante: search surfaced the "Óptica Bustamante" retail chain
 *   (Carrera 17 10-37), but the DB's actual entry describes a home-based
 *   volunteer offering repairs from a residence in the Jardín neighborhood
 *   ("manzana 14 casa 21") -- a different, unrelated address. Using the
 *   chain's address would misattribute a private volunteer's location to a
 *   commercial business.
 * - PPAA - Asociación de Protección y Bienestar Animal: search surfaced
 *   Pereira's municipal "Dirección de Protección y Bienestar Animal"
 *   office (Carrera 7 No. 18-55) -- a government department with a
 *   similar name, not the actual PPAA organization the DB entry names.
 * - Clínica Veterinaria Visión de las Américas: independently confirmed via
 *   uam.edu.co (the university's own site) that the DB's existing address
 *   (Carrera 13 #9-67, Av. Circunvalar) is already correct -- it's real,
 *   just not present as a geocodable point in Nominatim's OSM data. No
 *   better address exists to substitute; left off the map rather than
 *   forcing a street-level approximation for a specific building.
 *
 * Run once via `npx tsx prisma/geocode-pereira-manual-verified.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'SOSColombia/1.0 (https://www.soscolombia.xyz; earthquake aid-point mapping)'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=co`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const results = (await res.json()) as Array<{ lat: string; lon: string }>
  if (results.length === 0) return null
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
}

// DMS -> decimal, for the one point using a cited coordinate instead of a re-geocode.
function dms(deg: number, min: number, sec: number, negative: boolean): number {
  const value = deg + min / 60 + sec / 3600
  return negative ? -value : value
}

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })

  // Catedral: geocode the verified real address.
  const catedral = await prisma.aidPoint.findFirst({
    where: { municipioId: pereira.id, name: 'Catedral Santísimo Sacramento ACC', lat: null },
  })
  if (catedral) {
    const result = await geocode('Calle 21 # 7-37, Pereira, Risaralda, Colombia')
    await sleep(1100)
    if (result) {
      await prisma.aidPoint.update({ where: { id: catedral.id }, data: { lat: result.lat, lng: result.lng } })
      console.log(`OK: Catedral Santísimo Sacramento ACC -> ${result.lat}, ${result.lng}`)
    } else {
      console.log('STILL NOT FOUND: Catedral Santísimo Sacramento ACC (verified address failed to geocode)')
    }
  }

  // CAFE Kennedy (both rows): use Parque Kennedy's cited coordinate directly.
  const kennedyLat = dms(4, 48, 30.28, false)
  const kennedyLng = dms(75, 40, 22.66, true)
  const kennedyPoints = await prisma.aidPoint.findMany({
    where: { municipioId: pereira.id, name: 'CAFE Kennedy', lat: null },
  })
  for (const point of kennedyPoints) {
    await prisma.aidPoint.update({ where: { id: point.id }, data: { lat: kennedyLat, lng: kennedyLng } })
    console.log(`OK: CAFE Kennedy (${point.id}) -> ${kennedyLat}, ${kennedyLng} (Parque Kennedy, cited coordinate)`)
  }

  // Plaza de Ferias (Cerritos) -- two duplicate rows exist for this venue
  // (a thin "Plaza de Ferias" plus a fuller "Albergue Plaza de Ferias
  // (Cerritos)" from a later research pass). Nominatim's match for this
  // query is non-deterministic (empty result on repeat queries during
  // testing; the OSM feature is a landuse=industrial polygon, not a POI,
  // which geocoders handle inconsistently) -- using the coordinate
  // confirmed via a direct, isolated query rather than re-querying here.
  // Accepted despite being ~16.6km from Pereira's urban centroid: verified
  // as the correct real venue via pereira.gov.co (Cerritos corregimiento,
  // near the airport, legitimately that far from downtown).
  const plazaDeFeriasCoord = { lat: 4.8066494, lng: -75.8407215 }
  const plazaDeFeriasPoints = await prisma.aidPoint.findMany({
    where: { municipioId: pereira.id, name: { contains: 'Plaza de Ferias' }, lat: null },
  })
  for (const point of plazaDeFeriasPoints) {
    await prisma.aidPoint.update({ where: { id: point.id }, data: plazaDeFeriasCoord })
    console.log(`OK: ${point.name} (${point.id}) -> ${plazaDeFeriasCoord.lat}, ${plazaDeFeriasCoord.lng}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
