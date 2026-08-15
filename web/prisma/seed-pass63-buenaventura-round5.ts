/**
 * Pass 63 (2026-08-15) — round 5 continues, Buenaventura. Prior rounds
 * (passes 6, 11, 12, 19, 28, 40, 50) already covered this city
 * exhaustively — three of this round's five "new" leads turned out to
 * already be on file: the Fundación Vanguardia Pacífica Vaki campaign
 * (seeded twice already, passes 19 and 50), LaCasita Azul (pass 50), and
 * FOCUSA (pass 28, down to the identical phone numbers, GoFundMe link,
 * and bank account). None re-seeded here.
 *
 * The headline story this round is the Manos Visibles impersonation risk
 * flagged back in pass 50, which has gotten materially WORSE, not
 * better: the org's own QR/Nequi donation link is confirmed still broken
 * (comments as recent as ~4 hours before this pass), and at least six
 * different Nequi numbers are now circulating under the org's name
 * across multiple accounts — up from "at least three" at pass 50. The
 * org's legitimate channel remains unchanged: web.afrus.org (PSE/credit
 * card), linked from linktr.ee/manosvisibles. Separately, Manos Visibles
 * itself formally launched a named "Fondo de Reconstrucción S.O.S.
 * Pacífico" and reports 25 of a 100-home recovery goal reached — no
 * individual post permalink could be captured for this, so it's
 * documented in the wiki narrative only, not seeded as a database row.
 *
 * Two new, distinct scam patterns also surfaced: a "Buenaventura Renace"
 * appeal from a personal Facebook profile directing donors to a US bank
 * account and Zelle number (a materially more concerning cross-border
 * wire pattern than the Nequi confusion), and a warning about people
 * impersonating a shelter called "Albergue de Rita."
 *
 * Road-corridor status (closed again, second consecutive day, per
 * multiple outlets) and the death toll (climbing nationally, but wildly
 * inconsistent for Buenaventura specifically across same-day sources)
 * are both documented in the wiki narrative rather than forced into a
 * database row, since no agent captured a genuine individual-post
 * permalink for the road status, and the toll figures don't converge
 * cleanly enough to log as a TollRecord.
 * See wiki/17-allied-resources-and-community.md "Pass 63" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass63-buenaventura-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Giraldo Trucks Colombia — punto de recolección',
      address: 'Diagonal 16 #90-95, Parqueadero Playón 1',
      phone: '316 609 2549',
      needsText: 'Alimentos no perecederos y productos de aseo, cobijas/mantas/colchonetas, suministros de primeros auxilios, recolectados por una empresa de transporte para envío a Buenaventura.',
      sourceUrl: 'https://www.instagram.com/p/Db698ySAYId/',
      sourceOrg: 'Giraldo Trucks Colombia',
      submitterNote: 'Cuenta establecida de una empresa de transporte real (3,122 likes, comentarios de nombres reales agradeciendo la iniciativa), no un llamado anónimo — dirección y teléfono concretos.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'WestCol & DFZM — bodega de donaciones (Buenaventura)',
      address: 'Cra 43f #14A-120, DYPA Films, Barrio Manila, Buenaventura',
      phone: null,
      needsText: 'Punto de recolección de ayudas generales; los streamers WestCol y DFZM planean distribuir la ayuda el lunes 18 de agosto. Responsables en sitio nombrados: Carolina Giraldo, Luis Patiño.',
      sourceUrl: 'https://www.tiktok.com/search?q=Buenaventura%20vaki%20recaudo',
      sourceOrg: null,
      submitterNote: 'Dirección concreta y dos responsables nombrados en una publicación de TikTok (2 horas de antigüedad), ligada a dos figuras públicas (WestCol, DFZM) confirmadas de forma independiente por otras publicaciones de TikTok como físicamente presentes en Buenaventura repartiendo ayuda esta semana. No verificado más allá de redes sociales.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: buenaventura.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
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
      permalink: 'https://www.instagram.com/p/Db_2RcXgAYu/',
      authorHandle: 'manosvisibles',
      category: 'NEED' as const,
      placeName: 'Buenaventura, Valle del Cauca',
      note: 'RIESGO EMPEORADO: el enlace QR/Nequi de Manos Visibles sigue confirmado como desactivado (comentarios de hace apenas ~4 horas: "el QR... dice que está desactivado"). Una búsqueda cruzada de esta misma pasada encontró AL MENOS SEIS números Nequi distintos circulando bajo el nombre "Manos Visibles" en la última semana (3135834185, 3145668225 a nombre de "Milton Giraldo", 900988179, 3117796540, 3024910444, 3228753126 a nombre de "Isabella Luna") — más que los "al menos tres" de la pasada 50, incluyendo un enlace visiblemente corrupto. El canal legítimo de la organización sigue siendo el mismo: web.afrus.org / linktr.ee/manosvisibles (PSE/tarjeta de crédito) — NO usar ningún número Nequi que reclame representar a la organización. Por separado, Manos Visibles lanzó formalmente un "Fondo de Reconstrucción S.O.S. Pacífico" y reporta 25 de una meta de 100 viviendas recuperadas (Cambio, medio verificado) — sin un permalink individual capturable para esa actualización.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/viridiana.morlan.94/posts/pfbid035kUsnFYFNmRDD6SGCWcNkqoXJX1a1LMSNpDJvpR3pAv52FDyQqmdK2QjzpettmV2l',
      authorHandle: 'Torres Vaquerita (perfil personal: viridiana.morlan.94)',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'NUEVO PATRÓN DE ESTAFA, más grave que la confusión de Nequi de Manos Visibles: una campaña "Buenaventura Renace" publicada desde un perfil personal de Facebook (con nombre de pantalla no coincidente) pide donaciones a una cuenta de Bank of America en EE.UU. (cuenta 488124610367, routing 111000025) y un número Zelle de Houston (832 808 8087), atribuyéndose respaldo de "organizaciones, empresas y entidades de Estados Unidos y Colombia" sin nombrar ninguna. Imita el estilo gráfico profesional de campañas legítimas sin ninguna infraestructura de rendición de cuentas. NO es un canal de donación recomendado.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBhs8ZSvLx/',
      authorHandle: 'clasificadosbtura',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Alerta de un clasificado local: personas inescrupulosas están solicitando/recibiendo dinero a nombre del albergue "Albergue de Rita", aprovechando el terremoto. La publicación afirma que el único Nequi autorizado es 321 761 6268 / Óscar Alzate — esa afirmación en sí no está verificada de forma independiente (la cuenta que la publica es pequeña), pero la alerta de suplantación es el hallazgo relevante: no transferir dinero a colectores no verificados en nombre de este albergue.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBV-gUSlmW/',
      authorHandle: 'farathsuarez',
      category: 'NEED' as const,
      placeName: 'Barrio Alberto Lleras Camargo, Buenaventura',
      note: 'Casas siguen colapsando activamente en el barrio Alberto Lleras Camargo, calle "Mi Ruñidera" — publicación con fotos de una casa de madera de varios pisos inclinada. Pide explícitamente más "patólogos estructurales" (ingenieros estructurales), ya que los disponibles en la ciudad no alcanzan a cubrir todas las viviendas en riesgo, dado que una casa colapsando pone en peligro también a las vecinas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/EnterateCali/status/2088758056603594754',
      authorHandle: '@EnterateCali',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El Ministro del Interior, Rodrigo Lara, pidió a los operadores de telefonía móvil donar planes de datos para unos 2.800 niños de Buenaventura que quedaron sin clases presenciales por daños del terremoto, proponiendo educación virtual durante la reconstrucción. Es una solicitud/propuesta — no hay evidencia de que los planes de datos ya se estén entregando.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/morsolin1/status/2088748687379857561',
      authorHandle: '@morsolin1 (citando entrevista de @barricadatv a @ami_rossih)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura',
      note: 'Una lideresa afrocolombiana de Buenaventura calificó de "cruel" la respuesta del gobierno nacional por militarizar la zona mientras, según ella, aún hay personas bajo los escombros. Es una caracterización política/retórica de una entrevista crítica, no un reporte verificado de operaciones de rescate — tratar la afirmación literal con cautela aunque la publicación en sí sea real y rastreable.',
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
        municipioId: buenaventura.id,
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
