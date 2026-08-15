/**
 * Pass 34 (2026-08-15) — third research pass on Manizales, run within
 * ~24h of the pass-25 follow-up. A modest pass, as expected: a growing
 * community soup kitchen, a new official Alcaldía donation channel, a
 * batch of pending demolitions, and a blood-bank status update. See
 * wiki/17-allied-resources-and-community.md "Pass 34" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass34-manizales-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Olla Comunitaria Parque Caldas',
      address: 'Parque Caldas, Manizales (carpas instaladas allí); segundo punto planeado en la Calle 30',
      phone: null,
      needsText: 'Donaciones de alimentos y voluntarios para una olla comunitaria que creció de ~200 a ~1,000 comidas diarias en cuatro días, organizada por Jhon Jarry Ángel (óptico) junto con vendedores ambulantes convertidos en cocineros solidarios.',
      sourceUrl: 'https://x.com/lapatriacom/status/2088488297681088749',
      sourceOrg: 'Periódico La Patria',
      submitterNote: 'Reportado por La Patria, diario establecido de Manizales, con escala concreta y creciente (200→1,000 comidas/día, 6→40 voluntarios) y un segundo punto planeado - no es un llamado genérico.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fondo Solidario Comunitario - Cámara de Comercio de Manizales por Caldas',
      address: 'Donaciones en especie: Coliseo Menor de Manizales, entrada A, Avenida Lindsay',
      phone: null,
      needsText:
        'Canal oficial de donación monetaria anunciado por la Alcaldía de Manizales (alcalde Jorge E. Rojas G.) para transferencias bancarias nacionales e internacionales, gestionado por la Cámara de Comercio de Manizales por Caldas: Banco Davivienda, cuenta corriente 0560085569997514, SWIFT CAFECOBB, NIT 8908010426. También dirige donaciones en especie al Coliseo Menor (entrada A): sal, aceite, café, chocolate, pasta, leche en polvo y en caja, cepillos de dientes, desodorante, toallas higiénicas, pañitos húmedos, jabón de ropa y de loza, shampoo y jabón de bebé, máquinas de afeitar, Nestum, coladas, teteros, enlatados, bolsas resistentes.',
      sourceUrl: 'https://www.instagram.com/p/DcCQTLLJuAy/',
      sourceOrg: 'Alcaldía de Manizales + Cámara de Comercio de Manizales por Caldas',
      submitterNote:
        'Corroborado en dos plataformas: el post de Instagram del propio alcalde y de la cuenta oficial de la Alcaldía (con los datos bancarios/SWIFT) y un post separado de Facebook (facebook.com/CiudadManizales) con la lista detallada de insumos físicos para el mismo punto (Coliseo Menor) - se fusionaron en una sola entrada por tratarse de la misma iniciativa.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: manizales.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: manizales.id,
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

  const socialPosts = [
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ninjitametal/status/2088475098315374686',
      authorHandle: '@ninjitametal (vía La Patria)',
      category: 'OFFICIAL' as const,
      placeName: 'Barrio Milán, Manizales',
      note: 'Al menos ocho edificios serían demolidos en el barrio Milán tras el terremoto - avanzan los permisos correspondientes.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCJ8fhxfQE/',
      authorHandle: 'hemocentrodelcafe',
      category: 'OFFICIAL' as const,
      placeName: 'Hemocentro del Café - Cancha Auxiliar, Manizales',
      note: 'Actualización del llamado a donación de sangre ya sembrado: el Hemocentro del Café cerró la recepción de donantes el viernes y retoma el sábado a las 8am, aceptando solo tipos O+ y O- (los grupos A/AB/B ya fueron reabastecidos).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1304079204941001',
      authorHandle: 'Tu Canal Manizales',
      category: 'NEED' as const,
      placeName: 'Coliseo Mayor Jorge Arango Uribe, Manizales',
      note: 'Seguimiento en terreno de las denuncias sobre condiciones de alimentación, cobijas y cuidado para las familias damnificadas que siguen en el albergue temporal del Coliseo Mayor - continuación del reporte de condiciones del albergue ya documentado en la pasada 25.',
    },
  ]

  let postsCreated = 0
  for (const p of socialPosts) {
    const existing = await prisma.pendingSocialPost.findFirst({ where: { permalink: p.permalink } })
    if (existing) continue
    await prisma.pendingSocialPost.create({
      data: {
        platform: p.platform,
        permalink: p.permalink,
        authorHandle: p.authorHandle,
        category: p.category,
        municipioId: manizales.id,
        placeName: p.placeName ?? undefined,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    postsCreated++
  }
  console.log(`PendingSocialPost: ${postsCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
