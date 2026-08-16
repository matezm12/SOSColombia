/**
 * Pass 72 (2026-08-16) — round 6 continues, Armenia. Five prior rounds
 * (17, 26, 35, 48, 58) covered this city exhaustively, and this round
 * shows it: of roughly a dozen candidate aid points the five agents
 * surfaced, all but two turned out to be duplicates already on file —
 * Coliseo del Sur, Auditorio Ancízar López (CAM), the Diócesis's Banco
 * de Alimentos, Centro de Convenciones de Armenia (pass 17), Fundación
 * Oki Doki (pass 26), the Karol Sofia Perdomo Muñoz GoFundMe (pass 48),
 * and Fundación Daniella Sarmiento C. (pass 58 — last round). One more,
 * the Sociedad Quindiana de Ornitología campaign, is the identical post
 * already seeded under Pijao (pass 68) — a genuinely dual-city campaign,
 * not re-seeded here to avoid double-counting the same real donation
 * point under two cities.
 *
 * What IS new: Fundación Tizu, an elder-care home named in a carousel
 * post since pass 17 but never independently verified until this round
 * — a five-round-old lead finally resolved with a concrete address,
 * phone, and resident count (33, three oxygen-dependent). Also new: a
 * second acopio point (Superautos del Quindío), a fresh repost of the
 * Cristian Camilo Arango Marín missing-persons case (still contested,
 * pass 58) with two commenters independently claiming a sighting near
 * the bus terminal, and the department's "tres fallecidos" figure —
 * flagged as unconfirmed rumor in pass 58 — now officially confirmed via
 * the Gobernación's own 8th emergency bulletin, though still explicitly
 * department-wide, not attributable to Armenia specifically, so still
 * not logged as a TollRecord.
 * See wiki/17-allied-resources-and-community.md "Pass 72" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass72-armenia-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const aidPoints = [
    {
      kind: 'HEALTH' as const,
      name: 'Fundación Tizu (hogar geriátrico) — Vía Montenegro',
      address: 'Vía Montenegro, Armenia, Quindío',
      phone: '312 208 5735',
      needsText: '33 adultos mayores albergados, 3 dependientes de oxígeno; sin energía eléctrica al momento de la publicación. Necesitan pipas de oxígeno, inhaladores, cobijas, alimentos no perecederos y medicamentos específicos (verificar con la fundación antes de entregar).',
      sourceUrl: 'https://www.instagram.com/p/Db8I9rSkZwP/',
      sourceOrg: 'Fundación Tizu',
      submitterNote: 'Institución nombrada desde la pasada 17 (y de nuevo en la 26) solo como parte de un carrusel de pistas sin verificar individualmente — "lista de pistas para una futura pasada". Esta pasada finalmente la verificó con dirección concreta, teléfono y detalles específicos (33 residentes, 3 con oxígeno), resolviendo una pista pendiente desde hace cinco pasadas.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio San José (Superautos del Quindío)',
      address: 'Calle 20 #25-03, sector El Bosque, Armenia, Quindío',
      phone: 'Nequi @NEQUILUI54513',
      needsText: 'Alimentos no perecederos, agua, elementos de aseo e higiene, colchonetas y cobijas; también aporte económico.',
      sourceUrl: 'https://www.instagram.com/p/DcAZlVOtSqk/',
      sourceOrg: 'Superautos del Quindío',
      submitterNote: 'Dirección concreta y negocio anfitrión nombrado; compartido por una cuenta de la diáspora colombiana (Colombianos en Suiza), lo que reduce algo la certeza de verificación directa en terreno, pero el negocio/dirección es concreto y verificable.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0TRpUx1brZJ9EcLTwxBGtShZeYiF8F6BhiSzMPFB81jg1KcHbC7mhbfRM8hKDLZxsl&id=100047441090970',
      authorHandle: 'Entérate Quindío',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Armenia, Quindío',
      note: 'La muerte más cercana a una confirmación específica de Armenia encontrada hasta ahora: Yesica Lorena Céspedes Rondón (34, originaria de Puerto López, Meta) cayó del quinto piso de un edificio cerca de la Cra 18 entre calles 16-17, en pleno centro de Armenia, durante el sismo del 10 de agosto, y murió tres días después en la Clínica La Sagrada Familia de Armenia. El artículo la enmarca como la "tercera" víctima mortal del departamento (tras Quimbaya y Circasia) sin declarar explícitamente que sea "de Armenia" — pero tanto la caída como su muerte ocurrieron físicamente en la ciudad.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ArmeniaEnVivocom/posts/pfbid02MRL2x5LrhNAfZRfBY7aFbUyvBbnpZU51WwjdoypsMKfMLBtPW1RyWAv6bJWrjjrnl',
      authorHandle: 'Armenia En Vivo',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío (departamento)',
      note: 'ACTUALIZACIÓN DE ESTADO de una cifra ya señalada: la cifra de "tres fallecidos en el Quindío", marcada como rumor sin confirmar en la pasada 58, ahora está oficialmente confirmada mediante el octavo boletín de emergencia de la Gobernación (vía UDEGERD, sábado 15 de agosto): 3 muertos, 468 heridos, 25.000+ damnificados, 1.565 viviendas colapsadas totalmente, 18.000+ con daño, además de afectación a 146 colegios, 13 hospitales, 9 alcaldías, 213 corredores viales, 26 puentes, 6 sedes del ICBF y ~440 animales. Sigue siendo una cifra DEPARTAMENTAL, no desglosada por municipio — no se registra como TollRecord de Armenia por esa razón, igual que en la pasada 58.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/lucely.marin.7906/posts/pfbid02wSkofX3UBFh6td4pT8YfZjmca8duY2hpTRcUQ4kWLaL3Ltv7hrgwyCzqVNWQ29GPl',
      authorHandle: 'Lucelly Marín',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío',
      note: 'Nueva publicación "se busca" de la madre (15 de agosto, 12:07am), reconfirmando que Cristian Camilo Arango Marín sigue desaparecido — contradice la cifra de "encontrado" de un rastreador citada en la pasada 58. NUEVO en esta pasada: dos comentaristas (Leidi Yoanna Buritica Marin y Camilo Andres Millan Zuñiga) reportan de forma independiente un posible avistamiento cerca de la terminal de transportes, acompañado de otros dos hombres, uno llamado "Jeferson" — una pista real pero sin confirmar, no una resolución del caso.',
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
        municipioId: armenia.id,
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
