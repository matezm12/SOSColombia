/**
 * Pass 80 (2026-08-16) — round 6 continues, Ibagué. This is Ibagué's
 * third overall research pass (after 59/municipio-add, 60/deep,
 * 66/tiktok-retry), closing out round 6 across all twelve tracked
 * cities.
 *
 * Two new aid points: a university-run collection point (Universidad
 * del Tolima's Sede Centro campus), and — a first for this city — a
 * VET-category point, a veterinary clinic collecting supplies for
 * animals affected by the regional wildfires. The clinic was found
 * independently by two agents citing the same El Nuevo Día article,
 * strong corroboration. A third candidate (a private citizen's home
 * in barrio Santa Ana collecting baby/pregnancy supplies) is NOT
 * seeded: the goods are personally driven out to Pereira and the Eje
 * Cafetero, not kept for Ibagué's own displaced residents — noted in
 * the wiki as a solidarity story, not an Ibagué aid point.
 *
 * First-ever Ibagué TollRecord: 200+ official educational institutions
 * affected, shifted to virtual classes pending structural evaluation —
 * a direct mayoral quote that maps cleanly onto CENTROS_EDUCATIVOS_
 * AFECTADOS, unlike the department's other Aug-14 figures (350+
 * buildings *inspected*, 8 hikers rescued unharmed from a landslide),
 * which are real but don't fit any TollMetric and are left to the wiki
 * narrative, continuing the discipline set in pass 60.
 *
 * Wildfire status: Ibagué/barrio Picaleña is conspicuously absent from
 * every current Tolima active-fire list found this round (three
 * independent same-day sources), suggesting but not confirming
 * containment — no source explicitly declares it controlled or
 * extinguished, so this is recorded as an inference in the wiki, not a
 * status change in the database.
 * See wiki/17-allied-resources-and-community.md "Pass 80" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass80-ibague-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ibague = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '73001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Universidad del Tolima — Sede Centro (punto de acopio)',
      address: 'Calle 10 con Carrera 5ª (Sede Centro), Ibagué, Tolima',
      phone: null,
      needsText: 'Alimentos no perecederos, kits de aseo, cobijas/ropa de cama y otras donaciones para familias desplazadas por el sismo. Punto activo desde el 13 de agosto, dirigido por estudiantes voluntarios.',
      sourceUrl: 'https://www.instagram.com/unitolima_ut/',
      sourceOrg: 'Universidad del Tolima',
      submitterNote: 'Confirmado vía la cuenta oficial de Instagram de la universidad (@unitolima_ut) y corroborado de forma independiente por elcronista.co (13 de agosto) y extra.com.co (15 de agosto). Distinto de la sede de la universidad en Girardot (otra ciudad). No estaba en la lista previamente sembrada de puntos de acopio de Ibagué.',
    },
    {
      kind: 'VET' as const,
      name: 'La Sierra Clínica Veterinaria de Especialistas — acopio para animales afectados por incendios',
      address: 'Carrera 6 con Calle 28, esquina, Ibagué, Tolima',
      phone: '316 442 1364',
      needsText: 'Agua, sueros y medicamentos veterinarios, gasas, vendas, esparadrapo, jeringas, agujas, alimento para mascotas, cobijas/camas, correas, transportadoras, productos de aseo, guantes, tapabocas, pañales, linternas, pilas, palas y costales — para perros, gatos y otros animales afectados por los incendios forestales en San Luis y Payandé.',
      sourceUrl: 'https://www.elnuevodia.com.co/ibague/veterinarios-en-ibague-reunen-ayudas-para-animales-afectados-por-incendios-538795',
      sourceOrg: 'La Sierra Clínica Veterinaria de Especialistas, con Dr. Vet Center, The Puppyvet y Radiodiagnostic',
      submitterNote: 'Corroborado de forma independiente por dos agentes de esta pasada, ambos citando el mismo artículo de El Nuevo Día (13 de agosto) con los mismos cinco veterinarios nombrados (Zulma Oviedo, Andrés Sierra, Allison Iza, Lina Hernández, Diana Galindo), dirección exacta y teléfono. Primer punto de categoría VET sembrado para Ibagué.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: ibague.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: ibague.id,
        kind: a.kind,
        name: a.name,
        address: a.address ?? undefined,
        phone: a.phone ?? undefined,
        needsText: a.needsText,
        sourceUrl: a.sourceUrl,
        sourceOrg: a.sourceOrg ?? undefined,
        submitterNote: a.submitterNote,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    aidCreated++
  }
  console.log(`PendingAidPoint: ${aidCreated} created`)

  const sourceUrl = 'https://tolima.alerta.com.co/servicios/mas-de-350-edificaciones-inspeccionadas-tras-terremoto-en-ibague-248527'
  const sourceOrg = 'Alcaldía de Ibagué (alcaldesa Johana Aranda) y Sociedad Tolimense de Ingenieros'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 2 } })
    console.log('Created Source: ibague_350inspecciones_200colegios_0814')
  }

  const tollDefs = [
    {
      metric: 'CENTROS_EDUCATIVOS_AFECTADOS' as const,
      value: 200,
      asOf: '2026-08-14T12:00:00-05:00',
      tier: 2,
      notes: 'Primer TollRecord de Ibagué (las pasadas 59/60/66 no encontraron ninguna cifra que encajara limpiamente en el esquema). Cita de la Alcaldía: clases pasaron a modalidad virtual en "más de 200" instituciones educativas oficiales mientras se completa la evaluación estructural, en parte por réplicas continuas. Mismo artículo reporta "más de 350" edificaciones inspeccionadas en total (salto grande frente a la cifra de ~32 sembrada en pasadas anteriores) — esa cifra de inspecciones NO se registra aquí por ser un conteo de proceso (edificios revisados), no un conteo de daño, siguiendo la disciplina ya establecida en la pasada 60.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: ibague.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: ibague.id,
        metric: t.metric,
        value: t.value,
        sourceId: src.id,
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
