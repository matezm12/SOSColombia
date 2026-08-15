/**
 * Pass 55 (2026-08-15) — first city in the fifth research round, Pereira.
 * Four prior rounds (13, 14, 23, 32, 45) already covered this city
 * exhaustively, so this pass hunted for what a fresh sweep would find
 * days later. Contrary to expectations of near-total saturation, it
 * surfaced a real, active fraud wave — three independent, police-
 * corroborated scam reports within a 24-48h window (a fake trapped-
 * person alert used to recover a business's cash register, a fake
 * "director de Sanidad" impersonator, and altered donation QR codes
 * flagged publicly by singer Jhonny Rivera) — plus a genuine escalation
 * of the Expofuturo political-misuse allegation flagged in pass 45,
 * which now names a sitting senator. The Juan Felipe Giraldo missing-
 * persons case (Hotel Dibeni, open since early passes) closed tragically
 * — found dead the day he was due to marry.
 * See wiki/17-allied-resources-and-community.md "Pass 55" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass55-pereira-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Olaya',
      address: 'Barrio/Sector Olaya, Pereira, Risaralda (dirección exacta no dada en la fuente)',
      phone: null,
      needsText: 'Albergue con niños y familias desplazadas por el terremoto; personal de Acción Integral del Ejército realiza actividades recreativas/psicosociales en el sitio.',
      sourceUrl: 'https://x.com/Ejercito_CAAID/status/2088434749660364844',
      sourceOrg: 'Ejército Nacional (Comando de Acción Integral)',
      submitterNote: 'Publicado por la cuenta oficial verificada del Comando de Acción Integral del Ejército, corroborado el mismo día por la radio militar Colombia Estéreo. No es uno de los seis albergues ya catalogados (Ecoparque El Vergel, Parque del Oso, Estadio Mora Mora, Plaza de Ferias, Polideportivo Belalcázar, Plazoleta Villa Olímpica). Sin dirección exacta — confianza media-baja, verificar antes de aprobar.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Corporación Eje Extremo — Skatepark La Villa (acopio fijo y camión móvil)',
      address: 'Skatepark La Villa, Pereira, Risaralda (punto fijo); camión móvil recorriendo el corregimiento de La Florida y veredas cercanas, 9:00am-12:00pm',
      phone: '310 477 2354 / 311 369 4219 / 310 572 0717 / 312 735 1756',
      needsText: 'Ropa, alimentos no perecederos, artículos de aseo, agua, pañales/toallas higiénicas, alimento para mascotas, enlatados. Donación en dinero: Bancolombia cuenta de ahorros 270 000073 88, a nombre de Corporación Eje Extremo.',
      sourceUrl: 'https://www.instagram.com/p/Db_OFJqqaZ_/',
      sourceOrg: 'Corporación Eje Extremo',
      submitterNote: 'Encontrada de forma independiente por dos de los cinco agentes de esta pasada (Instagram y TikTok), el segundo aporta el detalle del camión móvil hacia La Florida, un corregimiento no cubierto por los albergues céntricos ya conocidos. Organización local ya establecida con cuenta bancaria y 4 contactos telefónicos. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'BUDO + XTREMEFIT — Centro de Acopio',
      address: 'Calle 32 BIS #13-09, Piso 1, Brasilia, Pereira',
      phone: '310 418 7149 / 315 677 2067 / 318 899 4066',
      needsText: 'Alimentos no perecederos, ropa, artículos de aseo/limpieza. Publicación enmarcada explícitamente como punto de recolección a más largo plazo, ya que las donaciones empiezan a disminuir aunque las necesidades siguen.',
      sourceUrl: 'https://www.instagram.com/p/DcEUgPjON-r/',
      sourceOrg: null,
      submitterNote: 'Publicación conjunta de dos negocios locales reales (gimnasio BUDO y XtremeFit Funcional), publicada solo 4 horas antes de esta revisión — el hallazgo más fresco de esta ronda. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'SOS Asistencia — Unidos por la Reconstrucción (Vaki)',
      address: null,
      phone: '+57 311 720 2004 / +57 316 524 7619',
      needsText: 'Fondos para materiales de reconstrucción, evaluación técnica y ayuda económica directa para familias con vivienda destruida/dañada en Cali y Pereira. Meta US$16,049, ~US$11,683 recaudados (67 donantes) al 15 de agosto; cierra el 1 de septiembre.',
      sourceUrl: 'https://vaki.co/vaki/unidos-reconstruimos',
      sourceOrg: 'SOS Asistencia',
      submitterNote: 'Encontrada de forma independiente por dos de los cinco agentes. Negocio de servicios del hogar ya establecido (5,719 seguidores, 912 publicaciones), insignia verificada de Vaki, actualizaciones fechadas de progreso (11/12/14 de agosto), proceso documentado de evaluación caso por caso. Genuinamente nueva y enfocada en reconstrucción, no en respuesta de emergencia. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Global Shapers Pereira / La Astilla en el Ojo — Help Pereira Recover',
      address: null,
      phone: null,
      needsText: 'Canal de donación internacional/diáspora (publicación bilingüe con código QR) para apoyar a familias afectadas en Pereira; donantes en Alemania deben contactar directamente a Catalina Mejía.',
      sourceUrl: 'https://www.instagram.com/p/Db_BVS6xhrh/',
      sourceOrg: 'Global Shapers Pereira',
      submitterNote: 'Global Shapers Pereira es un capítulo real de la Global Shapers Community del Foro Económico Mundial (684 publicaciones, 3,732 seguidores), co-publicado con el colectivo local La Astilla en el Ojo — un canal internacional nuevo, distinto de la lista de GoFundMe/Vaki ya conocida. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Colecta hacia Pereira — Ignacio Vega (camión sale 15 de agosto)',
      address: 'Carrera 1 #77-05, Edificio Palo Alto, Apto 203 (punto de entrega; no confirmado si está dentro del perímetro de Pereira)',
      phone: 'Nequi +57 316 619 7879 (Ignacio Vega)',
      needsText: 'Pañales de adulto y de bebé, toallitas, enlatados, cobijas/sábanas, ropa interior nueva, linternas, pilas, fósforos, carpas. Camión con lo recolectado sale hacia Pereira el sábado 15 de agosto.',
      sourceUrl: 'https://www.instagram.com/p/Db9kDjsx6gE/',
      sourceOrg: null,
      submitterNote: 'Cuenta personal pero con interacción real (107 me gusta), dirección concreta, contacto Nequi nombrado y fecha de salida específica. Confianza media — no se confirmó si la dirección de entrega está dentro de Pereira o es un punto satélite que alimenta hacia la ciudad.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Pereira Strong Earthquake Relief (Katherine Hansen)',
      address: null,
      phone: null,
      needsText: 'Compra local de alimentos/agua/artículos de higiene/cobijas/alojamiento temporal en Pereira, con compromiso de documentar compras y distribución.',
      sourceUrl: 'https://www.gofundme.com/f/pereira-strong-earthquake-relief',
      sourceOrg: null,
      submitterNote: 'Creada el 11 de agosto. $5,904 recaudados de meta $10,000, 85 donantes. Organizadora nombrada (Ansonia, CT), compromiso explícito de transparencia. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help my parents rebuild after the Pereira, Col earthquake (Juliana Granada)',
      address: null,
      phone: null,
      needsText: 'Alojamiento temporal y recuperación a largo plazo para los padres de la organizadora, cuya vivienda en Pereira quedó inhabitable; una actualización agrega que su propiedad de alquiler en Dosquebradas también fue destruida, eliminando su ingreso.',
      sourceUrl: 'https://www.gofundme.com/f/help-my-parents-rebuild-after-the-pereira-col-earthquake',
      sourceOrg: null,
      submitterNote: 'Creada el 11 de agosto. $8,456 recaudados de meta $12,000, 107 donantes — la mayor tracción de los hallazgos nuevos de esta ronda. Historia específica y en evolución con actualización fechada. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help our family Rebuild after the Pereira earthquake (Sarah Perez)',
      address: null,
      phone: null,
      needsText: 'Reparación estructural/reconstrucción de viviendas familiares dañadas en Pereira; excedente prometido a otros familiares afectados.',
      sourceUrl: 'https://www.gofundme.com/f/help-our-family-rebuild-after-the-pereira-earthquake',
      sourceOrg: null,
      submitterNote: '$4,397 recaudados de meta $5,000 (88% financiada), 60 donantes. Organizadora nombrada (Palisades Park, NJ). Confianza media-alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Ayúdanos a imprimir esperanza tras el terremoto en Pereira (Q\'hubo Pereira)',
      address: null,
      phone: null,
      needsText: 'Impresión y colocación física de volantes de personas desaparecidas por la ciudad, para que la información llegue a residentes sin acceso confiable a internet. Reportar una persona desaparecida es gratis; las donaciones son voluntarias.',
      sourceUrl: 'https://vaki.co/vaki/imprimir-esperanza-en-pereira',
      sourceOrg: 'Q\'hubo Pereira',
      submitterNote: 'Creada el 13 de agosto, respaldada por un medio local real e identificable (el tabloide Q\'hubo Pereira). Propósito concreto y distinto de cualquier otra campaña encontrada en las cinco rondas — directamente relevante al ángulo de personas desaparecidas. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Manos a la obra por Pereira y Dosquebradas (Fundación Colombia Hoy)',
      address: null,
      phone: null,
      needsText: 'Pañales y kits de higiene para familias en Pereira Y Dosquebradas conjuntamente.',
      sourceUrl: 'https://vaki.co/vaki/manos-a-la-obra-por-pereira-y-dosqubradas',
      sourceOrg: 'Fundación Colombia Hoy',
      submitterNote: 'Creada el 14 de agosto (~24h de antigüedad al momento de esta búsqueda) — la más fresca de este barrido. Fundación identificable con insignia verificada de Vaki (verificado por Maria del Pilar), necesidad concreta y acotada. Sin donantes aún al momento de la revisión — campaña genuinamente nueva. Confianza media.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pereira.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
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
      permalink: 'https://x.com/NacionColombiaX/status/2088723283017658809',
      authorHandle: '@NacionColombiaX',
      category: 'OFFICIAL' as const,
      placeName: 'Expofuturo, Pereira',
      note: 'ESCALACIÓN de la denuncia de politización de Expofuturo señalada en la pasada 45: ahora nombra a una senadora específica, María Irma Noreña (Partido de la U), como presuntamente involucrada en irregularidades en la distribución de ayuda humanitaria en el centro de acopio. Corroborado por al menos 3 páginas de Facebook independientes (Lulada News, Pereira Hoy, 24/7 Noticias) dentro de las 12 horas siguientes. Aún sin verificar por autoridades — se pide investigación a Fiscalía, Procuraduría y la Alcaldía de Pereira.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_HvchRrJP/',
      authorHandle: 'expofuturopereira',
      category: 'AID_POINT' as const,
      placeName: 'Expofuturo, Pereira',
      note: 'CONTRAPARTE de la denuncia de arriba: la cuenta oficial verificada de Expofuturo (operada junto con la Cámara de Comercio de Pereira) confirma que el punto sigue operando legítimamente con cuenta bancaria nombrada (Bancolombia 115 0000 6301, NIT 891.400.669) — el sitio funciona como centro de acopio real y activo incluso mientras las denuncias de politización continúan circulando.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.semana.com/nacion/pereira/articulo/terremoto-en-pereira-dos-albergues-ya-estan-al-limite-y-estos-son-los-puntos-disponibles/202651/',
      authorHandle: 'Revista Semana',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'ACTUALIZACIÓN DE ESTADO: la Alcaldía de Pereira anunció que Ecoparque El Vergel y Estadio Mora Mora ya están a capacidad completa; el artículo detalla qué puntos alternos siguen con espacio disponible.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@ultimahoracol_/video/7674342076401667348',
      authorHandle: '@ultimahoracol_',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hotel Dibeni, Pereira',
      note: 'RESOLUCIÓN de persona desaparecida: Juan Felipe Giraldo, 24 años, atrapado en el Hotel Dibeni (caso que se volvió viral por la búsqueda de su padre), fue confirmado muerto — iba a casarse ese domingo. Corroborado por Noticias Caracol.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search/video?q=Pereira%20terremoto%20desaparecidos',
      authorHandle: 'UnoTV',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira',
      note: 'Caso ABIERTO, sin resolver: la pareja mexicana Mario Zapata y Brenda Flores, de vacaciones en Pereira desde el 6 de agosto, sigue desaparecida; búsqueda activa reportada hasta hace ~15 horas.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@las2orillas/video/7674319244452039952',
      authorHandle: '@las2orillas',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'NUEVO PATRÓN DE FRAUDE: voluntarios y organismos de emergencia reportan que una falsa alerta de personas atrapadas bajo escombros en Pereira movilizó bomberos, ambulancias, Defensa Civil y maquinaria pesada durante horas — el objetivo real era recuperar la caja registradora de un negocio, desviando recursos de rescates genuinos en otro lugar. Corroborado independientemente por El Colombiano/Telemedellín.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@musicalifyco/video/7674304002581875969',
      authorHandle: '@musicalifyco',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'NUEVA ALERTA DE ESTAFA: el cantante Jhonny Rivera, involucrado personalmente en la recolección de ayuda en Pereira, advierte que circulan códigos QR falsos/alterados para desviar donaciones destinadas a las víctimas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.elcolombiano.com/colombia/terremoto-alerta-por-estafadores-policia-suplantacion-director-sanidad-damnificados-EG39953869',
      authorHandle: 'El Colombiano',
      category: 'OFFICIAL' as const,
      placeName: 'Risaralda / Colombia',
      note: 'NUEVO VECTOR DE ESTAFA: un estafador se hace pasar por un "Director de Sanidad" (coronel) contactando municipios afectados por WhatsApp ofreciendo falso "apoyo institucional". Corroborado el mismo día por una alerta separada de la Policía Nacional/Caracol Radio — no exclusivo de Pereira pero directamente relevante dado que es uno de los municipios más golpeados.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.eltiempo.com/colombia/otras-ciudades',
      authorHandle: 'El Tiempo',
      category: 'OFFICIAL' as const,
      placeName: 'Risaralda / Pereira',
      note: 'FASE DE RECONSTRUCCIÓN, aún sin desembolso: el Gobierno nacional anunció tres meses de alivio en pago de servicios públicos y un programa de subsidio de arriendo para familias desplazadas de Risaralda; el Concejo de Pereira autorizó redirigir al menos $100.000 millones COP de un crédito de infraestructura existente hacia la recuperación. Al 15 de agosto ninguna fuente confirma que hogares individuales hayan recibido dinero desembolsado — los programas siguen "anunciados/en coordinación", no en manos de las familias.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search/video?q=Pereira%20terremoto%20desaparecidos',
      authorHandle: 'Yuvis Toro',
      category: 'NEED' as const,
      placeName: 'Carrera 9 con Calle 38, Pereira',
      note: 'Reporte de peligro estructural sin resolver: un edificio en Carrera 9 con Calle 38 está en riesgo de colapso inminente, con adultos y niños todavía viviendo justo al lado, sin inspección oficial hasta el momento. Relacionado: ObrArq (arquitecto Willy Valencia) y la ingeniera Carolina Millán ofrecen revisiones estructurales gratuitas para Pereira, Armenia y el Eje Cafetero — contacto vía WhatsApp/Instagram/Facebook.',
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
        municipioId: pereira.id,
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
