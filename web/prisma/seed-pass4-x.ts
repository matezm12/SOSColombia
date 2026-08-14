/**
 * One-off loader for pass 4 (2026-08-14) — direct X/Twitter search via the
 * user's own logged-in browser session, since WebSearch/WebFetch cannot
 * index X at all (confirmed across passes 2-3). See
 * wiki/17-allied-resources-and-community.md "Pass 4" for context.
 * Run once via `npx tsx prisma/seed-pass4-x.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })

  const socialPosts = [
    {
      platform: 'X',
      permalink: 'https://x.com/ElOpinometro_/status/2088098286062436358',
      authorHandle: '@ElOpinometro_',
      category: 'AID_POINT',
      municipioId: null,
      placeName: 'Fundación Luis Díaz — acopio en Barranquilla',
      note: 'El futbolista Luis Díaz se sumó a las ayudas para damnificados a través de su Fundación — centro de acopio habilitado en Barranquilla para alimentos no perecederos, kits de aseo e insumos médicos. Barranquilla no está en nuestra tabla de municipios (fuera de la zona roja) — sin municipioId. Confianza alta (figura pública verificada).',
    },
    {
      platform: 'X',
      permalink: 'https://x.com/Power69ful/status/2088080149598117916',
      authorHandle: '@Power69ful',
      category: 'AID_POINT',
      municipioId: pereira.id,
      placeName: 'Centro Comercial San Façon',
      note: 'Punto de acopio en el Centro Comercial San Façon, Calle 13 #20-90, Pereira — dirección exacta, explícitamente solo artículos ("no se recibe dinero"), reduce riesgo de estafa. Ver también PendingAidPoint del mismo lugar. Cuenta personal genérica — confianza media.',
    },
    {
      platform: 'X',
      permalink: 'https://x.com/Ditu_Tv/status/2088048007119884309',
      authorHandle: '@Ditu_Tv',
      category: 'AID_POINT',
      municipioId: manizales.id,
      placeName: 'Blanco Blanco de Manizales (acopio)',
      note: 'Futbolistas de Once Caldas (Jefry Zapata, Juan Patiño) ayudando en un centro de acopio en representación del programa "Blanco Blanco de Manizales", invitando a apoyar a los damnificados. Cuenta de medios deportivos establecida. Sin dirección exacta — no se generó PendingAidPoint separado. Confianza media-alta.',
    },
    {
      platform: 'X',
      permalink: 'https://x.com/danielgarciacg/status/2088089261081870379',
      authorHandle: '@danielgarciacg',
      category: 'AID_POINT',
      municipioId: null,
      placeName: 'Palacio de los Deportes (Bogotá) — jornada para Chocó',
      note: 'El Palacio de los Deportes (Bogotá) es sede de donaciones para familias afectadas en Chocó, con evento "Récord en Patines - Tren Humano" el domingo 16 de agosto. Bogotá no está en nuestra tabla de municipios — sin municipioId. Confianza media.',
    },
    {
      platform: 'X',
      permalink: 'https://x.com/MalaMMujer/status/2088069168633450904',
      authorHandle: '@MalaMMujer',
      category: 'NEED',
      municipioId: null,
      placeName: 'Punto de acopio en Teusaquillo (Bogotá) — para Caicedonia',
      note: 'Caicedonia (Valle del Cauca) también afectada; organizan un camión de ayuda de primera necesidad, punto de acopio en Teusaquillo, Bogotá. Cuenta verificada pero relaya el esfuerzo de otra organización (instagram.com/elimperiodelas...). Ni Caicedonia ni Bogotá están en nuestra tabla de municipios — sin municipioId. Confianza media.',
    },
  ] as const

  let created = 0
  let skipped = 0
  for (const p of socialPosts) {
    const existing = await prisma.pendingSocialPost.findFirst({ where: { permalink: p.permalink } })
    if (existing) {
      skipped++
      continue
    }
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
    created++
  }
  console.log(`PendingSocialPost: ${created} created, ${skipped} already present`)

  // ── San Façon has a real, specific address — worth a PendingAidPoint too.
  const existingAidPoint = await prisma.pendingAidPoint.findFirst({
    where: { name: 'Centro Comercial San Façon', municipioId: pereira.id },
  })
  if (!existingAidPoint) {
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
        kind: 'ACOPIO',
        name: 'Centro Comercial San Façon',
        address: 'Calle 13 #20-90, Pereira',
        sourceUrl: 'https://x.com/Power69ful/status/2088080149598117916',
        submitterNote: 'Punto de acopio — explícitamente solo artículos, no dinero. Fuente: publicación individual en X, dirección específica verificable.',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingAidPoint: Centro Comercial San Façon (Pereira, ACOPIO)')
  } else {
    console.log('Skipping PendingAidPoint San Façon — already seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
