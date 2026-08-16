/**
 * Manual landmark-search pass (2026-08-16), continuing where the automated
 * geocoding rollout hit its wall: many still-ungeocoded AidPoints reference
 * a real, named public building (a sports complex, a mall, a convention
 * center, a specific church) but Nominatim's freeform/structured queries
 * against the RAW address text couldn't resolve it -- usually because the
 * address text mixes the landmark name with directions/cross-streets in a
 * way the query strategies in geocode-all-cities-aidpoints.ts don't handle.
 *
 * Every coordinate below was independently verified via web search (a real
 * street address for the landmark, cited from an official/business source)
 * before geocoding via Nominatim -- not guessed. Three lessons from this
 * pass:
 *
 * 1. Searching Nominatim by the landmark's OWN name (when it's a mapped OSM
 *    feature -- sports_centre, library, etc.) is far more reliable than
 *    constructing a street-address query, which can match a same-named
 *    street in the wrong part of town. Caught one real case: "Calle 9
 *    #36-60, Cali" for Unidad Deportiva Jaime Aparicio matched a
 *    same-numbered street 13km south in a rural district (Pance); searching
 *    "Unidad Deportiva Jaime Aparicio, Cali" directly found the actual
 *    OSM-mapped sports_centre polygon instead.
 *
 * 2. Nominatim is NOT deterministic for every query -- re-running the exact
 *    same "Calle 9 37a-01, Cali, Colombia" query on a later day returned a
 *    match ~3.6km away from the first run's result, both technically within
 *    the distance-check threshold. This is why this script hardcodes the
 *    already-verified lat/lng values below instead of re-querying live:
 *    a script that's "safe to re-run" should not mean "might silently
 *    drift a working coordinate on every run."
 *
 * 3. Several points genuinely share ONE real building across different
 *    orgs/purposes -- a Cruz Roja blood bank and "Hemocentro del Café" are
 *    the same physical hemocentro; a sports complex's separate coliseums
 *    share one landmark point; Popayán's Casa de la Moneda hosted two
 *    separate donation drives. geocode-all-cities-aidpoints.ts's
 *    duplicate-coordinate revert pass can't distinguish this from a bad
 *    generic-fallback match and will revert these if re-run -- restoring
 *    them is folded into this script too so it's reproducible.
 *
 * Explicitly NOT resolved, left ungeocoded rather than risk a wrong pin:
 * - Gobernación del Tolima (Ibagué): every Nominatim query variant tried
 *   (name search, street address) matched "Asamblea Departamental del
 *   Tolima" instead -- a real but DIFFERENT, adjacent government building.
 * - Facultad de Ingeniería Civil, Universidad del Cauca (Popayán): real
 *   confirmed address (Calle 2 Cra 15N, Campus Tulcán) via web search, but
 *   no Nominatim query variant resolved it.
 *
 * Run once via `npx tsx prisma/geocode-landmarks-manual.ts`, NOT part of
 * the repeatable prisma/seed.ts. Safe to re-run -- every value here is a
 * fixed, already-verified coordinate, not a live re-query.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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
  const fixedCoordinates: Array<{ names: string[]; lat: number; lng: number; label: string }> = [
    { names: ['Albergue Coliseo de Hockey Miguel Calero', 'Albergue y Punto de Acopio - Diamante de Béisbol', 'Módulos de privacidad - Arquitectura para la Gente (Albergue Coliseo de Hockey)'], lat: 3.4237953, lng: -76.5363238, label: 'Unidad Deportiva Jaime Aparicio (Cali)' },
    { names: ['Albergue Iglesia Avivamiento Cali'], lat: 3.4362817, lng: -76.5394259, label: 'Biblioteca Departamental (Cali)' },
    { names: ['Coliseo Mayor Jorge Arango Uribe', 'Coliseo Menor Ramón Marín Vargas', 'Unidad de Protección Animal (UPA) - Alcaldía de Manizales'], lat: 5.0570052, lng: -75.4900871, label: 'Unidad Deportiva Palogrande (Manizales)' },
    { names: ['Donatón Solidario - Centro Comercial Monserrat Plaza'], lat: 2.4850174, lng: -76.5821946, label: 'Centro Comercial Monserrat Plaza (Popayán)' },
    { names: ['Centro de Convenciones de Armenia - punto central de acopio departamental'], lat: 4.5595601, lng: -75.6485931, label: 'Centro de Convenciones del Quindío (Armenia)' },
    { names: ['Albergue temporal Canchas Panamericanas (Unidad Deportiva Panamericana)', 'Carpa de primeros auxilios — Secretaría de Salud'], lat: 3.4489157, lng: -76.5338616, label: 'Unidad Deportiva Panamericana (Cali)' },
    { names: ['Albergue Iglesia Reyes y Sacerdotes'], lat: 3.3786467, lng: -76.5389385, label: 'Iglesia Reyes y Sacerdotes (Cali)' },
    { names: ['Coliseo del Sur'], lat: 4.5147248, lng: -75.6886471, label: 'Coliseo del Sur (Armenia)' },
    { names: ['Parroquia San Marcos Evangelista - nuevo punto de acopio Cáritas Pereira'], lat: 4.8372351, lng: -75.6789994, label: 'Parroquia San Marcos Evangelista (Dosquebradas)' },
    { names: ['Jornada de donación de sangre - ESE Hospital Santa Mónica Dosquebradas'], lat: 4.8243042, lng: -75.6798583, label: 'ESE Hospital Santa Mónica (Dosquebradas)' },
    { names: ['Polideportivo de La Paz'], lat: 2.476545, lng: -76.5591953, label: 'Polideportivo de La Paz (Popayán)' },
    { names: ['Punto de acopio Quibdó - oficina de Francisco Vidal (Representante a la Cámara por Chocó)'], lat: 5.6920078, lng: -76.6582377, label: 'Hotel Farallones (Quibdó)' },
    { names: ['Fundación Porque Juntos Somos Más - centro de acopio'], lat: 4.8201538, lng: -75.6846001, label: 'Hotel Yellow (Dosquebradas)' },
    // Shared-building restores (see lesson 3 above).
    { names: ['Casa de la Moneda', 'Casa de la Moneda - insumos médicos/salud (Primera Dama del Cauca)'], lat: 2.4441216, lng: -76.6095359, label: 'Casa de la Moneda (Popayán) -- same building, two orgs' },
    { names: ['Hemocentro del Café', 'Cruz Roja — Banco Regional de Sangre (Manizales)'], lat: 5.0654467, lng: -75.4967291, label: 'Hemocentro (Manizales) -- same building, two orgs' },
  ]

  for (const c of fixedCoordinates) {
    await applyByNames(c.names, c.lat, c.lng, c.label)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
