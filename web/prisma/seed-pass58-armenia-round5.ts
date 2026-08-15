/**
 * Pass 58 (2026-08-15) — round 5 continues, Armenia. Four prior rounds
 * (passes 17, 26, 35, 48) covered this city exhaustively, so this pass's
 * yield is mostly status confirmations plus a handful of genuinely new
 * finds. Caught FIVE false "new" leads that were actually already-seeded
 * duplicates from earlier passes: Centro de Convenciones de Armenia
 * (pass 17), OVNI Club (pass 26), Fundación Covida's Vaki (pass 17,
 * already confirmed funded/rebuilding by pass 35), the Karol Sofia
 * Perdomo Muñoz and Jenny Fabiana Salazar Londoño GoFundMe campaigns
 * (both pass 48), and the "Punto de acopio para Pijao" at Cra 16 #12-27
 * Local 9 (pass 48, identical address AND identical Instagram permalink)
 * — none re-seeded here. Also skipped a GoFundMe titled "Terremoto
 * armenia, reconstruir casa" that two of the five agents independently
 * flagged as actually benefiting Calarcá, not Armenia (a mislabeling
 * pattern already caught twice before, in passes 17 and 26).
 *
 * Death toll: multiple agents surfaced a "tres fallecidos en el Quindío"
 * figure (up from Armenia's confirmed 1/134 from pass 48), but it is a
 * DEPARTMENT-wide figure that could not be pinned to Armenia specifically
 * — two of five agents explicitly rejected it as unreliable/unattributable.
 * NOT logged as a TollRecord; flagged instead via a social post and in the
 * wiki for a dedicated Armenia-specific follow-up verification.
 *
 * Missing-persons case (Cristian Camilo Arango Marín, open since pass 48)
 * is now genuinely CONTESTED across sources: the family's own Facebook
 * channel (already on file since pass 48, same permalink, so not
 * re-seeded) was still actively soliciting help as of this pass; a
 * crowdsourced tracker (encontrados.co) shows a "La tengo conmigo" found
 * entry; a second crowdsourced tracker (colombiatebusca.com) still shows
 * "Por localizar." Documented as an open contradiction in the wiki, not
 * asserted resolved.
 *
 * New this pass: a rent-gouging/predatory-pricing pattern targeting
 * displaced families (up to 50% rent hikes), a new residential complex
 * (Las Brisas) with families still in tents, a new official debris-
 * disposal measure starting Aug 16, and a concrete legal explainer on
 * how to access the (still not-yet-disbursed-in-Armenia) rental subsidy.
 * See wiki/17-allied-resources-and-community.md "Pass 58" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass58-armenia-round5.ts`.
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
      kind: 'ACOPIO' as const,
      name: 'Fundación Daniella Sarmiento C. — jornada humanitaria niños y mascotas',
      address: 'Carrera 14A No. 27N-62, frente al Parque Aborígenes, Armenia, Quindío',
      phone: 'WhatsApp 315 550 2779',
      needsText: 'Donaciones en especie para niños y mascotas afectados; horario 9:00am-12:00pm y 2:00-5:00pm. También reciben donación económica: Davivienda cuenta de ahorros No. 138000057800, NIT 901345292-3, a nombre de Fundación Daniella Sarmiento C.',
      sourceUrl: 'https://www.instagram.com/p/DcC8z-Bx5n4/',
      sourceOrg: 'Fundación Daniella Sarmiento C.',
      submitterNote: 'Fundación nombrada con dirección concreta, horario definido, contacto de WhatsApp y cuenta/NIT bancario específico; publicación de hace 17 horas al momento de la verificación.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Ayúdanos a reconstruir nuestra casa después del terremoto (Katherin y Joan)',
      address: null,
      phone: null,
      needsText: 'Fondos de reconstrucción de vivienda para una familia específica (Katherin y Joan) en Armenia, cuya casa resultó dañada el 10/08/2026.',
      sourceUrl: 'https://vaki.co/vaki/ayudanos-a-reconstruir-nuestra-casa-despu-s-del-terremoto',
      sourceOrg: null,
      submitterNote: 'Nombres específicos, dirección en Armenia, Quindío, y fecha del incidente coinciden con el sismo. El agente que la encontró no pudo confirmar con certeza si se solapa con una campaña ya sembrada; se revisó el histórico del wiki y de las cuatro pasadas anteriores de Armenia sin encontrar coincidencia, por lo que se incluye aquí, pero queda señalada para que quien modere confirme unicidad si detecta algo.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Colombia, Armenia Quindio Recover (Nicolas Montes Herrera)',
      address: null,
      phone: null,
      needsText: 'Necesidades básicas, reparaciones de vivienda y apoyo de recuperación familiar para víctimas del terremoto en Armenia, Quindío.',
      sourceUrl: 'https://www.gofundme.com/f/help-armenia-and-quindio-recover',
      sourceOrg: null,
      submitterNote: 'Confianza alta: campaña creció de USD $1,885 (captura en caché) a $6,580 de una meta de $12,000 con 29 donantes al momento de la verificación, con actividad reciente compartida repetidamente por otros usuarios de Facebook en los últimos días. No encontrada en ninguna pasada anterior.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help for Armenia, Colombia Earthquake (Juliana Hurtado)',
      address: null,
      phone: null,
      needsText: 'Arroz, fríjoles, aceite, enlatados, agua y otros víveres para familias afectadas, distribuidos a través de dos contactos locales de confianza en Armenia.',
      sourceUrl: 'https://www.gofundme.com/f/help-for-armenia-colombia-earthquake',
      sourceOrg: null,
      submitterNote: 'Organizadora Juliana Hurtado, originaria de Armenia, ahora en Melbourne, Australia, coordinando con contactos locales nombrados. Campaña creada el 13 de agosto; pequeña pero activa (AUD $430 de meta AUD $4,000, 7 donantes). No encontrada en ninguna pasada anterior.',
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
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02Pc82PNbCY5N1y3oPy8rA3prUnvX3zDxhwN7HMoAUtAtWh2QfX7DZnw3LRjD4NFnjl&id=61574909973919',
      authorHandle: 'NC Quindío',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo del Sur, Armenia',
      note: 'ACTUALIZACIÓN DE ESTADO (Aug 15): el albergue Coliseo del Sur sigue cerca de su límite — 56 familias (150-200 personas), "una cifra que roza el límite estimado" — sin cambio respecto a la pasada 48. El Subsecretario de Desarrollo Social, Chalo Betancourt, confirmó alojamiento, alimentación, saneamiento, kits de higiene y apoyo médico/psicosocial continuos; la Alcaldía evalúa abrir un SEGUNDO albergue. Cupos restringidos a residentes de Armenia con Sisbén y daño estructural confirmado. La misma publicación reporta arriendos cercanos disparados a ~$2.5M COP/mes. Corroborado independientemente por El Quindiano. Un comentario en un post relacionado (angie_cortes99, sobre https://www.instagram.com/p/Db9o2VgRbnp/) nombra un caso individual: William Uriel Cardona, adulto mayor desplazado por daños a su vivienda y previamente víctima de desplazamiento por conflicto, sin familia en la ciudad, necesita vivienda/alimentación — Calle 6 N #17-12, Barrio Profesionales, Armenia, tel. 301 821 1087.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/carolina.hortua.92/posts/pfbid0RJQrNzkXW1FTCvReNnTUWihD2AeHGncNSGzfzTs2jZBVoKBAo81ieqa49Wf9D1NEl',
      authorHandle: 'Carolina Hortúa (compartiendo una publicación de Finito)',
      category: 'NEED' as const,
      placeName: 'Quindío (incl. Armenia)',
      note: 'Patrón de especulación de arriendos: el medio local "Finito" reporta arrendadores subiendo precios hasta un 50% en el Quindío tras el terremoto, aprovechando la necesidad urgente de vivienda de las familias desplazadas ("SE APROVECHAN DE LA NECESIDAD: DENUNCIAN ALZAS DEL 50% EN ARRIENDOS"). Corrobora, con una fuente y URL distintas, el mismo fenómeno ya reportado en la pasada 48 vía Instagram (apuntesdekt).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ElQuindianoNoticias/posts/pfbid02UcBbgRXWSowqY47Ta659korPF17dPGcZtkWvgnB9Cu4seZKvD54yBbQnLUPLxExtl',
      authorHandle: 'El Quindiano',
      category: 'NEED' as const,
      placeName: 'Conjunto Residencial Las Brisas, Armenia',
      note: 'UBICACIÓN NUEVA, no cubierta en pasadas anteriores: 15-20 familias del conjunto residencial Las Brisas siguen viviendo en carpas dentro del conjunto tras daños a sus apartamentos por el sismo del 10 de agosto — foto muestra carpas instaladas en una zona común/parque infantil.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@hardtabogados/video/7673147707762150673',
      authorHandle: '@hardtabogados',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia (también Cali, Pereira, Manizales, Quibdó)',
      note: 'Explicación legal gratuita, paso a paso (8 pasos con enlaces/teléfonos oficiales por ciudad): un subsidio de arriendo, una transferencia única de $500,000 COP, y 3 meses de servicios públicos gratuitos ya están disponibles para quienes quedaron sin vivienda por el sismo, condicionado a inscribirse en el censo de damnificados del municipio. Declara explícitamente no cobrar por la orientación. Video distinto al ya sembrado en la pasada 48 del mismo canal (@hardtabogados), que advertía que el Decreto 1171 solo aplaza el arriendo y no lo condona.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/QuindioNoticias/posts/pfbid02ghkSFbap8XEFFYy1BdMMWo4MW6W7iJSjHVWtPxmnxqMdoaBhBD7hMpxUvJGX5nQXl',
      authorHandle: 'Quindío Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia, Quindío',
      note: 'DESARROLLO DE FASE DE RECONSTRUCCIÓN: la Alcaldía de Armenia habilita, a partir del domingo 16 de agosto, puntos gratuitos para que los residentes dispongan de escombros del terremoto — primera medida de gestión de escombros encontrada en esta investigación, corroborada por múltiples medios locales (Quindío Noticias, Alerta Armenia, Quindío 24 Horas) con detalles consistentes.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/940889944950836',
      authorHandle: 'Alerta Armenia',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío (departamental)',
      note: 'CIFRA CONTESTADA, NO CONFIRMADA PARA ARMENIA ESPECÍFICAMENTE: boletín en video (Aug 15) reporta "19.855 damnificados, TRES fallecidos, 235 lesionados, 1.508 viviendas colapsadas y 17.248 afectadas" a nivel del Quindío. Esta cifra de tres fallecidos apareció repetida por varias cuentas (TQ Transmisora Quindío, enteratecali, noticiascircasia) citando al parecer el mismo boletín de UNGRD del 15 de agosto, pero es una cifra DEPARTAMENTAL, no específica de Armenia — dos de los cinco agentes de esta pasada la rechazaron explícitamente por no poder atribuirla con certeza al municipio (otros municipios del Quindío como Calarcá, Quimbaya y Circasia también sufrieron daño). NO se registra como TollRecord de Armenia; queda aquí señalada para una verificación específica y oficial (Alcaldía de Armenia o UNGRD) en una pasada futura. El último TollRecord confirmado para Armenia sigue siendo el de la pasada 48 (1 fallecido / 134 heridos).',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcEdjjKstRE/',
      authorHandle: 'cuenta personal (Nequi 310 468 2814 / Llave @LMF974)',
      category: 'NEED' as const,
      placeName: 'Armenia / Pereira y zonas rurales',
      note: 'Recolecta de juguetes, cuadernos, colores y útiles escolares para niños afectados en Armenia, Pereira y zonas rurales; publicación de hace solo 3 horas al momento de la verificación (muy reciente), pero es una cuenta individual, no una organización establecida, y los puntos físicos de acopio solo se comparten de forma privada por DM. Se incluye con esta salvedad explícita de riesgo de cuenta personal — mismo tipo de precaución aplicado a un hallazgo similar en la pasada 57 (Manizales) — en vez de descartarla o tratarla como un canal de donación verificado.',
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
