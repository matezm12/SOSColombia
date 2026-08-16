/**
 * Manual landmark-search pass (2026-08-16), continuing where the automated
 * geocoding rollout hit its wall: many still-ungeocoded AidPoints reference
 * a real, named public building (a sports complex, a mall, a convention
 * center, a specific church) but Nominatim's freeform/structured queries
 * against the RAW address text couldn't resolve it -- usually because the
 * address text mixes the landmark name with directions/cross-streets in a
 * way the query strategies in geocode-all-cities-aidpoints.ts don't handle.
 *
 * Each entry below was independently verified via web search (a real
 * street address for the landmark, cited from an official/business source)
 * before being geocoded -- not guessed. Two lessons from this pass:
 *
 * 1. Searching Nominatim by the landmark's OWN name (when it's a mapped
 *    OSM feature -- sports_centre, library, etc.) is far more reliable
 *    than constructing a street-address query, which can match a
 *    same-named street in the wrong part of town. Caught one real case:
 *    "Calle 9 #36-60, Cali" for Unidad Deportiva Jaime Aparicio matched a
 *    same-numbered street 13km south in a rural district (Pance); searching
 *    "Unidad Deportiva Jaime Aparicio, Cali" directly found the actual
 *    OSM-mapped sports_centre polygon instead.
 *
 * 2. Several points genuinely share ONE real building across different
 *    orgs/purposes -- a Cruz Roja blood bank and "Hemocentro del Café" are
 *    the same physical hemocentro; a sports complex's separate coliseums
 *    (Mayor/Menor + an animal-welfare refuge run out of one of them) share
 *    one manually-verified landmark point; Popayán's Casa de la Moneda
 *    hosted two separate donation drives. geocode-all-cities-aidpoints.ts's
 *    duplicate-coordinate revert pass can't distinguish this from a bad
 *    generic-fallback match and will revert these if re-run -- restoring
 *    them is folded into this script too so it's reproducible.
 *
 * Run once via `npx tsx prisma/geocode-landmarks-manual.ts`, NOT part of
 * the repeatable prisma/seed.ts. Safe to re-run (each block only touches
 * points still missing coordinates, or explicitly named restores).
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

async function applyByIds(ids: string[], lat: number, lng: number, label: string) {
  for (const id of ids) {
    await prisma.aidPoint.update({ where: { id }, data: { lat, lng } })
  }
  console.log(`Applied ${label} -> ${lat}, ${lng} (${ids.length} point(s))`)
}

async function applyByNames(names: string[], lat: number, lng: number, label: string) {
  let count = 0
  for (const name of names) {
    const p = await prisma.aidPoint.findFirst({ where: { name } })
    if (p) {
      await prisma.aidPoint.update({ where: { id: p.id }, data: { lat, lng } })
      count++
    }
  }
  console.log(`Applied ${label} -> ${lat}, ${lng} (${count}/${names.length} matched by name)`)
}

async function main() {
  // ── Landmarks geocoded fresh, verified via web search first ───────────
  const landmarkQueries: Array<{ query: string; ids: string[]; label: string }> = [
    { query: 'Unidad deportiva Jaime Aparicio, Cali, Colombia', ids: ['cmsthdltf001tjo7kl9dsdv33', 'cmsthdoi2001wjo7kn3wlymxy', 'cmstsw06r004nw07kojrgwgq5'], label: 'Unidad Deportiva Jaime Aparicio (Cali)' },
    { query: 'Biblioteca Departamental Jorge Garces Borrero, Cali, Colombia', ids: ['cmsthdng3001ujo7k2jig5my6'], label: 'Biblioteca Departamental (Cali)' },
    { query: 'Estadio Palogrande, Manizales, Colombia', ids: ['cmsrdsnrq0026xw7kkls1xipc', 'cmsrdsntv0027xw7khxh3wjjt', 'cmsthe69v002jjo7kwviztuzy'], label: 'Unidad Deportiva Palogrande (Manizales)' },
    { query: 'Monserrat Plaza, 56N-30, Transversal 9, Popayan, Colombia', ids: ['cmstsqm8o002nw07ku24p9m90'], label: 'Centro Comercial Monserrat Plaza (Popayán)' },
    { query: 'Calle 26 Norte 11-21, Armenia, Colombia', ids: ['cmstshvjw0005w07k52fdcj7t'], label: 'Centro de Convenciones del Quindío (Armenia)' },
    { query: 'Calle 9 37a-01, Cali, Colombia', ids: ['cmstsvmzb004hw07kwltjazt8', 'cmsrpldeh000yeg7kbup8ei26'], label: 'Unidad Deportiva Panamericana (Cali)' },
    { query: 'Carrera 87 # 4C-33, Cali, Colombia', ids: ['cmstsvpdt004jw07kvateqmu7'], label: 'Iglesia Reyes y Sacerdotes (Cali)' },
  ]

  for (const item of landmarkQueries) {
    const result = await geocode(item.query)
    await sleep(1100)
    if (!result) {
      console.log(`NOT FOUND: ${item.label} -- "${item.query}"`)
      continue
    }
    await applyByIds(item.ids, result.lat, result.lng, item.label)
  }

  // ── Restore legitimate same-building matches the automated duplicate-
  // revert pass can't tell apart from a bad generic-fallback match ──────
  const sharedBuildingRestores: Array<{ names: string[]; lat: number; lng: number; label: string }> = [
    { names: ['Casa de la Moneda', 'Casa de la Moneda - insumos médicos/salud (Primera Dama del Cauca)'], lat: 2.4441216, lng: -76.6095359, label: 'Casa de la Moneda (Popayán) -- same building, two orgs' },
    { names: ['Hemocentro del Café', 'Cruz Roja — Banco Regional de Sangre (Manizales)'], lat: 5.0654467, lng: -75.4967291, label: 'Hemocentro (Manizales) -- same building, two orgs' },
    { names: ['Coliseo Mayor Jorge Arango Uribe', 'Coliseo Menor Ramón Marín Vargas', 'Unidad de Protección Animal (UPA) - Alcaldía de Manizales'], lat: 5.0570052, lng: -75.4900871, label: 'Palogrande complex (Manizales)' },
  ]

  for (const r of sharedBuildingRestores) {
    await applyByNames(r.names, r.lat, r.lng, r.label)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
