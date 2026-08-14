/**
 * One-off loader for pass 11 (2026-08-14) — directly targeted social search
 * (X + Facebook) for Buenaventura and Popayán, our two newest/most-neglected
 * tracked cities, which had only been found via allied-site datasets, not
 * social media directly. Run once via
 * `npx tsx prisma/seed-pass11-buenaventura-popayan.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '19001' } })

  // ── Pending aid points ──────────────────────────────────────────────
  const aidPointDefs = [
    {
      name: 'Centro de Acopio — Centro Comercial Único',
      municipioId: buenaventura.id,
      address: 'Centro Comercial Único, Torre 1, Local 48, Buenaventura',
      sourceUrl: 'https://x.com/GobValle/status/2087903259146981569',
      note: 'Anunciado por la Gobernación del Valle del Cauca (@GobValle, cuenta oficial verificada) — recibe donaciones para las familias afectadas de Buenaventura y Dagua. Dagua no está en nuestra tabla de municipios (mención secundaria, un solo punto) — no se agrega como municipio separado.',
    },
    {
      name: 'Punto de acopio Zacarías Río Dagua',
      municipioId: buenaventura.id,
      address: 'Calle 7C #56-14, barrio Margarita Hurtado, Buenaventura',
      sourceUrl: 'https://www.facebook.com/soydebuenaventura/posts/pfbid02fCvgcmegZP7gb69vKjuffHB4o9LJtAh1deJfz7CiXqsaa6NEoAhEme26bCciENZkl',
      note: 'Página comunitaria verificada "Soy de Buenaventura" — apoyo específico para el corregimiento rural de Zacarías Río Dagua, gravemente afectado. Tablas y tejas, colchonetas, ropa, agua, alimentos no perecederos. Líneas: 323 487 6029, 318 434 3831, 316 190 5791.',
    },
    {
      name: 'CRIC Popayán',
      municipioId: popayan.id,
      address: 'Calle 1 #4-50, Popayán',
      sourceUrl: 'https://x.com/CNTI_Indigena/status/2087684094696083915',
      note: 'Consejo Regional Indígena del Cauca (CRIC), vía la Comisión Nacional de Territorios Indígenas (@CNTI_Indigena, cuenta oficial verificada — "Espacio nacional de concertación entre las Organizaciones Indígenas y el Estado colombiano"). Parte de la campaña "La solidaridad se hace Minga". Tercer punto identificado en Popayán.',
    },
  ] as const

  let aidCreated = 0
  for (const p of aidPointDefs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: p.municipioId } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: p.municipioId,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: p.sourceUrl,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    aidCreated++
  }
  console.log(`PendingAidPoint: ${aidCreated} created`)

  // ── Community embeds ─────────────────────────────────────────────────
  const socialPosts = [
    {
      platform: 'X',
      permalink: 'https://x.com/GobValle/status/2087903259146981569',
      authorHandle: '@GobValle',
      category: 'AID_POINT',
      municipioId: buenaventura.id,
      placeName: 'Centro de Acopio — Centro Comercial Único',
      note: 'Gobernación del Valle del Cauca, cuenta oficial verificada. Centro de acopio para Buenaventura y Dagua.',
    },
    {
      platform: 'X',
      permalink: 'https://x.com/CNTI_Indigena/status/2087684094696083915',
      authorHandle: '@CNTI_Indigena',
      category: 'AID_POINT',
      municipioId: popayan.id,
      placeName: 'CRIC Popayán + 4 puntos indígenas en Bogotá',
      note: 'Comisión Nacional de Territorios Indígenas, cuenta oficial verificada, campaña "Minga Humanitaria por la Vida". Lista 5 puntos de acopio de organizaciones indígenas: CRIC en Popayán (Calle 1 #4-50) y 4 en Bogotá (ONIC, Gobierno Mayor, Casa del CRIC, CRIC Nacional) — Bogotá no está en nuestra tabla de municipios, no se generaron aid points separados para esos.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/soydebuenaventura/posts/pfbid02fCvgcmegZP7gb69vKjuffHB4o9LJtAh1deJfz7CiXqsaa6NEoAhEme26bCciENZkl',
      authorHandle: 'Soy de Buenaventura',
      category: 'AID_POINT',
      municipioId: buenaventura.id,
      placeName: 'Punto de acopio Zacarías Río Dagua',
      note: 'Página comunitaria verificada de Buenaventura. Corregimiento rural de Zacarías Río Dagua, gravemente afectado — familias perdieron viviendas y enseres.',
    },
  ] as const

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
        municipioId: p.municipioId,
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
