/**
 * Pass 45 (2026-08-15) — first city in a new fourth research round across
 * all 10 tracked cities. Pereira had already had three exhaustive rounds
 * (passes 13, 14, 23, 32), so this pass was explicitly scoped to skip
 * everything already known and hunt for: fresh 24-48h posts, status
 * updates to existing aid points, new scams, reconstruction-phase news,
 * missing-persons resolutions, and new crowdfunding campaigns. Genuinely
 * new finds: 2 new official shelter points (3 original shelters now at
 * capacity), 6 new crowdfunding campaigns, 2 missing-persons resolutions,
 * a second confirmed Hotel Dibeni fatality, and — notably — ArriendoYa.org,
 * a grassroots rental-matching platform that fills the "no verified
 * grassroots housing offer" gap this project's research repeatedly
 * concluded was a dead end via X specifically (it lives on Instagram/its
 * own site instead). See wiki/17-allied-resources-and-community.md
 * "Pass 45" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass45-pereira-round4.ts`.
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
      name: 'Polideportivo Belalcázar (Boston)',
      address: 'Sector Boston, Polideportivo Belalcázar, Pereira, Risaralda',
      phone: null,
      needsText: 'Capacidad de albergue general para familias desplazadas, ya que los albergues originales (El Vergel, Coliseo Mayor, Estadio Mora Mora) llegaron a su límite de aforo.',
      sourceUrl: 'https://www.facebook.com/cncpluscol/posts/pfbid0315RQDzeXKgWckPwnh8xTo4817mM4VrX9f7Wrkfh3LRvZcKEndmggVgCCeqYdAhp2l',
      sourceOrg: 'Alcaldía de Pereira',
      submitterNote: 'Fuente: infografía oficial de la Alcaldía de Pereira "ACTUALIZACIÓN — PUNTOS DE ALBERGUE" (viernes 14 de agosto, 8:30am), republicada por CNC Plus. Alta confianza.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Plazoleta de la Villa Olímpica',
      address: 'Plazoleta, Villa Olímpica, Pereira, Risaralda',
      phone: null,
      needsText: 'Capacidad de albergue general para familias desplazadas.',
      sourceUrl: 'https://www.facebook.com/cncpluscol/posts/pfbid0315RQDzeXKgWckPwnh8xTo4817mM4VrX9f7Wrkfh3LRvZcKEndmggVgCCeqYdAhp2l',
      sourceOrg: 'Alcaldía de Pereira',
      submitterNote: 'Misma infografía oficial de la Alcaldía de Pereira. Corroborado de forma independiente por una publicación ciudadana (Yulieth Cortés Restrepo) que confirma espacio disponible bajo el nombre "ALBERGUE DE LA VILLA". Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Direct Relief for Pereira Earthquake Victims (Michael Martin & Tatiana Alvarez)',
      address: null,
      phone: null,
      needsText: 'Comidas diarias (200-300/día), insumos médicos y para mascotas, y transporte, operados directamente por la familia de la organizadora en Pereira.',
      sourceUrl: 'https://www.gofundme.com/f/direct-relief-for-pereira-earthquake-victims',
      sourceOrg: null,
      submitterNote: 'Organizadora en Jupiter, FL; familia beneficiaria confirmada en Pereira, con roles individuales nombrados (madre operando comidas, hermano insumos médicos, padrastro transporte). $2,636 recaudados de $5,000, 21 donaciones. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Colombia-Pereira earthquake (Juan Bedoya Ocampo)',
      address: null,
      phone: null,
      needsText: 'Agua, comida, pañales, medicinas y alimento para mascotas/animales, más apoyo a voluntarios.',
      sourceUrl: 'https://www.gofundme.com/f/colombiapereira-earthquake-393by',
      sourceOrg: null,
      submitterNote: 'Organizador colombiano residente en Inglaterra, familia evacuada pero segura en Pereira. £405 recaudadas de £4,000, 13 donaciones. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Pereira Earthquake Survivors (Juan Castano)',
      address: null,
      phone: null,
      needsText: 'Agua, comida, medicinas, carpas y cobijas para familias que duermen a la intemperie tras el colapso de edificios.',
      sourceUrl: 'https://www.gofundme.com/f/help-pereira-earthquake-survivors-5cwz2',
      sourceOrg: null,
      submitterNote: 'Organizador en West Chester, PA. $650 recaudados de $2,000, 15 donaciones. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Pereira Earthquake Home Repair & Relief Fund (Vanessa Gelacio)',
      address: null,
      phone: null,
      needsText: 'Reparación de viviendas dañadas, alojamiento temporal en propiedades vacías de la red de arrendamiento de la familia, y costos de reubicación — explícitamente no para ganancia de la empresa.',
      sourceUrl: 'https://www.gofundme.com/f/pereira-earthquake-home-repair-relief-fund',
      sourceOrg: null,
      submitterNote: 'Organizadora en Los Ángeles, CA, cuya familia opera una inmobiliaria en Pereira; están haciendo un censo de propiedades dañadas en su red de arrendatarios/propietarios. $1,439 recaudados de $35,000, 25 donaciones, creada hace 4 días. La más orientada a fase de reconstrucción de las campañas nuevas encontradas esta ronda. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Ayudemos a la familia Millán a reconstruir su hogar (Monica Pineda)',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de vivienda para la familia Millán, que incluye un adulto mayor que necesita medicación y cuidado continuo.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-la-familia-mill-n-a-reconstruir-su-hogar',
      sourceOrg: null,
      submitterNote: 'Organizadora con insignia "verificado" de Vaki. US$2,004 recaudados, 64 donantes individuales, donación más reciente 55 minutos antes de esta revisión, cierra 27 de noviembre de 2026. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe/Vaki — Ayuda a Angie y Thiago a reconstruir (Carlos Andrés Cortés)',
      address: null,
      phone: null,
      needsText: 'Alojamiento temporal, comida, ropa y apoyo médico/terapéutico para Thiago, un niño de 4 años con autismo no verbal, tras la destrucción de su vivienda en Pereira.',
      sourceUrl: 'https://www.facebook.com/ingcarlosandres/posts/pfbid0zi8J3hNdiv5nNRGx7tCQy8MWghHiZWymVxD1UJ6wtdHyZs2xUrbnNxXzB2aFCKzZl',
      sourceOrg: null,
      submitterNote: 'CONFIANZA BAJA (incluido con cautela explícita): organizador con insignia verificada de Vaki y evidencia fotográfica/video del daño, pero tracción muy baja ($122 recaudados de 2 donantes tras 4 días). A diferencia de campañas similares ya rechazadas en pasadas anteriores por cero tracción, esta sí tiene donaciones reales y un organizador identificable, así que se incluye pero con la tracción baja señalada explícitamente para quien revise.',
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
      permalink: 'https://x.com/elespectador/status/2088420405682073817',
      authorHandle: '@elespectador',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional, incluye balance de Pereira/Risaralda)',
      note: 'La familia Santo Domingo (dinastía empresarial colombiana) donará COP 100 mil millones para las víctimas del terremoto. Cifra nacional más reciente de UNGRD citada: 3,971 heridos, 379 desaparecidos, 281 fallecidos. Señal de fase de reconstrucción/filantropía a gran escala, distinta de la cobertura de respuesta de emergencia ya documentada.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/WCKitchen/status/2088414278961557613',
      authorHandle: '@WCKitchen',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira (también Cali, Chocó, Manizales)',
      note: 'World Central Kitchen confirma que sigue operando en el terreno sirviendo comidas en Pereira, Cali, Chocó y Manizales, expandiendo operaciones cinco días después del terremoto — confirma continuidad, no es un hallazgo puntual.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/elmeridiano_co/status/2087165623222591661',
      authorHandle: '@elmeridiano_co',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira',
      note: 'Carlos Cortés Alarcón, un joven de una familia de Córdoba que estaba en Pereira durante el sismo, fue encontrado con vida (herido) tras horas de incertidumbre para sus familiares.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8uh2fJn-X/',
      authorHandle: 'estivenlucas',
      category: 'AID_POINT' as const,
      placeName: 'Pereira (también Manizales, Santa Rosa de Cabal, Armenia, Cali)',
      note: 'HALLAZGO NOTABLE: ArriendoYa.org, una plataforma comunitaria de emparejamiento de arriendos creada tras el terremoto, con más de 250 familias desplazadas registradas (incluyendo en Pereira) buscando vivienda, y un llamado a quienes tengan inmuebles vacantes para publicarlos. Esto es exactamente la categoría de "oferta de alojamiento de base" que pasadas anteriores de este proyecto (buscando específicamente en X) habían concluido que era un callejón sin salida confirmado — existe en Instagram/como sitio propio en cambio. Vale la pena evaluarla para /recursos en una pasada futura.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db596ZbnKp5/',
      authorHandle: 'lavirginiaenvivo',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira / La Virginia, Risaralda',
      note: 'RESOLUCIÓN de persona desaparecida: Marlon García Ruíz, reportado atrapado/desaparecido en Pereira justo después del sismo, confirmado sano y salvo en un comentario de respuesta en la misma publicación dos días después.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6nopJRYee/',
      authorHandle: 'viajandoandoeneleje',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira, Risaralda',
      note: 'RESOLUCIÓN de personas desaparecidas: Génesis Guerrero y Gabriel Guerrero, reportados desaparecidos tras el terremoto en Pereira, confirmados encontrados por la misma publicadora y de forma independiente por una comentarista que se identifica como conocida de la familia. Confianza media: Instagram marcó este post/clúster como "contenido de IA", lo que limita la confianza según la disciplina ya establecida en este proyecto para publicaciones marcadas así.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cncpluscol/posts/pfbid0315RQDzeXKgWckPwnh8xTo4817mM4VrX9f7Wrkfh3LRvZcKEndmggVgCCeqYdAhp2l',
      authorHandle: 'CNC Plus',
      category: 'OFFICIAL' as const,
      placeName: 'Red de albergues de Pereira (actualización oficial de la Alcaldía)',
      note: 'Infografía oficial de la Alcaldía de Pereira (viernes 14 de agosto, 8:30am): Ecoparque El Vergel, Coliseo Mayor y Estadio Mora Mora ya están a "límite de aforo". A las familias que aún necesitan albergue se les dirige a Parque El Oso, Parque Olaya, Polideportivo Belalcázar (Boston) y la Plazoleta de la Villa Olímpica (estos dos últimos, sembrados como nuevos puntos de ayuda arriba).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/periodicopalabrasmayores/posts/pfbid0EJjWkPDNunx7YXbdD89ZYZWuHdGijeq2J6xfw6hq61HNs23URhjvGu8d7JCJRVpvl',
      authorHandle: 'Periodico Palabras Mayores',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hotel Dibeni, Pereira',
      note: 'Juan Fernando Rodríguez Álvarez, residente de Ibagué que se hospedaba en el Hotel Dibeni (Carrera 8 #15-55, Pereira) cuando ocurrió el terremoto, fue encontrado muerto tras varios días de búsqueda — una segunda fatalidad confirmada de ese colapso hotelero, distinta del caso ya documentado de Juan Felipe Giraldo. Fuente única, no corroborada de forma independiente aún.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/enteratedigital1/posts/pfbid0HMmEGue3oB3ahfd3LHb68fpLwxvzhyPVdeXrGn5pwxb1iXCmhgxBJaPQidsfgg4jl',
      authorHandle: 'Entérate Digital',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira / Risaralda',
      note: 'El presidente Abelardo De La Espriella anunció que la reconstrucción de Pereira/Risaralda se incluirá formalmente en la declaratoria de Emergencia Económica y en el Plan Nacional de Desarrollo, enfocada en vivienda, colegios, hospitales y edificios públicos. Repite las cifras de balance ya conocidas (94 fallecidos, 260 desaparecidos, 259 heridos, 260 rescatados) pero añade el detalle concreto de política pública (inclusión en el PND) no capturado antes.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@speakerfinanciera/video/7674063441363045653',
      authorHandle: '@speakerfinanciera',
      category: 'NEED' as const,
      placeName: 'Expofuturo Event Center, Pereira',
      note: 'PRECAUCIÓN, sin corroborar: video con etiqueta de ubicación propia de TikTok ("Expofuturo Event Center · Pereira"), 5,000+ me gusta, alega que Expofuturo (punto de acopio ya sembrado desde la pasada 1, y ya señalado una vez antes en la pasada 23 por un rumor de que tenía "suficientes donaciones") se ha vuelto un instrumento de presión política, con donaciones y votos siendo canalizados hacia políticos específicos en vez de ir a la ayuda. Cuenta personal de finanzas, no un ente institucional de vigilancia — mismo nivel de evidencia que el rumor ya registrado de reventa en Homecenter (pasada 23) y el hallazgo de código QR roto de Manos Visibles (pasada 12): una advertencia junto a un punto de ayuda ya confiable, no un hecho confirmado.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcADzh_J43q/',
      authorHandle: 'salondada_vintage',
      category: 'NEED' as const,
      placeName: 'Pereira/Dosquebradas, Risaralda',
      note: 'Nueva campaña: una tienda de ropa vintage administrada por madre e hija lanzó "bonos solidarios y de reconstrucción" desde $20,000 COP — lo recaudado financia distribución de ropa a puntos de acopio y apoyo a la familia/taller tras que 3 familiares de edad avanzada fueran afectados (una perdió su vivienda). Cuentas: Nequi 3207856732, llave Bre-B @mariana844, titular Mariana Pulido.',
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
