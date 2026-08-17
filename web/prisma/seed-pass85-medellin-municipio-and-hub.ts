/**
 * Pass 85 (2026-08-17) — adds Medellín, Antioquia as a fourteenth tracked
 * municipality, per an explicit, repeated user request: they want it
 * tracked "as equal as the other cities" — its own page, its own hub of
 * points and resources, its own research.
 *
 * IMPORTANT — what makes this addition different from every other
 * tracked city: nothing in this project's research (six-plus rounds
 * across every other city, plus two dedicated passes chasing this exact
 * lead) has ever placed Medellín/Antioquia among the earthquake-affected
 * departments (Chocó, Valle del Cauca, Risaralda, Caldas, Quindío,
 * Tolima only). Medellín was not struck by the Aug 10 quake. It is being
 * added here honestly as a DONOR/LOGISTICS HUB city — a major staging
 * point for aid headed to the Pacific coast (Buenaventura, Chocó) — not
 * as a disaster site. Per the user's explicit instruction this pass
 * still gives it full equal treatment (own page, own aid points, own
 * community posts, own dedicated research pass), but two things are
 * deliberately NOT fabricated to make it "look like" the other cities:
 * - `severityLabel` is left null (no damage occurred here to rate)
 * - `redAlert` is left false
 * - `alertNote` states its hub role plainly rather than implying harm
 * If real earthquake damage to Medellín itself is ever confirmed by a
 * future pass, this note and severity should be revisited.
 *
 * Also re-homes the three Medellín acopio points seeded in pass 84
 * (Red de Mujeres Kambirí, Centro Comercial Tranvía Plaza, Colectivo
 * AfroUdeA) from Buenaventura (the aid's likely destination) to Medellín
 * (their actual physical location) — now that Medellín is trackable,
 * attaching them to where they physically are is more consistent with
 * how every other city's aid points work, and the needsText still notes
 * the Buenaventura/Pacific destination explicitly.
 *
 * DIVIPOLA (05001), population, and coordinates cross-verified across
 * Spanish Wikipedia and citypopulation.de (both agree on the code).
 * Population uses the 2018 DANE census count (2,427,129) rather than a
 * later, less-clearly-sourced projection.
 * Run once via `npx tsx prisma/seed-pass85-medellin-municipio-and-hub.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  let antioquia = await prisma.department.findFirst({ where: { divipolaCode: '05' } })
  if (!antioquia) {
    antioquia = await prisma.department.create({ data: { name: 'Antioquia', divipolaCode: '05' } })
    console.log('Created Antioquia department')
  } else {
    console.log('Antioquia department already exists — no changes made')
  }

  let medellin = await prisma.municipio.findFirst({ where: { divipolaCode: '05001' } })
  if (!medellin) {
    medellin = await prisma.municipio.create({
      data: {
        name: 'Medellín',
        divipolaCode: '05001',
        departmentId: antioquia.id,
        populationDane: 2427129,
        populationAsOf: new Date('2018-01-01'),
        severityLabel: null,
        redAlert: false,
        alertNote:
          'Medellín no fue afectada por el terremoto del 10 de agosto — no hay ninguna investigación de este proyecto que la ubique entre los departamentos con daños. Se sigue aquí como un importante centro logístico/donante: varios puntos de acopio en la ciudad recolectan y despachan ayuda hacia el Pacífico colombiano (Buenaventura, Chocó), coordinados por organizaciones afrocolombianas, universidades y fundaciones locales.',
        lat: 6.2502,
        lng: -75.5676,
      },
    })
    console.log('Created Medellín municipio')
  } else {
    console.log('Medellín municipio already exists — no changes made')
  }

  // Re-home the pass-84 acopio points from Buenaventura to Medellín.
  const buenaventura = await prisma.municipio.findFirst({ where: { divipolaCode: '76109' } })
  const pass84Names = [
    'Red de Mujeres Kambirí — punto de acopio (Medellín, para Buenaventura/Pacífico)',
    'Centro Comercial Tranvía Plaza — punto de acopio (Medellín, para Buenaventura)',
    'Colectivo AfroUdeA — punto de acopio (Universidad de Antioquia, Medellín, para Buenaventura/Pacífico)',
  ]
  if (buenaventura) {
    const { count } = await prisma.pendingAidPoint.deleteMany({
      where: { municipioId: buenaventura.id, name: { in: pass84Names }, status: 'PENDING' },
    })
    console.log(`Removed ${count} pass-84 pending aid points from Buenaventura (re-homing to Medellín)`)
  }

  const aidPoints = [
    {
      name: 'Red de Mujeres Kambirí — punto de acopio',
      address: 'Calle 58 #41-64, Medellín (buscar en Maps como "Carabantú")',
      phone: null,
      needsText: 'Cargue y descarga de ayudas destinadas al Pacífico colombiano — un post de Fundación Juntos Se Puede cita textualmente el corredor de acopio de Medellín "para su traslado hacia Buenaventura"; otras publicaciones enmarcan el mismo corredor como apoyo a Chocó/Pacífico en términos más amplios. Horario desde las 10:00 a.m. Cupo reportado de 50 voluntarios para labores de descarga.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Red Nacional de Mujeres Afrocolombianas Kambirí (redkambiri.org, @red_nal_kambiri)',
    },
    {
      name: 'Centro Comercial Tranvía Plaza — punto de acopio',
      address: 'Carrera 40 #48-95, Local 323, Medellín',
      phone: null,
      needsText: 'Organización y cargue de ayudas para su traslado hacia Buenaventura (cita textual de Fundación Juntos Se Puede). Horario desde las 9:30 a.m.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Centro Comercial Tranvía Plaza (@tranviaplaza_cc), en coordinación con Fundación Juntos Se Puede',
    },
    {
      name: 'Colectivo AfroUdeA — punto de acopio (Universidad de Antioquia)',
      address: 'Universidad de Antioquia, bajos del Bloque 9, Medellín',
      phone: '311 450 5940 (Ximena Hernández)',
      needsText: 'Punto de acopio estudiantil afrodescendiente para el mismo corredor de ayuda hacia el Pacífico, horario 9am-5pm.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Colectivo AfroUdeA, Universidad de Antioquia',
    },
  ] as const

  const submitterNote = 'Compartido directamente por el usuario. Los tres puntos están confirmados de forma independiente en el "Directorio Ayudas Colombia" de Movilizatorio (curaduría dedicada a esta emergencia), con direcciones que coinciden con el texto original recibido por el usuario. Re-domiciliado a Medellín (su ubicación física real) desde Buenaventura (su destino probable) en la pasada 85, ahora que Medellín es una ciudad rastreada — ver la nota de "needsText" de cada punto para el destino específico de la ayuda.'

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: medellin.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: medellin.id,
        kind: 'ACOPIO',
        name: a.name,
        address: a.address ?? undefined,
        phone: a.phone ?? undefined,
        needsText: a.needsText,
        sourceUrl: a.sourceUrl,
        sourceOrg: a.sourceOrg ?? undefined,
        submitterNote,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    aidCreated++
  }
  console.log(`PendingAidPoint: ${aidCreated} created under Medellín`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
