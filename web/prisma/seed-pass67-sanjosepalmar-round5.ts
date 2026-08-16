/**
 * Pass 67 (2026-08-15) — round 5 continues, San José del Palmar, the
 * earthquake's epicenter. Four prior passes (22, 31, 43, 53) already
 * covered this small, remote town thoroughly, and this round's five
 * agents converged heavily on the same handful of stories — confirming
 * rather than padding. The town's own status figures (missing persons,
 * road access, casualty count) are UNCHANGED from pass 53: still 1
 * person missing (active search), still passable on one lane only,
 * still 2 injured / 0 dead. A single low-engagement resident post
 * claiming the road has "totally collapsed" again directly contradicts
 * the more recent, more authoritative official municipal communiqué —
 * recorded as a contested, unconfirmed claim, not treated as fact.
 *
 * Genuinely new this round: the town's first-ever scam report in five
 * rounds (a national ICBF-impersonation warning that specifically
 * reached this town's own community channels), a cross-municipality
 * solidarity gesture (Girardota "adopting" the town), a departmental
 * reconstruction-manager announcement explicitly tied to this epicenter,
 * a new monetary-donation channel, and the Valentina Jurado Vaki
 * campaign's funding update ($47,334→$47,579, 1,839→1,846 donors),
 * now in its final days before an Aug 19 close.
 * See wiki/17-allied-resources-and-community.md "Pass 67" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass67-sanjosepalmar-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sjp = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const aidPoints = [
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Serraniagua — donaciones económicas para El Cairo (Valle) y San José del Palmar',
      address: null,
      phone: '310 741 1557 (Dahiana Murillo, coordinación)',
      needsText: 'Canal de donación económica vigente: Llave Bancolombia @corpserraniagua, Llave Davivienda @8210008842. Coordinado por Ensifera Nature (Cali) en apoyo a la Sociedad Vallecaucana de Ornitología. El punto físico de acopio en Cali (Carrera 5 #3-76, Barrio San Antonio) ya venció su plazo (14 de agosto, 7:00pm) — solo el canal monetario sigue activo.',
      sourceUrl: 'https://www.instagram.com/p/Db-6wbCDju9/',
      sourceOrg: 'Fundación Serraniagua / Ensifera Nature',
      submitterNote: 'ONG ambiental reconocida en el Valle del Cauca en colaboración con un negocio local identificable en Cali. Beneficia conjuntamente a El Cairo (Valle) y San José del Palmar — no es exclusivo de este municipio, pero lo nombra explícitamente como beneficiario. Confianza media dado que el punto físico ya venció.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: sjp.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: sjp.id,
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
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_C2b1jt4X/',
      authorHandle: 'alcaldiamunicipalsjp',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Segundo reporte consolidado oficial del Consejo Municipal de Gestión del Riesgo (CMGRD), 13 de agosto: 525 familias damnificadas, 2.625 personas afectadas, 40 viviendas colapsadas totalmente, 485 averiadas. SIN CAMBIOS respecto a la pasada 53: 2 lesionados bajo observación, 1 desaparecido (búsqueda activa, aún sin encontrar), 0 muertos, vía principal habilitada a un solo carril únicamente.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/groups/1554323545232595/?multi_permalinks=2004122396919372',
      authorHandle: 'Noticias NVC - Cartago (compartido en el grupo comunitario Noticias NVC San José del Palmar)',
      category: 'NEED' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'PRIMERA ALERTA DE ESTAFA para este municipio en cinco rondas de investigación: la directora del ICBF, María Carolina Restrepo, advierte que delincuentes se hacen pasar por funcionarios del ICBF para pedir dinero en efectivo a nombre de la entidad, aprovechando el terremoto. El ICBF NO pide dinero — ningún funcionario está autorizado a recibir transferencias; las donaciones oficiales solo se canalizan por la oficina de la Primera Dama de la Nación. Es una alerta de alcance nacional, pero fue compartida específicamente en el grupo de noticias comunitario de San José del Palmar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCczZCp37l/',
      authorHandle: 'kevinbernalgirardota',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Girardota, Antioquia / San José del Palmar, Chocó',
      note: 'El alcalde de Girardota (Antioquia) anuncia que su municipio "apadrina" a San José del Palmar, canalizando recaudos de eventos culturales locales (Festival de la Trova, Fiestas del Chicharrón) hacia la reconstrucción del pueblo epicentro. Un residente autoidentificado de San José del Palmar responde agradeciendo directamente en los comentarios.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Guajiritillo/posts/pfbid0wsSNDJsbaaWp2SEnPpQdyfPoWfiV8DxYe8fc3iEZMWTBBECpAFLvHWPtpDdyT27cl',
      authorHandle: 'El Guajiritillo',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó (departamental, epicentro San José del Palmar)',
      note: 'El presidente Abelardo De La Espriella, en visita a Quibdó, anunció que nombrará un "gerente" especial para coordinar las necesidades del Chocó con el gobierno nacional tras el sismo, y propuso un "Plan Marshall" para reconstruir el departamento, citando explícitamente a San José del Palmar como el epicentro del sismo de magnitud 7.4. Corroborado de forma independiente por la revista Cambio. Es un anuncio de alcance departamental, no específico del municipio, pero lo nombra directamente.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/luzstella.ramirez.908/posts/pfbid0J5NaZMqHM5p4cvhT7vbircRtSDg1n2RnEeP7AXiSFgQPxdM3nK6Qq3TYPRRoKe2pl',
      authorHandle: 'Luz Stella Ramirez',
      category: 'NEED' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'AFIRMACIÓN CONTESTADA, no confirmada: publicación de una residente (13 de agosto) dice que el pueblo "sigue abandonada" — sin luz, agua intermitente, viviendas/negocios muy dañados, y que "la vía está totalmente colapsada". Esto CONTRADICE directamente el comunicado oficial más reciente y más autorizado (ver arriba), que reporta la vía habilitada a un solo carril. Publicación de bajo alcance (1 like, 0 comentarios), sin corroboración independiente — se registra como reclamo sin confirmar, no como hecho establecido, para que una pasada futura pueda verificar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db__ca8SBqX/',
      authorHandle: 'culotauro',
      category: 'NEED' as const,
      placeName: 'Cali (colecta de bienes destinados a San José del Palmar)',
      note: 'Creadores de contenido en Cali organizan un camión de suministros físicos (agua, enlatados, linternas, pilas, guantes, jabón, papel higiénico — explícitamente NO dinero en efectivo) para San José del Palmar, afirmando haber coordinado la recepción directamente con la alcaldía vía @alcaldiamunicipalsjp. No se da una dirección física de entrega en el texto de la publicación — tratar como pista a verificar, no como punto de ayuda confirmado.',
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
        municipioId: sjp.id,
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
