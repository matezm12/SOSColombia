/**
 * One-off loader for the /recursos + /comunidad research pass (2026-08-14) —
 * see wiki/17-allied-resources-and-community.md. Run once via `npx tsx
 * prisma/seed-allied-resources.ts`, NOT part of the repeatable prisma/seed.ts.
 *
 * Every AlliedResource/PendingAidPoint row here traces back to a specific
 * site fetched during that research pass. PendingAidPoint rows land in the
 * moderation queue (origin: AUTOMATION_SWEEP) — they need /admin/moderacion
 * review before becoming real AidPoint rows, same discipline as any other
 * community/automation find.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Ensure Dosquebradas exists — ayudaspereira.com tracks it alongside
  // Pereira but the original seed.ts only loaded the 5 red-alert cities +
  // San José del Palmar + Popayán. ──────────────────────────────────────
  const risaralda = await prisma.department.findFirstOrThrow({ where: { divipolaCode: '66' } })
  let dosquebradas = await prisma.municipio.findFirst({ where: { divipolaCode: '66170' } })
  if (!dosquebradas) {
    dosquebradas = await prisma.municipio.create({
      data: {
        name: 'Dosquebradas',
        divipolaCode: '66170',
        departmentId: risaralda.id,
        redAlert: false,
      },
    })
    console.log('Created Dosquebradas municipio')
  }
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })
  const municipioByCity: Record<string, string> = {
    Pereira: pereira.id,
    Dosquebradas: dosquebradas.id,
    Cali: cali.id,
    Armenia: armenia.id,
    Manizales: manizales.id,
  }

  // ── Allied resources ─────────────────────────────────────────────────
  const alliedResourceDefs = [
    {
      name: 'Ayudas Pereira',
      url: 'https://ayudaspereira.com',
      org: 'Independiente — Felipe Lebrun (sin marca de ONG/institución)',
      description:
        'App en vivo de coordinación de centros de acopio: por ciudad muestra necesidades urgentes vs. inventario disponible, entregas activas y voluntarios, y permite registrar un centro, ofrecer una donación o transportar.',
      category: 'VOLUNTEER_COORDINATION' as const,
      hostingNoCustomDomain: false,
      ogImageUrl: null,
      tier: 3,
      notes:
        'Autohospedado en un VPS de Hostinger (DNS por GoDaddy) — no está en Vercel/Netlify/GitHub Pages. Cubre Pereira, Dosquebradas y otros ~11 municipios de Risaralda, Valle del Cauca, Caldas, Quindío y Bogotá D.C. Datos autoreportados por quien registra el centro, sin insignia de verificación oficial — tratar como no verificado. Teléfonos y edición de centros requieren inicio de sesión. Sin og:image/twitter:card — un enlace compartido muestra una vista previa genérica.',
    },
    {
      name: 'Cuidar a Colombia',
      url: 'https://cuidarcolombia.vercel.app',
      org: 'Independiente — profesor Santiago Jiménez Londoño (sjimenezlon.co)',
      description:
        'Directorio ciudadano que verifica y enlaza canales oficiales de donación, puntos de acopio, bancos de sangre, mecanismos de personas desaparecidas y un mapa de zonas afectadas — cada registro con fuente y fecha de revisión. No intermedia ni recauda fondos.',
      category: 'AID_DIRECTORY' as const,
      hostingNoCustomDomain: true,
      ogImageUrl: 'https://cuidarcolombia.vercel.app/assets/og.png',
      tier: 4,
      notes:
        '214 registros rastreados, 108 fuentes consultadas, 13 municipios monitoreados (2026-08-13 19:30 COT). Cada registro etiquetado fuente_oficial/fuente_secundaria con URL y fecha de revisión — "revisión humana asistida por IA", no auto-publica envíos comunitarios. Hospedado en vercel.app, sin dominio propio.',
    },
    {
      name: 'Acopio Colombia',
      url: 'https://emergency-rosy.vercel.app',
      org: 'Independiente — Victor Olave (github.com/victorolave/acopio-colombia)',
      description:
        'Directorio geolocalizado y colaborativo (Next.js/Supabase/MapLibre) para encontrar centros de acopio verificados cerca de ti, con lo que cada uno necesita exactamente y marca de tiempo de verificación por centro.',
      category: 'AID_DIRECTORY' as const,
      hostingNoCustomDomain: true,
      ogImageUrl: null,
      tier: 4,
      notes:
        '126 centros publicados en 27 departamentos, 91 confirmados por el canal propio de la entidad responsable (cifra en vivo — el README del repo dice 90/26, desactualizado). Pipeline de verificación en 5 estados (verificado/reportado/pendiente/disputado/inactivo) — solo verificado+reportado se muestran públicamente. Sin og:image ni ruta /opengraph-image. Hospedado en vercel.app, sin dominio propio.',
    },
  ]

  for (const r of alliedResourceDefs) {
    const existing = await prisma.alliedResource.findFirst({ where: { url: r.url } })
    if (existing) {
      console.log(`Skipping AlliedResource ${r.name} — already seeded`)
      continue
    }
    await prisma.alliedResource.create({
      data: {
        name: r.name,
        url: r.url,
        org: r.org,
        description: r.description,
        category: r.category,
        hostingNoCustomDomain: r.hostingNoCustomDomain,
        ogImageUrl: r.ogImageUrl,
        tier: r.tier,
        notes: r.notes,
        lastCheckedAt: new Date('2026-08-14'),
      },
    })
    console.log(`Created AlliedResource: ${r.name}`)
  }

  // ── Pending aid points — from ayudaspereira.com's Pereira/Dosquebradas
  // dashboard. All self-reported, no phone numbers (gated behind login on
  // the source site). `OTHER`-category centers on the source mapped to the
  // closest fit, ACOPIO, per wiki/17-allied-resources-and-community.md. ──
  const SOURCE_URL = 'https://ayudaspereira.com'
  const pendingAidPointDefs = [
    { name: 'Acopio Alfonso Jaramillo Gutierrez', kind: 'ACOPIO', city: 'Pereira', address: 'Mz 27 Cs 17 Corales', note: 'Responsable: Diego Alejandro Cardona Vásquez.' },
    { name: 'ACOPIO BARRIO EL GUAYABAL', kind: 'ACOPIO', city: 'Pereira', address: 'Manzana 59 Casa 12', note: 'Responsable: Luz Damaris Castillo Largo.' },
    { name: 'Acopio Barrio Las Vegas - Dosquebradas', kind: 'ACOPIO', city: 'Dosquebradas', address: 'Cl. 9 #9 Oeste-2 a, Cra. 9 Oe. #32, Dosquebradas, Risaralda', needs: '5 urgentes: alimentos no perecederos, medicamentos, cobijas y colchonetas, aseo e higiene, agua', note: 'Responsable: Andres Mauricio.' },
    { name: 'ACOPIO SAN NICOLÁS', kind: 'ACOPIO', city: 'Pereira', address: 'Calle 33 #14-46', note: 'Sin responsable listado en la página pública.' },
    { name: 'ACOPIO VILLASANTANA MOUNTAIN GYM', kind: 'ACOPIO', city: 'Pereira', address: 'Comuna Villasantana - entrada vereda el chocho', needs: '4 urgentes: pañales y bebés (etapa 3-5, pañitos, crema, juguetes), agua (no hay servicio en la comuna), aseo e higiene, alimentos no perecederos', note: 'Responsable: Vanessa Echeverri.' },
    { name: 'Anana Alamos', kind: 'ACOPIO', city: 'Pereira', address: 'Calle 14 # 27-25', note: 'Responsable: Sebastian Perez. Categoría original "OTHER" — mapeado a ACOPIO.' },
    { name: 'Animal Gym', kind: 'ACOPIO', city: 'Pereira', address: 'Manzana 16 casa 9 campestre A', note: 'Responsable: Gustavo. Gimnasio actuando como punto de acopio general, no clínica veterinaria pese al nombre. Categoría original "OTHER" — mapeado a ACOPIO.' },
    { name: 'Asociación Latifundio', kind: 'ACOPIO', city: 'Pereira', address: 'Calle 22 # 3-46', note: 'Responsable: María Elena García. Uno de los centros con más inventario en varias categorías.' },
    { name: 'Ayudar es paz', kind: 'ACOPIO', city: 'Pereira', address: 'Tv. 22 # 26BD-33', needs: '5 urgentes: alimentos no perecederos, agua, cobijas y colchonetas, ropa y franelas, medicamentos', note: 'Responsable: Miguel Bedoya.' },
    { name: 'Catedral Santísimo Sacramento ACC', kind: 'ACOPIO', city: 'Pereira', address: 'Cra 5 # 28-75', note: 'Punto de acopio en iglesia. Responsable: Padre Julio Bolivar.' },
    { name: 'CDA Terpel Victoria', kind: 'ACOPIO', city: 'Pereira', address: 'Calle 17 # 12-40', note: 'Centro de diagnóstico automotor (CDA) en estación Terpel actuando como acopio. Responsable: Laura Trejos.' },
    { name: 'Centro Acopio Corales', kind: 'ACOPIO', city: 'Pereira', address: 'Manzana 13 casa 19, cerca al parque Las Iguanas', note: 'Responsable: Juan Esteban Saldarriaga Idarraga.' },
    { name: 'Centro de Acopio Voluntario', kind: 'ACOPIO', city: 'Pereira', address: 'Mz 3 casa 32 piso 2, Santa Fe/Cuba', note: 'Responsable: Maria Gonzalez.' },
    { name: 'Centro de experiencia Utopía / Stossa', kind: 'ACOPIO', city: 'Pereira', address: 'Avenida Circunvalar 10-21, Primer piso', note: 'Responsable: Julián Rivas. Uno de los mayores centros de acopio — mayor inventario en casi todas las categorías.' },
    { name: 'Centro médico Dosquebradas', kind: 'HEALTH', city: 'Dosquebradas', address: 'Coliseo Dosquebradas', note: 'Punto médico dentro del Coliseo de Dosquebradas. Responsable: Leidy Henao.' },
    { name: 'CIAF', kind: 'ACOPIO', city: 'Pereira', address: 'Carrera 6 No. 24-56', note: 'Responsable listado solo como "Ciaf". Propósito exacto no claro más allá de centro de acopio. Categoría original "OTHER" — mapeado a ACOPIO.' },
    { name: 'Colectivo Artemisa', kind: 'ACOPIO', city: 'Pereira', address: 'Cra 4 #20-55', note: 'Responsable: Xiomara Carvajal.' },
    { name: 'El barista', kind: 'ACOPIO', city: 'Pereira', address: 'Cra 30 # 11-55', note: 'Cafetería actuando como punto de acopio. Responsable: Sebastian Mejia.' },
    { name: 'Instituto del sistema nervioso Risaralda', kind: 'HEALTH', city: 'Pereira', needs: '3 urgentes: aseo e higiene, agua', note: 'Instituto médico; sin dirección pública. Responsable: Zaida. También gran centro de acopio con alto inventario.' },
    { name: 'Kabala', kind: 'ACOPIO', city: 'Pereira', address: 'Cra 29 # 22-14', note: 'Responsable listado como "Sintraunicol UTP" (sindicato de trabajadores UTP).' },
    { name: 'La Rebeca', kind: 'ACOPIO', city: 'Pereira', note: 'Sin dirección pública. Responsable: Natalia Higuera.' },
    { name: 'Mall Sonoma', kind: 'ACOPIO', city: 'Pereira', address: 'Avenida Juan B. Gutiérrez #19-58, Pinares', note: 'Centro comercial actuando como punto de acopio. Responsable: Juan Esteban Cortés.' },
    { name: 'Mirador de la estancia', kind: 'ACOPIO', city: 'Pereira', address: 'Mz 10 Casa 11', note: 'Responsable: Diana Alvarez. Origen del único envío activo registrado al momento de la investigación (→ Frailes - Villa Fanny - Santa Isabel).' },
    { name: 'Óptica Bustamante', kind: 'HEALTH', city: 'Pereira', address: 'Jardín 2 etapa, manzana 14 casa 21', needs: 'Atención de urgencias oculares, retiro de cuerpos extraños, traumas; reparación de gafas y monturas para quienes las perdieron en el terremoto', note: 'Marcado "sin ubicar" en el mapa del sitio origen.' },
    { name: 'Sede sindicato de trabajadores La Rosa', kind: 'ACOPIO', city: 'Dosquebradas', address: 'Calle 33 #14-46', note: 'Sede sindical actuando como punto de acopio. Sin responsable listado.' },
    { name: 'Ser Animal. Veterinaria', kind: 'VET', city: 'Pereira', address: 'Cra 12 Bis # 10-36', needs: 'Meloxicam inyectable, dexametasona inyectable, guantes de látex, gasa, algodón, alcohol, clorhexidina, loratadina, sucralfato, omeprazol; alimento para perros y gatos', note: 'Clínica veterinaria. Responsable: Óscar Vargas.' },
    { name: 'Sr Bocata', kind: 'ACOPIO', city: 'Pereira', address: 'Cra. 20 bis #22-10, Providencia', needs: 'Alimentos no perecederos — preparan y reparten comidas (desayunos, almuerzos, comidas): granos, enlatados, arroz, pasta, pan de sándwich', note: 'Sandwichería cocinando y repartiendo comidas. Responsable: Cristian Torres.' },
    { name: 'Voluntarios médicos La Lorena', kind: 'HEALTH', city: 'Pereira', address: 'Carrera 17 B # 21B-32, La Lorena', note: 'Punto de equipo médico voluntario. Responsable listado como "Doc".' },
  ] as const

  // ── Pending aid points — from Cuidar a Colombia (cuidarcolombia.vercel.app),
  // restricted to our already-tracked cities (Cali/Armenia/Manizales). The
  // site's own dataset is much larger (214 records nationwide, most cities
  // outside this project's DIVIPOLA-anchored scope) — see
  // wiki/17-allied-resources-and-community.md "next steps" for why the rest
  // isn't bulk-imported here; visit /recursos for the full national list. ──
  const cuidarColombiaDefs = [
    { name: 'Minuto de Dios — San Fernando', kind: 'ACOPIO', city: 'Cali', address: 'Calle 5B #37-120, San Fernando', needs: 'alimentos no perecederos, kits de aseo, colchonetas y frazadas, herramientas', note: 'Fuente oficial (red Minuto de Dios).', source: 'https://cuidarcolombia.vercel.app' },
    { name: 'Cruz Roja — Banco Regional de Sangre (Cali)', kind: 'BLOOD_DONATION', city: 'Cali', note: 'Múltiples sedes: Cra. 38 Bis #5-91, Calle 5 #36-08, Calle 38N #3N-21, más Valle del Lili/Imbanaco. 8am-6pm.', source: 'https://cuidarcolombia.vercel.app' },
    { name: 'Cruz Roja — Banco Regional de Sangre (Armenia)', kind: 'BLOOD_DONATION', city: 'Armenia', address: 'Avenida Bolívar #23 Norte-60', note: 'Servicio permanente. Fuente oficial.', source: 'https://cuidarcolombia.vercel.app' },
    { name: 'Cruz Roja — Banco Regional de Sangre (Manizales)', kind: 'BLOOD_DONATION', city: 'Manizales', address: 'Carrera 21 #70A-06, Edificio Hemocentro', note: 'Servicio permanente. Fuente oficial.', source: 'https://cuidarcolombia.vercel.app' },
  ] as const

  let created = 0
  let skipped = 0
  for (const p of [...pendingAidPointDefs, ...cuidarColombiaDefs]) {
    const municipioId = municipioByCity[p.city]
    if (!municipioId) {
      console.warn(`Skipping ${p.name} — unknown city ${p.city}`)
      continue
    }
    const existing = await prisma.pendingAidPoint.findFirst({
      where: { name: p.name, municipioId },
    })
    if (existing) {
      skipped++
      continue
    }
    await prisma.pendingAidPoint.create({
      data: {
        municipioId,
        kind: p.kind,
        name: p.name,
        address: 'address' in p ? p.address : undefined,
        needsText: 'needs' in p ? p.needs : undefined,
        sourceUrl: 'source' in p ? p.source : SOURCE_URL,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint: ${created} created, ${skipped} already present`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
