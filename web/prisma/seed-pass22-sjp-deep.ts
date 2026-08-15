/**
 * Pass 22 (2026-08-14) — deep multi-agent research pass on San José del
 * Palmar, the earthquake's literal epicenter (X + Instagram + Facebook +
 * TikTok + GoFundMe/Vaki crowdfunding, browser-driven). Ninth and final city
 * in the per-city deep-pass rotation. A tiny (~5,900 population), extremely
 * rural municipality with zero confirmed deaths and zero prior aid
 * infrastructure on file — this pass found real content, but almost
 * entirely organized FROM other cities (Cali, Bogotá, Tuluá, Zarzal,
 * Andalucía, Cartago) rather than locally, since the town itself has no
 * hospital/vet/shelter infrastructure of its own. See
 * wiki/17-allied-resources-and-community.md "Pass 22" for full agent notes
 * and rejected candidates. Run once via
 * `npx tsx prisma/seed-pass22-sjp-deep.ts`.
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
      name: 'Vaki: para San José del Palmar, Chocó (Epicentro del terremoto)',
      address: null,
      phone: null,
      needsText:
        'Reconstrucción de viviendas, espacios comunitarios y apoyo a familias afectadas en San José del Palmar. Organizadora: Valentina Jurado (@mamadeamara), con vínculo personal previo con el pueblo (lo visitó 3 meses antes del sismo). US$46,231 recaudados de meta US$9,630, 1,817 aportantes, cierra 19 de agosto de 2026.',
      sourceUrl: 'https://vaki.co/vaki/vaki-para-san-jos-del-palmar-choc-epicentro-del-terremoto',
      sourceOrg: null,
      submitterNote:
        'Encontrado independientemente por los 5 agentes de esta pasada - la corroboración cruzada más fuerte de cualquier hallazgo en todas las pasadas por ciudad realizadas hasta ahora. Organizadora verificada en Vaki, 1,817 donantes reales con nombres/marcas de tiempo, corroborada además por una cuenta de X (@mygsdboy) ajena a la organizadora que la comparte y avala. Existe una variante de URL con acentos/palabras completas que da error 404 - usar exactamente la URL indicada aquí. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Casa de los Títeres (Brigada Humanitaria) - Cali',
      address: 'Cra 9 #4-55, Barrio San Antonio, Cali, Valle del Cauca',
      phone: '315 473 7320 / 318 261 9259 / 313 665 8516',
      needsText:
        'Alimentos no perecederos, agua, insumos médicos, elementos de protección, herramientas de rescate, kits de aseo - para una brigada multi-equipo hacia Yotoco, Buenaventura, Toro, Roldanillo, El Cairo, Argelia y San José del Palmar (nombrado explícitamente). También dinero vía Nequi/Llave @3183391535 (Laura Serna).',
      sourceUrl: 'https://www.instagram.com/p/Db9z9RPDpRd/',
      sourceOrg: null,
      submitterNote: 'Dirección exacta, tres teléfonos, cuenta Nequi nombrada, hilo de comentarios activo con preguntas reales de donantes. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Ensifera Nature / Fundación Serraniagua - Cali',
      address: 'Carrera 5 #3-76, Barrio San Antonio, Cali',
      phone: '310 741 1557 (Dahiana Murillo)',
      needsText: 'Alimentos no perecederos, comida para mascotas, insumos de higiene/limpieza, ropa, cobijas, medicinas, linternas - explícitamente para El Cairo (Valle) y San José del Palmar. Recepción hasta el viernes 14 de agosto, 7pm.',
      sourceUrl: 'https://www.instagram.com/p/Db-6wbCDju9/',
      sourceOrg: 'Fundación Serraniagua',
      submitterNote: 'Contacto nombrado con teléfono, fundación receptora identificable con dos llaves bancarias propias, co-organizado con la Sociedad Vallecaucana de Ornitología. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Mestizo Centro Cultural y Artístico - Bogotá',
      address: 'Cra. 15A #44-67, Teusaquillo, Bogotá',
      phone: null,
      needsText:
        'Materiales de construcción, herramientas de búsqueda, medicamentos básicos, elementos de aseo, pañales, alimento para mascotas, y dinero para compra directa de insumos urgentes - explícitamente para San José del Palmar, La Molana (corregimiento) y El Atrato, Chocó. Jornada central sábado 15 de agosto, 4-9pm.',
      sourceUrl: 'https://www.instagram.com/p/Db8_OMym7VT/',
      sourceOrg: 'Mestizo Centro Cultural y Artístico',
      submitterNote:
        'Encontrado independientemente en Instagram, Facebook y TikTok (3 de 5 agentes). Venue nombrado con dirección exacta, horario específico, hilo de comentarios activo con confirmaciones, y un contacto local (@afrosancco, el Consejo Comunitario del corregimiento San Pedro de Ingará) coordinando la entrega. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Cali (El Caney) - camiones hacia San José del Palmar y Alto/Medio/Bajo Baudó',
      address: 'Calle 81 #42-41, El Caney, Cali, Valle del Cauca',
      phone: '313 591 6732 / 310 512 8471',
      needsText: 'Donaciones en especie para camiones que salieron/salen hacia el Alto, Medio y Bajo Baudó, incluyendo San José del Palmar explícitamente.',
      sourceUrl: 'https://www.facebook.com/itamaria83/posts/pfbid02nTAgX79ebzJ5NnJzmgNRGtwt3vJuqFUp26YJsixypxzYAP85fUzY2MGTiVSDn137l',
      sourceOrg: null,
      submitterNote: 'Encontrado independientemente en Facebook y por el agente de crowdfunding. Dirección exacta y dos teléfonos, publicado el mismo día de la salida de los camiones. Confianza media-alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Pajaros Tejedores / red Mestizo - solicitud de camión hacia San Pedro de Ingará',
      address: 'Bogotá, Colombia (punto de recogida exacto no dado; coordinación telefónica)',
      phone: '+57 304 384 2972 (Gabriela)',
      needsText: 'Se busca donación de un viaje en camión para llevar insumos de primera necesidad al Consejo Comunitario Afrodescendiente de San Pedro de Ingará, corregimiento de San José del Palmar.',
      sourceUrl: 'https://www.instagram.com/p/Db_sG1OJaXx/',
      sourceOrg: null,
      submitterNote:
        'Contacto nombrado con teléfono, etiqueta a múltiples organizaciones reales y verificadas cruzadamente (@mestizocentrocultural, @subase_a_la_vida, @afrosancco - esta última confirmada como la cuenta real del Consejo Comunitario). Necesidad específica y distinta (transporte) de los otros puntos de acopio de la red Mestizo. Confianza media-alta.',
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
      platform: 'X' as const,
      permalink: 'https://x.com/NubiaCarolinaCC/status/2088416322950423040',
      authorHandle: '@NubiaCarolinaCC (Gobernadora del Chocó)',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar',
      note: 'Actualización oficial: el despliegue de ayuda humanitaria de emergencia llegó a San José del Palmar, Unión Panamericana y parte de Medrano (Quibdó); el equipo continúa hacia Litoral del San Juan y Atrato.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/CanalCapital/status/2086962441108263320',
      authorHandle: '@CanalCapital',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar (contexto nacional)',
      note: 'El Gobierno Nacional avanza a la segunda fase de respuesta de emergencia tras el sismo con epicentro en San José del Palmar: 13,077 viviendas afectadas, 354 personas rescatadas, 378 desaparecidas a nivel nacional.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/mygsdboy/status/2087642571892035790',
      authorHandle: '@mygsdboy',
      category: 'NEED' as const,
      placeName: 'San José del Palmar',
      note:
        'Hilo pidiendo ayuda para Laura Mosquera, residente del propio pueblo, quien recolecta dinero y donaciones localmente e intentaba conseguir una planta eléctrica para restablecer el servicio; el mismo hilo comparte también la campaña Vaki ya sembrada arriba.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6bLcEAd-j/',
      authorHandle: 'alcaldiamunicipalsjp',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar',
      note: 'Comunicado oficial de la Alcaldía: sismo M7.4 con epicentro en el municipio, 0 muertos, 2 heridos, 2 desaparecidos (al momento del post), 30% de vivienda rural con colapso parcial, vías cortadas por 14 derrumbes, sin energía. Necesidad inmediata: víveres.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db-7fuYoN06/',
      authorHandle: 'elnorte_hoy',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar',
      note:
        'Actualización local detallada (13 ago): la única vía de acceso al municipio estaba bloqueada por derrumbes, incomunicando varias comunidades rurales; el alcalde reportó 441 viviendas con daños y 40 colapsadas totalmente, ~20 veredas afectadas, ~3 días sin energía; la Gobernadora del Chocó confirmó que ya no quedan reportes de personas desaparecidas (resuelve la cifra de 2 desaparecidos del comunicado anterior).',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8_OMym7VT/',
      authorHandle: 'mestizocentrocultural',
      category: 'AID_POINT' as const,
      placeName: 'Bogotá (hacia San José del Palmar, La Molana, El Atrato)',
      note: 'Anuncio del centro cultural sobre su jornada de recolección de donaciones para las tres comunidades.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8no9CoGFM/',
      authorHandle: 'FRANCE 24 Español',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar',
      note: 'Video citando al alcalde León Fabio Marín Moncada describiendo la situación del pueblo como epicentro del sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/andreyjimenezorozco/posts/pfbid025GCMfkKgX1ssAJEyQE5mV3EnmPfN9kuWxEpYezQKFTMJjYemw1JmoxLSHYZcRqsZl',
      authorHandle: 'Andrey Jimenez Orozco',
      category: 'NEED' as const,
      placeName: 'Zona rural dispersa, San José del Palmar',
      note: 'En la zona rural del municipio hay personas viviendo en casas estructuralmente inseguras en riesgo de colapso; los residentes pueden solicitar alojamiento en el PMU (Puesto de Mando Unificado), el mecanismo oficial de coordinación de la emergencia - sin dirección/contacto específico del PMU en el post.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/itamaria83/posts/pfbid02nTAgX79ebzJ5NnJzmgNRGtwt3vJuqFUp26YJsixypxzYAP85fUzY2MGTiVSDn137l',
      authorHandle: 'Ita María',
      category: 'AID_POINT' as const,
      placeName: 'Cali (El Caney)',
      note: 'Recolección de donaciones en especie en Cali para camiones hacia San José del Palmar y el Alto/Medio/Bajo Baudó.',
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
