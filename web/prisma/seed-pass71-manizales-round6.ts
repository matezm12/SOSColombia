/**
 * Pass 71 (2026-08-16) — round 6 continues, Manizales. Five prior
 * rounds (16, 25, 34, 47, 57) already covered this city, and this round
 * caught two aid points as duplicates before seeding them: Coliseo Menor
 * de Manizales (already on file since pass 34/47/57 — this round's find
 * that donations there ran out after 2,800 food packages and need
 * replenishing is a genuine status update, folded into the wiki instead
 * of a new row) and the Fondo Solidario Comunitario "Juntos por
 * Manizales" international-wire channel (already seeded pass 16/34).
 *
 * The Homecenter donation-reselling story stays unresolved but gets
 * clarified: this round traced the underlying incident specifically to
 * a Cali store (via content creator "elpikirey"), reinforcing rather
 * than overturning pass 57's conclusion that it's not Manizales-specific.
 *
 * First-ever Manizales-specific TollRecord: prior rounds discussed a
 * "6 muertos / 211 heridos" figure in passing but never actually logged
 * it — checked directly against all five prior seed files and confirmed
 * it was never recorded. Logged now from the Alcaldía's own day-6 (Aug
 * 15) communiqué, verbatim-reproduced across multiple outlets, which
 * also gives Manizales' first housing-damage figures (1,512 homes total
 * loss, 3,993 partial damage).
 *
 * Two new, distinct scam patterns surfaced: a local TikTok creator
 * accused of pocketing earthquake-relief donations for personal rent,
 * and a live-in-progress case (caught ~21 minutes after posting) using
 * a fabricated "GoFundMe is down" excuse to redirect donors to a
 * personal Nequi account.
 * See wiki/17-allied-resources-and-community.md "Pass 71" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass71-manizales-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })

  const sourceDefs = [
    {
      key: 'alcaldia_manizales_dia6_0815',
      url: 'https://www.facebook.com/NotiCaldasInformativo1/posts/pfbid0HiBkJ3R1F6UZFChzGdzpnMw3VuJFrmc1Gx6c1qz6JHTbBk3PCv7SMKrXChzP9CiQl',
      org: 'Alcaldía de Manizales, comunicado día 6 (reproducido por NotiCaldas Informativo, corroborado por La Patria y Andina Noticias Ambientales)',
      tier: 2,
    },
  ] as const

  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    let src = await prisma.source.findFirst({ where: { url: s.url } })
    if (!src) {
      src = await prisma.source.create({ data: { url: s.url, org: s.org, tier: s.tier } })
      console.log(`Created Source: ${s.key}`)
    }
    sources[s.key] = src.id
  }

  const tollDefs = [
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 6,
      sourceKey: 'alcaldia_manizales_dia6_0815',
      tier: 2,
      asOf: '2026-08-15T12:00:00-05:00',
      notes: 'PRIMER REGISTRO DE TOLL específico de Manizales en este proyecto — verificado directamente contra las cinco pasadas anteriores (16, 25, 34, 47, 57): esta cifra se había mencionado de pasada en investigaciones previas pero nunca se había registrado formalmente. Balance oficial de la Alcaldía, día 6 (15 de agosto): 6 fallecidos, 211 heridos, 4.800 solicitudes de revisión estructural, ~2.000 viviendas inspeccionadas, 1.634 predios evaluados (4.000+ personas desplazadas).',
    },
    {
      metric: 'INJURED' as const,
      value: 211,
      sourceKey: 'alcaldia_manizales_dia6_0815',
      tier: 2,
      asOf: '2026-08-15T12:00:00-05:00',
      notes: 'Mismo comunicado oficial del día 6.',
    },
    {
      metric: 'VIVIENDAS_DESTRUIDAS' as const,
      value: 1512,
      sourceKey: 'alcaldia_manizales_dia6_0815',
      tier: 2,
      asOf: '2026-08-15T12:00:00-05:00',
      notes: 'Primer registro de daño habitacional específico de Manizales: 1.512 viviendas con pérdida total según el balance oficial del día 6.',
    },
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 3993,
      sourceKey: 'alcaldia_manizales_dia6_0815',
      tier: 2,
      asOf: '2026-08-15T12:00:00-05:00',
      notes: 'Mismo comunicado oficial del día 6: 3.993 viviendas con daño parcial.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: manizales.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: manizales.id,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)

  const aidPoints = [
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Centro de Promoción Integral San Pedro Claver (hogar de ancianos)',
      address: 'Calle 50 #28-10, Barrio Versalles, Manizales',
      phone: null,
      needsText: 'Hogar de 65 adultos mayores; el edificio sufrió graves daños en el sismo y necesita fondos urgentes para reconstruir. Cuentas: Banco Caja Social - Ahorros 240.222.172-77 (NIT 800094090); Bancolombia - Ahorros 07000008592 (NIT 0092909395).',
      sourceUrl: 'https://www.instagram.com/p/DcEf6riuzWW/',
      sourceOrg: 'Centro de Promoción Integral San Pedro Claver',
      submitterNote: 'Corroborado por dos cuentas de Instagram independientes con 2 días de diferencia, citando el mismo número de cuenta y una dirección física concreta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de atención — Chipre',
      address: 'Frente al Jardín Infantil Santa Bernardita, Chipre, Manizales',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Publicación oficial de la cuenta verificada del alcalde (co-etiquetada con la Alcaldía), duplicada casi textualmente una hora antes desde la misma fuente — uno de 6 puntos de atención vigentes en la ciudad.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de atención — Milán',
      address: 'Frente a Empocaldas, Milán, Manizales',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Misma fuente oficial que el punto de Chipre.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de atención — Av. Santander',
      address: 'Parque de la Mujer y CAI El Cable, Av. Santander, Manizales',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Misma fuente oficial que el punto de Chipre.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de atención — El Carmen',
      address: 'CISCO del Carmen, contiguo al CAI, Manizales',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Misma fuente oficial que el punto de Chipre.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de atención — Centro',
      address: 'Plazoleta de la Alcaldía, Manizales',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Misma fuente oficial que el punto de Chipre.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto itinerante de atención — La Avanzada',
      address: 'La Avanzada, Manizales (punto itinerante; regresa el 18 de agosto)',
      phone: null,
      needsText: 'Ayudas humanitarias, orientación sobre vivienda y acompañamiento para familias afectadas por el sismo. No es un punto fijo permanente.',
      sourceUrl: 'https://www.instagram.com/jorgeerojasg/reel/DcGzGaghwDF/',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Misma fuente oficial; confianza media-alta por ser un punto itinerante, no fijo.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación El Edén del Abuelo',
      address: 'Sector Bajo Tablazo, Manizales, Caldas',
      phone: '314 618 6984',
      needsText: 'Hogar de 55 adultos mayores, ~70% de la infraestructura dañada por el sismo (dormitorios inutilizables, todos los residentes duermen en un solo salón común). El fundador, Óscar Jaime Ochoa (25 años dirigiendo el hogar), pide camas hospitalarias, materiales de construcción y dinero. IMPORTANTE: el fundador advirtió públicamente (La Patria, 15 de agosto) que personas no afiliadas están usando fotos de la fundación para campañas de donación no verificadas — usar solo los canales oficiales: Instagram @fundacioneledendelabuelo, teléfono 314 618 6984, cuenta bancaria 85966032826, llave bancaria 0090360202.',
      sourceUrl: 'https://www.lapatria.com/manizales/voluntarios-apoyan-adultos-mayores-tras-el-terremoto-en-manizales',
      sourceOrg: 'Fundación El Edén del Abuelo',
      submitterNote: 'Encontrada de forma independiente por dos agentes de esta pasada (TikTok y crowdfunding), corroborada por Noticias RCN y Eje21. La propia fundación advirtiendo sobre campañas impostoras usando sus fotos es una señal fuerte de autenticidad — una campaña falsa no advertiría sobre campañas falsas de sí misma.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Familia afectada — Barrio El Carmen (Tania Gómez)',
      address: 'Calle 17 #30-27, Barrio El Carmen, Manizales',
      phone: 'Nequi 300 823 0643 (Tania Gómez)',
      needsText: 'Vivienda en riesgo de colapso por el sismo, sin haber recibido ayuda humanitaria al momento de la publicación. Solicitan materiales de construcción o donación económica.',
      sourceUrl: 'https://www.facebook.com/groups/705046777782396/?multi_permalinks=1547401016880297&hoisted_section_header_type=recently_seen',
      sourceOrg: null,
      submitterNote: 'Dirección concreta y fotos de daño estructural visible, publicado en el grupo comunitario "Manizales Noticias" con interacción real. PRECAUCIÓN: los fondos se recogen a través de una cuenta Nequi personal, no una institución verificada — el mismo patrón de donación que está siendo activamente abusado esta semana (ver publicaciones de estafa). Verificar localmente antes de enviar dinero.',
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
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcE0fmyJp5q/',
      authorHandle: 'jorgeerojasg (co-etiquetado con alcaldiademanizales y seccional_caldas)',
      category: 'OFFICIAL' as const,
      placeName: 'Cruz Roja Colombiana Seccional Caldas, Cra. 21 #69-350, Manizales',
      note: 'El subsidio de arrendamiento (rastreado desde la pasada 57) sigue desembolsándose activamente: punto presencial con turno agendado por QR donde afectados con formato azul de Revisión a Predio y cédula pueden tramitarlo — $357.000 (1 mes arrendatarios, 3 meses propietarios). Confirma que el programa sigue operando con un proceso de atención en vivo, no solo anunciado.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ConcejodeMzles/status/2089038474418794869',
      authorHandle: '@ConcejodeMzles',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'El Concejo de Manizales abrió un nuevo período de sesiones extraordinarias (17-23 de agosto) dedicado específicamente a blindar/supervisar la reconstrucción de la ciudad tras el terremoto.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/jorgeerojasg/p/DcFEp6FiZVz/',
      authorHandle: 'jorgeerojasg',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales (toda la ciudad)',
      note: 'Nueva advertencia oficial contra la especulación de arriendos: el canon no puede superar el 1% del valor comercial del inmueble, los arrendadores deben tener licencia registrada, no se pueden exigir depósitos en efectivo/pagarés, y las irregularidades se pueden reportar al (606) 893 1378.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/jorgeerojasg/p/Db9IrxhCVSt/',
      authorHandle: 'monicaecheverryg (comentario)',
      category: 'NEED' as const,
      placeName: 'Veredas Combia Baja, Arabia, Altagracia (zona rural de Manizales)',
      note: 'RECLAMO SIN CONFIRMAR: un comentario en una publicación oficial de la Alcaldía afirma que estas tres veredas rurales no han recibido ninguna ayuda, reportando malos olores por personas fallecidas y adultos mayores/bebés enfermos, etiquetando a medios regionales para llamar la atención. Es un solo comentario no verificado independientemente, no un reporte original — tratar como pista a revisar, no como hecho confirmado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/luisa.modep/posts/pfbid02zSwqEmqzvYuhte3eMuqSEedsBdYokpq9rM9jje11aK5LG1uSA5RQqtzd3o9BaqWYl',
      authorHandle: 'Luisa Arenas (compartiendo un reporte de Manizales Denuncia)',
      category: 'NEED' as const,
      placeName: 'Sector Sacatín, Barrio Villa Pilar, Manizales',
      note: 'ALEGACIÓN SIN CONFIRMAR: voluntarios removiendo escombros del terremoto en el sector Sacatín dicen que la policía obstruyó y "reprimió" su labor de limpieza, acusándolos de posesión ilegal de escombros. Se pide a la Alcaldía y a la Personería de Manizales que expliquen. Relato de una sola fuente ciudadana — tratar como alegación pendiente de confirmar, no como incidente oficial verificado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/groups/2080498428752992/?multi_permalinks=4013473548788794&hoisted_section_header_type=recently_seen',
      authorHandle: 'Comunidad "Todo Manizales"',
      category: 'NEED' as const,
      placeName: 'Manizales',
      note: 'NUEVO PATRÓN DE ESTAFA: una creadora de TikTok con base en Manizales, conocida como "La Cucuteña", solicitó dinero para el terremoto vía Nequi/Bancolombia personal, y presuntamente usó parte de los fondos para pagar su propio arriendo, negándose a mostrar comprobantes cuando sus seguidores lo pidieron. La controversia escaló entre el 14 y 15 de agosto a páginas regionales de chismes bajo la etiqueta #Estafas. Tratar con escepticismo a cualquier personalidad de redes que solicite donaciones del terremoto a una cuenta personal — pedir comprobantes antes de donar.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/karen.lopez.265302/posts/pfbid0vuXGDYSzFpCsSDtZywcEkWr2WdP5Dab9FdpsPn2VbPYHGx8oBh7C2MmdJDFYngsJl',
      authorHandle: 'Karen Lopez',
      category: 'NEED' as const,
      placeName: 'Manizales',
      note: 'ESTAFA PROBABLEMENTE EN CURSO, capturada ~21 minutos después de publicarse: la publicación (marcada por Facebook como "contenido de IA") afirma que su tía es víctima del terremoto y que "GoFundMe tiene fallas de plataforma", por lo que las donaciones deben ir directamente a una cuenta Nequi personal (Miriam Patricia Zules, 315 805 5832). La combinación de imagen generada por IA, una excusa fabricada de "la plataforma está caída", y un número de dinero móvil personal es un patrón clásico de estafa de donaciones — no donar por esta vía.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Tucanaldigital/posts/pfbid015KEehyGwKRDWJiba4BVfrHw9riQAvkiRy1cEtJeHpLGypgiAcf68BURkPe3HRiZl',
      authorHandle: 'Tu Canal Manizales',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'Medio local relaya la aclaración pública de la directora del ICBF, María Carolina Restrepo: el ICBF NO solicita dinero ni donaciones para la emergencia del terremoto (ese rol corresponde a la oficina de la primera dama de Manizales), en medio de una ola de intentos de estafa usando nombres/logos de entidades públicas.',
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
