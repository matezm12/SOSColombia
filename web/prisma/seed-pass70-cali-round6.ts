/**
 * Pass 70 (2026-08-16) — round 6 continues, Cali. Five prior rounds (15,
 * 24, 33, 46, 56) already covered this city exhaustively. Two leads were
 * caught as duplicates and skipped: the Saavedra family GoFundMe (same
 * URL already seeded pass 15, this round's find is only a funding-total
 * update — $129,409/2,815 donors) and a batch of four shelter addresses
 * from a single low-confidence, partly-already-debunked Instagram flyer
 * (one of its five original locations was already confirmed false by a
 * commenter on the same post) — not seeded given the safety stakes of a
 * wrong shelter address.
 *
 * The toll moved, but with a genuine internal contradiction worth
 * recording rather than silently resolving: four independent sources
 * (an official-format "Reporte Oficial #011" graphic, two corroborating
 * news pages, and an X account) converge on 122-123 fallecidos / 111
 * desaparecidos / 1,485 heridos — a sharp jump in missing persons from
 * the pass-56 baseline (77). But a fifth agent found the city's own
 * Secretario de Gestión del Riesgo, Ricardo Peñuela, reiterating the
 * OLD figures (111/77/1,416) on the same day. Logged as new TollRecord
 * rows per the weight of independent corroboration, with the Peñuela
 * contradiction documented in the wiki for a moderator to resolve.
 *
 * Also new this round: two distinct building-collapse death confirmations
 * (the Vivas Jiménez family at Edificio Ana Pilar; celador Víctor Acosta,
 * same building), a $150,000 million COP private donation from the
 * Gilinski family for hospital/school reconstruction, a corrected detail
 * on the Saavedra tragedy (the two dead sisters were triplets; a maternal
 * uncle also died), and two new distinct scam patterns (phone-impersonation
 * of a deceased victim; an AI-generated fake missing-person poster).
 * See wiki/17-allied-resources-and-community.md "Pass 70" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass70-cali-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const sourceDefs = [
    {
      key: 'elpaiscali_balance_123_0815',
      url: 'https://www.facebook.com/PalmiraTeVeOficial/posts/pfbid0zuhmVeeworz4fXBrB5uFBDL3jbcejhL2df3fJeng19DbR3eQRfoP5tujqih6FtZnl',
      org: 'Reporte Oficial #011 (vía Palmira Te Ve, corroborado por Rubiel Comunica Noticias, Alerta Calidad y El País Cali)',
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
      value: 123,
      sourceKey: 'elpaiscali_balance_123_0815',
      tier: 2,
      asOf: '2026-08-15T16:30:00-05:00',
      notes: '"Reporte Oficial #011" (15 de agosto, 4:30pm): 122-123 fallecidos según distintas fuentes que citan el mismo corte (Palmira Te Ve dice 122, Rubiel Comunica Noticias y Alerta Calidad dicen 123; se usa 123 por doble corroboración). Sube desde los 111 ya registrados en la pasada 56. CONTRADICCIÓN A SEÑALAR: el mismo día (16 de agosto), el Secretario de Gestión del Riesgo de Cali, Ricardo Peñuela, reiteró en otra fuente las cifras ANTERIORES (111 muertos, 77 desaparecidos, 1.416 heridos) como si fueran el corte vigente "hasta el sábado". Se registra como fila nueva siguiendo la disciplina de nunca sobrescribir, pero se deja esta nota para que quien modere concilie ambas fuentes.',
    },
    {
      metric: 'MISSING_OFFICIAL' as const,
      value: 111,
      sourceKey: 'elpaiscali_balance_123_0815',
      tier: 2,
      asOf: '2026-08-15T16:30:00-05:00',
      notes: 'Mismo reporte oficial #011: sube marcadamente desde los 77 desaparecidos de la pasada 56 — el salto más notable de esta pasada. Misma salvedad que el registro de fallecidos: el Secretario Peñuela reiteró 77 el mismo día 16 de agosto en una fuente distinta.',
    },
    {
      metric: 'INJURED' as const,
      value: 1485,
      sourceKey: 'elpaiscali_balance_123_0815',
      tier: 2,
      asOf: '2026-08-15T16:30:00-05:00',
      notes: 'Mismo reporte oficial #011, corroborado de forma idéntica por múltiples fuentes independientes. Sube desde 1.416 en la pasada 56.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: cali.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: cali.id,
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
      name: 'Vaki — Clínica de Medicinas Alternativas Dr. Calle (Martha Henao)',
      address: 'Cali, Valle del Cauca (dirección de la clínica no especificada)',
      phone: null,
      needsText: 'Campaña de Vaki para ayudar a Martha Henao a reconstruir su clínica de medicinas alternativas dañada por el terremoto ("Colon Clinic – Medicines Alternatives Dr. Calle"), impulsada por la diáspora colombiana en Sídney, Australia.',
      sourceUrl: 'https://www.facebook.com/groups/812097568800501/?multi_permalinks=28705576132359270&hoisted_section_header_type=recently_seen',
      sourceOrg: null,
      submitterNote: 'Beneficiaria y negocio nombrados, enlace real de Vaki visible en la publicación, publicante se identifica como amiga de la familia; publicado en un grupo real de la diáspora ("Colombianos en Sydney"), no una página anónima.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Casa de Acopio Capri (Kevin Murillo)',
      address: 'Carrera 74 No. 11a-14, barrio Capri, Cali',
      phone: null,
      needsText: 'Punto de acopio general, confirmado activo por su organizador.',
      sourceUrl: 'https://www.tiktok.com/@kemurga/video/7674369313582632200',
      sourceOrg: null,
      submitterNote: 'Cuenta personal (no una página anónima) con dirección exacta, confirmando explícitamente "sigue activa" — actualización de estado en vivo, no una publicación genérica reciclada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Ancianato de las Hermanitas de los Pobres — reubicación de adultos mayores',
      address: 'Sede original en Cali declarada inhabitable; residentes repartidos en otras casas de la congregación en Colombia',
      phone: null,
      needsText: '75 adultos mayores desplazados tras quedar inhabitable su hogar en Cali. Donaciones económicas vía Nequi (a nombre de Madre Superiora María Otálora) o cuenta Davivienda, para financiar reubicación, alimentación, higiene y cuidado de los residentes.',
      sourceUrl: 'https://www.tiktok.com/@brb6758/video/7674089556249021703',
      sourceOrg: 'Hermanitas de los Pobres',
      submitterNote: 'Congregación católica real y de larga trayectoria; responsable nombrada por cargo (Madre Superiora), explica de forma coherente por qué se pide dinero en vez de especie (la ayuda en especie es costosa/difícil de trasladar).',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Solidaridad por Colombia — "Juntos por Colombia" / Caminata de la Solidaridad 2026',
      address: 'Evento: Estadio Nemesio Camacho El Campín, Bogotá (29-30 de agosto); fondos distribuidos a Cali, Pereira y Buenaventura',
      phone: null,
      needsText: '100% de lo recaudado en la caminata/festival del 29-30 de agosto se destina a rescate, recuperación, reconstrucción y seguridad alimentaria para víctimas del terremoto, incluyendo explícitamente a Cali. Canales: cuenta de ahorros Bancolombia 167-000109-63, llave Bre-B @juntosxcolombia, o campaña de GoFundMe "Juntos por Colombia" para donantes internacionales.',
      sourceUrl: 'https://www.elpais.com.co/colombia/terremoto-en-colombia-caminata-de-la-solidaridad-destinara-el-100-de-su-recaudo-a-los-damnificados-en-diferentes-ciudades-1325.html',
      sourceOrg: 'Fundación Solidaridad por Colombia',
      submitterNote: 'Fundación establecida con 51 años de trayectoria y respuesta previa a desastres documentada (terremoto del Eje Cafetero, avalancha de Mocoa, huracán Iota); reportada por múltiples medios (El País, El Tiempo, Vanguardia, La Nación). Beneficia a varias ciudades, no solo Cali — se incluye aquí porque la nombra explícitamente como beneficiaria.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Ayúdanos a seguir ayudando a Cali Colombia (Daniella Carmona)',
      address: null,
      phone: null,
      needsText: 'Combustible, transporte y costos operativos de maquinaria pesada para remoción de escombros en Cali. La organizadora y su padre han operado la maquinaria en terreno desde antes del sismo.',
      sourceUrl: 'https://www.gofundme.com/f/ayudanos-a-seguir-ayudando-a-cali-colombia',
      sourceOrg: null,
      submitterNote: 'Campaña creada el 11 de agosto, uso de fondos concreto y acotado (no un pedido de ayuda genérico), meta modesta ($2,400) y escala ($1,773 recaudados de 27 donantes) consistente con un esfuerzo familiar real, no una estafa.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: cali.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: cali.id,
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
      permalink: 'https://x.com/noticierovv/status/2089043126723695103',
      authorHandle: '@noticierovv (Noticias Venevisión)',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (zonas afectadas, incl. Cali/Valle)',
      note: 'La Organización Internacional para las Migraciones (OIM) emitió una alerta pública sobre riesgo de redes de trata de personas en las zonas afectadas por el terremoto, dada la vulnerabilidad de quienes perdieron vivienda o sustento — desarrollo nuevo de fase de recuperación, no visto en pasadas anteriores.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/elpaiscali/status/2088964781373829157',
      authorHandle: '@elpaiscali (El País Cali)',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Nueva alerta de la Policía Nacional: se detectaron nuevas modalidades de estafa dirigidas a víctimas/donantes del terremoto, distintas de la alerta anterior sobre falsos censistas (13 de agosto).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/RevistaSemana/status/2089008741647573323',
      authorHandle: '@RevistaSemana',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Edificio Ana Pilar, Cali',
      note: 'Tres familiares de Javier Fernández ("el cantante del gol", narrador deportivo conocido) fueron hallados muertos tras el colapso del Edificio Ana Pilar en Cali: su hermana Alejandra Vivas (35), la madre de ambos, Amparo Jiménez (78), y el hijo de Alejandra, Martín (10) — la familia Vivas Jiménez, un caso nuevo y distinto de la tragedia Saavedra.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/QuePasaMedia/status/2089034535153360907',
      authorHandle: '@QuePasaMedia',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'Detalle nuevo sobre la ya conocida tragedia Saavedra: las dos hermanas fallecidas eran en realidad trillizas (Ana María es una de tres), y un tío materno también murió en el mismo colapso, además de ambos padres — información adicional a lo ya sembrado en la pasada 56.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/PrensaLaNacion/status/2088966638817222859',
      authorHandle: '@PrensaLaNacion',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'Daniela Andrea Largo, rescatada con vida tras 36 horas bajo escombros, murió posteriormente a causa de sus heridas — nueva víctima nombrada, actualización trágica de un rescate previamente celebrado.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db97VUIuoQh/',
      authorHandle: 'lanota.web',
      category: 'NEED' as const,
      placeName: 'Cali / Buga / Tuluá, Valle del Cauca',
      note: 'Nuevo patrón de estafa, distinto del caso Saavedra: alguien encontró el celular de Catherin López Saldarriaga, mujer fallecida en el terremoto, y está suplantándola desde "su nuevo número", enviando mensajes a sus contactos alegando estar hospitalizada y pidiendo giros de dinero.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02qrWc7oEbr5h3139FANsgiUYpqkDnoH53GgXjmfe9oMwvTb7BkNPEdcsSNT7AvsAHl&id=61578622795831',
      authorHandle: '24/7 Noticias y Entretenimiento',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'El presidente Abelardo De La Espriella anunció (domingo 16 de agosto) que el empresario Jaime Gilinski (el hombre más rico de Colombia, nacido en Cali) y su esposa Raquel Kardonski donarán $150.000 millones de pesos específicamente para reconstruir hospitales y colegios en Cali, incluyendo el Hospital Universitario del Valle. Corroborado de forma independiente por La República y ABC Color, ambos citando la misma cifra.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cwmasnoticias/posts/pfbid0n4EcUEqLkyiqYDMQKw35tqhmr76VQfzigXXotydvYPFwgYagGeJ58QjrpKz2bqrvl',
      authorHandle: 'CW+ Noticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Edificio Ana Pilar, Cali',
      note: 'Víctor Acosta, el celador del Edificio Ana Pilar desaparecido desde el sismo, fue hallado muerto el sábado 15 de agosto tras días de búsqueda intensa que circuló ampliamente en redes con su foto de uniforme. Confirmado por su sobrino; corroborado independientemente por El Tiempo, El País, Semana y otros medios.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/fullcaliinfo/posts/pfbid02cSpsAbmUvpt71n9hsjNBWLzwjpyJgk55n4PUWVssaXE6EvVKUoHbvnv1e5bopXTml',
      authorHandle: 'FULL CALI',
      category: 'OFFICIAL' as const,
      placeName: 'Cali, Manizales, Pereira, Chocó',
      note: 'El gobierno nacional confirmó la creación de un subsidio temporal de arriendo para familias evacuadas de viviendas dañadas por el sismo, cubriendo Cali, Manizales, Pereira y Chocó. Para calificar, los residentes deben estar en el censo oficial (alcaldías, Gobernación del Chocó, UNGRD, MinVivienda) y contar con certificación técnica de inhabitabilidad. El mecanismo exacto de desembolso sigue "en definición" — el Ministro Beltrán indicó que los subsidios (4-6 meses) comenzarían la semana del 18-21 de agosto, pero aún no han empezado a fluir a la fecha de esta pasada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@rodriguezrose03/video/7674359789723438350',
      authorHandle: '@rodriguezrose03',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Familiares/allegados de la familia Saavedra Caicedo advierten que estafadores están usando la tragedia de la familia para pedir dinero, y que el ÚNICO canal autorizado es el GoFundMe oficial ya sembrado (gofundme.com/f/nuestra-familia-esta-bajo-los-escombros-ayuda, activo desde la pasada 15, ahora en $129,409 de 2,815 donantes).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@bleuetteduarte/video/7674038070072626433',
      authorHandle: '@bleuetteduarte',
      category: 'NEED' as const,
      placeName: 'Cali',
      note: 'La creadora advierte que un falso cartel de "persona desaparecida" con su propio nombre y foto (etiquetándola falsamente como víctima del terremoto en Cali) ha circulado en redes; TikTok marcó el video como contenido con imagen generada por IA — ejemplo concreto del patrón de estafa de suplantación/desaparecidos falsos que explota el terremoto.',
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
        municipioId: cali.id,
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
