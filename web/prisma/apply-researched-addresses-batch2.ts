/**
 * One-off batch: applies the addresses found during the 2026-08-16 research
 * pass (web search + social media, see conversation / memory for the full
 * per-point breakdown) to previously-ungeocoded AidPoints.
 *
 * Deliberately EXCLUDED from this batch (left ungeocoded, needs a human call):
 * - Gobernación del Tolima (Ibagué): historically confused with the adjacent
 *   Asamblea Departamental building by every geocoder query tried across two
 *   research sessions -- needs a manually-verified coordinate, not an
 *   automated query.
 * - Coliseo Universidad de Caldas (Manizales): two sources give two
 *   different addresses for the same venue, unresolved.
 * - Casa de paso/tránsito, Comuna 1 (Cali): confirmed to not have a single
 *   fixed address (only a door-to-door census effort).
 * - Paraíso Canino (Dosquebradas): the only real "Paraíso Canino" account
 *   found is based in Pereira, not Dosquebradas -- likely a different org
 *   with a similar name; applying its address would mislabel the point.
 * - Centro de acopio La Licorera (tagged as Buenaventura in our DB): the
 *   real address found is in Cali (a departmental collection point serving
 *   several municipios) -- flagged for a human city-reassignment decision,
 *   not silently geocoded under the wrong municipio.
 *
 * Each entry below uses Nominatim (OSM) with a courtesy 1.1s delay between
 * requests and a distance sanity check against the municipio's centroid
 * (see geocode-all-cities-aidpoints.ts for why: Nominatim occasionally
 * returns a same-numbered-street match in a totally different, sometimes
 * rural, part of the department). Structured street search is tried first;
 * landmark name search is the fallback for entries too vague/informal for
 * a street query. Run once via `npx tsx prisma/apply-researched-addresses-batch2.ts`.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 4 });
const prisma = new PrismaClient({ adapter });

const HEADERS = { 'User-Agent': 'SOSColombia-earthquake-relief-map/1.0 (contact: argezdev@gmail.com)' };
const SANITY_KM = 25;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

async function nominatimSearch(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: HEADERS });
  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  return results[0] ?? null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type Entry = {
  namePart: string;
  municipioName: string;
  queries: string[]; // tried in order, first sanity-passing result wins
};

const ENTRIES: Entry[] = [
  // Armenia
  { namePart: 'Brigada interna Universidad del Quindío', municipioName: 'Armenia', queries: ['Universidad del Quindío, Armenia, Quindío'] },
  { namePart: 'Cuerpo Oficial de Bomberos de Armenia', municipioName: 'Armenia', queries: ['Estación Coliseo Bomberos, Carrera 19, Armenia, Quindío', 'Cuerpo de Bomberos Armenia, Quindío'] },
  { namePart: 'Fundación Covida', municipioName: 'Armenia', queries: ['Calle 10 Norte 17A-19, Armenia, Quindío'] },
  { namePart: 'Junta de Acción Comunal Barrio Santander', municipioName: 'Armenia', queries: ['Barrio Santander, Armenia, Quindío'] },

  // Buenaventura
  { namePart: 'Banco de Alimentos de Buenaventura', municipioName: 'Buenaventura', queries: ['Avenida Simón Bolívar 47C-70, Buenaventura, Valle del Cauca'] },
  { namePart: 'Centro Comercial Único', municipioName: 'Buenaventura', queries: ['Centro Comercial Único, Buenaventura, Valle del Cauca'] },
  { namePart: 'Centro multimodal de Puente Nayero', municipioName: 'Buenaventura', queries: ['Puente de los Nayeros, Buenaventura, Valle del Cauca', 'La Playita, Buenaventura, Valle del Cauca'] },
  { namePart: 'Manglaria', municipioName: 'Buenaventura', queries: ['Carrera 56b 5-92, Buenaventura, Valle del Cauca'] },
  { namePart: 'Punto de acopio Zacarías Río Dagua', municipioName: 'Buenaventura', queries: ['Calle 7C 56-14, Buenaventura, Valle del Cauca', 'Barrio Margarita Hurtado, Buenaventura, Valle del Cauca'] },

  // Cali
  { namePart: 'Cámara de Comercio de Cali', municipioName: 'Cali', queries: ['Calle 8 3-14, Cali, Valle del Cauca'] },
  { namePart: 'Centro de Bienestar Animal de Cali', municipioName: 'Cali', queries: ['Carrera 56 7 Oeste-455, Cali, Valle del Cauca', 'Cerro de la Bandera, Cali'] },
  { namePart: 'Ciudadela Petronio Álvarez', municipioName: 'Cali', queries: ['Unidad Deportiva Alberto Galindo, Cali, Valle del Cauca'] },
  { namePart: 'Cruz Roja — Banco Regional de Sangre (Cali)', municipioName: 'Cali', queries: ['Carrera 38 Bis 5-91, Cali, Valle del Cauca', 'Barrio San Fernando, Cali'] },
  { namePart: 'Punto de albergue - Barrio Capri', municipioName: 'Cali', queries: ['Carrera 72 10 Bis-153, Cali, Valle del Cauca', 'Barrio Capri, Cali'] },
  { namePart: 'Unidad Deportiva Panamericana', municipioName: 'Cali', queries: ['Unidad Deportiva Panamericana, Cali, Valle del Cauca'] },

  // Dosquebradas
  { namePart: 'Aceros Gricar', municipioName: 'Dosquebradas', queries: ['Carrera 16 70-68, Dosquebradas, Risaralda'] },
  { namePart: 'Acopio Barrio Las Vegas', municipioName: 'Dosquebradas', queries: ['Calle 9 Oeste, Dosquebradas, Risaralda', 'Barrio Las Vegas, Dosquebradas'] },
  { namePart: 'Albergue temporal Polideportivo del Campestre', municipioName: 'Dosquebradas', queries: ['Polideportivo del Campestre, Dosquebradas, Risaralda'] },
  { namePart: 'Caseta Comunal en Frailes', municipioName: 'Dosquebradas', queries: ['Barrio Frailes, Dosquebradas, Risaralda'] },
  { namePart: 'Fundación Cristiana Rescatados Por Su Sangre', municipioName: 'Dosquebradas', queries: ['Barrio Frailes, Dosquebradas, Risaralda'] },
  { namePart: 'Fundación La Granja de los Abuelos', municipioName: 'Dosquebradas', queries: ['Vereda La Esmeralda, Dosquebradas, Risaralda'] },

  // Ibagué
  { namePart: 'Benemérito Cuerpo de Bomberos Voluntarios de Ibagué', municipioName: 'Ibagué', queries: ['Calle 113 Sur, Ibagué, Tolima', 'Barrio San Francisco de Aparco, Ibagué'] },

  // Manizales
  { namePart: 'ABC Veterinarios', municipioName: 'Manizales', queries: ['Carrera 23 75a-97, Manizales, Caldas'] },
  { namePart: 'Banco Arquidiocesano de Alimentos de Manizales', municipioName: 'Manizales', queries: ['Calle 49 27A-85, Manizales, Caldas'] },
  { namePart: 'Centro Veterinario Santa Mónica', municipioName: 'Manizales', queries: ['Carrera 15a 74a-31, Manizales, Caldas'] },
  { namePart: 'Corporación Red Afecto', municipioName: 'Manizales', queries: ['Coliseo Menor Ramón Marín Vargas, Manizales, Caldas'] },
  { namePart: 'Fundación Pequeño Corazón', municipioName: 'Manizales', queries: ['Carrera 24 53-39, Manizales, Caldas'] },
  { namePart: 'Iglesia Cristiana Remanente Manizales', municipioName: 'Manizales', queries: ['Calle 50 26-72, Manizales, Caldas'] },

  // Pereira
  { namePart: 'Adóptame Pereira', municipioName: 'Pereira', queries: ['Carrera 5 con Calle 34, Pereira, Risaralda'] },
  { namePart: 'Albergue Ecoparque El Vergel', municipioName: 'Pereira', queries: ['Ecoparque El Vergel, Pereira, Risaralda'] },
  { namePart: 'Albergue Parque del Oso', municipioName: 'Pereira', queries: ['Calle 80 34-19, Pereira, Risaralda'] },
  { namePart: 'Antiguo Colegio La Enseñanza', municipioName: 'Pereira', queries: ['Avenida Circunvalar 1-57, Pereira, Risaralda'] },
  { namePart: 'Ayudar es paz', municipioName: 'Pereira', queries: ['Transversal 22 26BD-33, Pereira, Risaralda'] },
  { namePart: 'Bioparque Ukumarí', municipioName: 'Pereira', queries: ['Bioparque Ukumarí, Pereira, Risaralda'] },
  { namePart: 'Clínica Veterinaria Visión de las Américas', municipioName: 'Pereira', queries: ['Carrera 13 9-67, Pereira, Risaralda'] },
  { namePart: 'Coliseo Mayor', municipioName: 'Pereira', queries: ['Carrera 8 36-24, Pereira, Risaralda'] },
  { namePart: 'Ecoparque El Vergel', municipioName: 'Pereira', queries: ['Ecoparque El Vergel, Pereira, Risaralda'] },
  { namePart: 'El barista', municipioName: 'Pereira', queries: ['Carrera 30 11-55, Pereira, Risaralda'] },
  { namePart: 'Estadio Alberto "Mora Mora"', municipioName: 'Pereira', queries: ['Calle 3 20-51, Pereira, Risaralda'] },
  { namePart: 'Instituto del sistema nervioso Risaralda', municipioName: 'Pereira', queries: ['Calle 11 23-31, Pereira, Risaralda'] },
  { namePart: 'JumpFit by Felina', municipioName: 'Pereira', queries: ['Mall Batará Plaza, Pereira, Risaralda'] },
  { namePart: 'Kabala', municipioName: 'Pereira', queries: ['Carrera 29 22-14, Pereira, Risaralda'] },
  { namePart: 'La Rebeca', municipioName: 'Pereira', queries: ['Avenida Circunvalar con Calle 1, Pereira, Risaralda'] },
  { namePart: 'Parque El Oso', municipioName: 'Pereira', queries: ['Calle 80 34-19, Pereira, Risaralda'] },
  { namePart: 'Parque Olaya Herrera', municipioName: 'Pereira', queries: ['Calle 21 13-5, Pereira, Risaralda'] },
  { namePart: 'PPAA - Asociación de Protección y Bienestar Animal', municipioName: 'Pereira', queries: ['Carrera 10 bis 32-68, Pereira, Risaralda'] },
  { namePart: 'Ser Animal. Veterinaria', municipioName: 'Pereira', queries: ['Carrera 12 Bis 10-36, Pereira, Risaralda'] },
  { namePart: 'Voluntarios médicos La Lorena', municipioName: 'Pereira', queries: ['Carrera 17B 21B-32, Pereira, Risaralda'] },

  // Popayán
  { namePart: 'Facultad de Ingeniería Civil, Universidad del Cauca', municipioName: 'Popayán', queries: ['Facultad de Ingeniería Civil, Universidad del Cauca, Popayán, Cauca', 'Campus Tulcán, Popayán, Cauca'] },
  { namePart: 'Fundación Hogar para Ancianos San Vicente de Paúl', municipioName: 'Popayán', queries: ['Carrera 8 10-25, Popayán, Cauca'] },
  { namePart: 'Pet and Pet', municipioName: 'Popayán', queries: ['Carrera 6 45N-55, Popayán, Cauca'] },
  { namePart: 'Clínica Dr. Arbeláez', municipioName: 'Popayán', queries: ['Carrera 11 18-25, Popayán, Cauca'] },
  { namePart: 'Universidad del Cauca - Facultad de Ciencias Agrarias', municipioName: 'Popayán', queries: ['Facultad de Ciencias Agrarias, Universidad del Cauca, Popayán, Cauca'] },

  // Quibdó
  { namePart: 'Centro Logístico Humanitario del Chocó', municipioName: 'Quibdó', queries: ['km 4 vía Quibdó Yuto, Quibdó, Chocó'] },
  { namePart: 'Fundación Banco de Alimentos de la Diócesis de Quibdó', municipioName: 'Quibdó', queries: ['Calle 21 4-82, Quibdó, Chocó', 'Barrio Yesquita, Quibdó, Chocó'] },
  { namePart: 'Hospital San Francisco de Asís de Quibdó', municipioName: 'Quibdó', queries: ['Carrera 1 31-25, Quibdó, Chocó', 'Hospital San Francisco de Asís, Quibdó, Chocó'] },

  // San José del Palmar (points physically located in Cali/Bogotá — flagged, see note above)
  { namePart: 'Casa de los Títeres', municipioName: 'San José del Palmar', queries: ['Carrera 9 4-55, Cali, Valle del Cauca'] },
  { namePart: 'Centro de acopio Cali (El Caney)', municipioName: 'San José del Palmar', queries: ['Calle 81 42-41, Cali, Valle del Cauca', 'El Caney, Cali'] },
  { namePart: 'Ensifera Nature', municipioName: 'San José del Palmar', queries: ['Carrera 5 3-76, Cali, Valle del Cauca'] },
  { namePart: 'Mestizo Centro Cultural', municipioName: 'San José del Palmar', queries: ['Carrera 15A 44-67, Bogotá'] },
];

async function main() {
  const municipios = await prisma.municipio.findMany({ select: { id: true, name: true, lat: true, lng: true } });
  const municipioByName = new Map(municipios.map((m) => [m.name, m]));

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const entry of ENTRIES) {
    const municipio = municipioByName.get(entry.municipioName);
    if (!municipio || municipio.lat == null || municipio.lng == null) {
      skipped.push(`${entry.namePart} (${entry.municipioName}): no municipio centroid`);
      continue;
    }

    const points = await prisma.aidPoint.findMany({
      where: { municipioId: municipio.id, name: { contains: entry.namePart } },
    });
    if (points.length === 0) {
      skipped.push(`${entry.namePart} (${entry.municipioName}): no matching AidPoint by name`);
      continue;
    }

    let found: { lat: number; lng: number; query: string } | null = null;
    for (const q of entry.queries) {
      await sleep(1100);
      const result = await nominatimSearch(q);
      if (!result) continue;
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const dist = haversineKm(lat, lng, municipio.lat, municipio.lng);
      if (dist <= SANITY_KM) {
        found = { lat, lng, query: q };
        break;
      }
    }

    if (!found) {
      skipped.push(`${entry.namePart} (${entry.municipioName}): no query resolved within ${SANITY_KM}km sanity radius`);
      continue;
    }

    for (const point of points) {
      await prisma.aidPoint.update({ where: { id: point.id }, data: { lat: found.lat, lng: found.lng } });
      applied.push(`${point.name} (${entry.municipioName}) -> ${found.lat},${found.lng} [via "${found.query}"]`);
    }
  }

  console.log(`\nApplied: ${applied.length}`);
  applied.forEach((a) => console.log('  ' + a));
  console.log(`\nSkipped: ${skipped.length}`);
  skipped.forEach((s) => console.log('  ' + s));

  await prisma.$disconnect();
}

main();
