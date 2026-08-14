/**
 * One-off loader for the second social-media research pass (2026-08-14) —
 * see wiki/17-allied-resources-and-community.md "Social media search — pass
 * 2". Run once via `npx tsx prisma/seed-social-posts-pass2.ts`.
 *
 * All rows land in PendingSocialPost (origin: AUTOMATION_SWEEP, status:
 * PENDING) — same discipline as every other automated find: needs
 * /admin/comunidad review before it becomes a public, embedded SocialPost.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const posts = [
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/goyo/p/Db4ZFR5pIZ5/',
      authorHandle: '@goyo',
      category: 'NEED',
      municipioId: null,
      placeName: 'Condoto, Chocó (canal de donación vía FUNDESOPA)',
      note: 'Goyo (Gloria Emilse Martínez Perea, ChocQuibTown), oriunda de Condoto, dirige donaciones a su municipio natal — cuenta de ahorros Banco de Bogotá 378-4524-11, contacto 323 367 7799, en alianza con la fundación local FUNDESOPA. Corroborado por Publimetro y Expreso.ec con el mismo número de cuenta. Confianza alta.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/juanma.cuantico/reel/Db9TWxNM3zd/',
      authorHandle: '@juanma.cuantico',
      category: 'NEED',
      municipioId: manizales.id,
      placeName: 'Manuelina (restaurante de Manuela Gómez)',
      note: 'Campaña Vaki (vaki.co/manuelina) para reconstruir "Manuelina", restaurante de pasta de Manuela Gómez en Manizales, destruido en el sismo — meta 20 millones COP. Detalles corroborados por La Patria. Confianza media (no se pudo confirmar independientemente que esta campaña Vaki específica no esté ya en el hub de GoFundMe excluido).',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/reel/Db6QdGrxV5H/',
      authorHandle: '@jhonnyrivera',
      category: 'AID_POINT',
      municipioId: pereira.id,
      placeName: 'Hotel La Rivera',
      note: 'El cantante Jhonny Rivera convirtió su Hotel La Rivera (Calle 20 #3-58, Pereira) en albergue para familias damnificadas y 15 médicos, más punto de acopio físico y código QR para donaciones (con promesa de publicar recibos). Corroborado por 8+ medios (Semana, El Tiempo, Vanguardia, El Heraldo, Publimetro, Infobae, El Universal, Las2Orillas). Ver también PendingAidPoint del mismo hotel — este registro es la publicación específica, no pudimos renderizar el contenido de Instagram directamente en esta sesión. Confianza media-alta.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db92nGfNyBf/',
      authorHandle: '@fundacionkenovycolombia',
      category: 'NEED',
      municipioId: armenia.id,
      placeName: 'Fundación Kenovy (refugio de +300 perros)',
      note: 'Refugio canino en Vereda Altos de los Guevara (~15 min de Armenia) sufrió colapso parcial de techo, muros y jaulas. Solicitan malla eslabonada, casetas, tejas, insumos de aseo y alimento; 400+ voluntarios se presentaron, ahora limitan visitas a 20/día por riesgo estructural. Verificado directamente en la cuenta (56K seguidores, fundación establecida) y corroborado en detalle idéntico por El Tiempo y Semana. Confianza alta.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/reel/Db4hOgLgM6Y/',
      authorHandle: '@yuri_copete',
      category: 'HUMAN_INTEREST',
      municipioId: quibdo.id,
      placeName: null,
      note: 'Yury Copete (Miss Universe Chocó 2020), desde el exterior, compartió video el día del sismo mostrando su casa familiar en Quibdó destruida — "perdimos nuestra casa" — confirmando que familiares/amigos están ilesos, y pidió que la ayuda institucional priorice a familias chocoanas. Contenido confirmado directamente y corroborado por 5 medios (Pulzo, El Tiempo, Infobae, Publimetro, El País). Confianza alta.',
    },
  ] as const

  let created = 0
  let skipped = 0
  for (const p of posts) {
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

  // ── Hotel La Rivera also functions as a real shelter — worth a
  // PendingAidPoint alongside the social-post embed above. ────────────────
  const existingAidPoint = await prisma.pendingAidPoint.findFirst({
    where: { name: 'Hotel La Rivera', municipioId: pereira.id },
  })
  if (!existingAidPoint) {
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
        kind: 'ALBERGUE',
        name: 'Hotel La Rivera',
        address: 'Calle 20 #3-58, Pereira',
        sourceUrl: 'https://www.instagram.com/reel/Db6QdGrxV5H/',
        submitterNote:
          'Hotel del cantante Jhonny Rivera, convertido en albergue gratuito para familias damnificadas y 15 médicos, más punto de acopio. Corroborado por 8+ medios colombianos (Semana, El Tiempo, Vanguardia, El Heraldo, Publimetro, Infobae, El Universal, Las2Orillas).',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingAidPoint: Hotel La Rivera (Pereira, ALBERGUE)')
  } else {
    console.log('Skipping PendingAidPoint Hotel La Rivera — already seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
