/**
 * Pass 47 (2026-08-15) — third city in the fourth research round,
 * Manizales. Three prior rounds (passes 16, 25, 34) already covered this
 * city exhaustively, so this pass hunted for fresh posts, status updates,
 * new scams, reconstruction-phase news, missing-persons resolutions, and
 * new crowdfunding campaigns. This round's yield skewed heavily toward
 * reconstruction-phase content: an official "second phase" housing
 * recovery program, several individual family crowdfunding campaigns
 * (several cross-corroborated by 2-3 independent agents), two distinct
 * new scam-warning threads (ICBF impersonation, rent price-gouging), and
 * — notably — an official government report stating there are ZERO
 * missing persons in Manizales or anywhere in Caldas, which resolves this
 * round's missing-persons angle systemically rather than case-by-case.
 * See wiki/17-allied-resources-and-community.md "Pass 47" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass47-manizales-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Coliseo Menor de Manizales — Centro de Acopio (Once Caldas)',
      address: 'Coliseo Menor, Manizales (junto al complejo del Estadio Palogrande)',
      phone: null,
      needsText: 'Donaciones generales, punto organizado con apoyo del club de fútbol Once Caldas.',
      sourceUrl: 'https://x.com/Ditu_Tv/status/2088407824850399565',
      sourceOrg: 'Once Caldas',
      submitterNote: 'Corroborado por 3+ publicaciones independientes en la misma ventana de 24-48h: jugadores de Once Caldas (Jefry Zapata, Juan Patiño), el técnico Hernán Darío Herrera y el goleador Dayro Moreno fueron vistos/fotografiados trabajando en el punto; también cubierto por Caracol Deportes y un testigo en Facebook. POSIBLE SUPERPOSICIÓN A VERIFICAR: podría tratarse del mismo complejo de coliseos ya vinculado al punto de acopio de la Universidad de Caldas (Coliseo/Velódromo) de pasadas anteriores, o de un punto distinto dentro del mismo complejo — se deja señalado para que quien modere lo revise antes de aprobar.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Coliseos Mayor, Menor y San Rafael — Albergues Temporales (Alcaldía de Manizales)',
      address: 'Coliseo Mayor, Coliseo Menor y Coliseo San Rafael, Manizales',
      phone: null,
      needsText: 'Albergue temporal para personas cuyas viviendas resultaron dañadas y no son seguras para habitar.',
      sourceUrl: 'https://www.lapatria.com/manizales/paso-paso-que-hacer-en-manizales-si-su-casa-sufrio-danos-por-el-terremoto',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Guía oficial publicada por La Patria (diario principal de Manizales), parte de un artículo paso a paso sobre qué hacer si la vivienda sufrió daños, citando el protocolo de emergencia habitacional de la Alcaldía.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Donación terremoto Casa Manizales (Vaki — Mariana Montes González)',
      address: null,
      phone: 'Nequi 313 661 9200',
      needsText: 'Ayuda para una familia desplazada de su apartamento dañado (muros agrietados, techo/paredes colapsadas, electrodomésticos y pertenencias perdidas), actualmente viviendo con familiares. Buscan asegurar nueva vivienda.',
      sourceUrl: 'https://vaki.co/vaki/donaci-n-terremoto-casa-manizales',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por tres de los cinco agentes de esta pasada (Instagram, TikTok y el barrido de crowdfunding dedicado). Insignia de organizador verificado en Vaki, creada el 11 de agosto, US$986 recaudados de meta US$10,000 con 21 donantes nombrados/anónimos al 15 de agosto, cierra el 16 de septiembre.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Ayúdanos a reconstruir el hogar de nuestra Mamá en Manizales (Vaki — Ana Lida Vélez Rico)',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de la vivienda de la madre de la familia, con daño estructural severo y evacuada. Los fondos cubren costos no reembolsados por el seguro o la ayuda institucional.',
      sourceUrl: 'https://vaki.co/vaki/reconstruyamos-el-hogar-familiar-tras-el-terremoto-de-colombia',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por tres de los cinco agentes de esta pasada. Organizador con insignia verificada de Vaki (Jose Ivan Vallejo Velez), creada el 12 de agosto. Señal de transparencia inusual: la campaña declara explícitamente que están gestionando un reclamo de seguro en paralelo y que la donación solo cubrirá lo que el seguro/ayuda institucional no cubra, para evitar duplicar recaudos — primera campaña de este proyecto con esa aclaración explícita. Confianza media: cero donantes en la última revisión (campaña muy reciente).',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Reconstruyamos el taller de mi abuela (GoFundMe — Sandra Milena Rendón Valencia)',
      address: null,
      phone: null,
      needsText: 'Reconstrucción del local comercial de la abuela de la organizadora, con orden de demolición tras el colapso estructural parcial. Cubre gastos de vida básicos, mercancía de reemplazo y un espacio de trabajo temporal para reanudar su negocio.',
      sourceUrl: 'https://www.gofundme.com/f/reconstruyamos-el-taller-de-mi-abuela',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por tres de los cinco agentes de esta pasada. Organizador nombrado (Juan José Marín Rendón, residente en España) y beneficiaria nombrada (su abuela). €488 recaudados de meta €2,200, 18 donantes reales y fechados. Alta confianza — la más consolidada de las campañas nuevas de reconstrucción de esta pasada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Ayudemos a Diana López a volver a empezar (Vaki)',
      address: 'Barrio La Avanzada, Manizales',
      phone: null,
      needsText: 'Alquiler de vivienda temporal, bienes básicos del hogar y herramientas de trabajo de reemplazo (manicura) para una manicurista cuya casa fue ordenada demoler, con dos hijas y una mascota.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-diana-l-pez-a-volver-a-empezar',
      sourceOrg: null,
      submitterNote: 'Historia individual muy concreta: beneficiaria nombrada, hijas nombradas (Isabela, Valeria), mascota nombrada (Candy), barrio La Avanzada ya documentado independientemente por este proyecto como afectado por el sismo, meta desglosada por rubro (arriendo, camas, nevera, estufa, ropa, comida, herramientas de trabajo). Cero donantes en la última revisión — campaña recién creada. Confianza media dada la especificidad pese a la falta de tracción aún.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'El Café de Nico (Vaki)',
      address: null,
      phone: null,
      needsText: 'Ayuda para encontrar nueva vivienda y reemplazar equipo de preparación de café (incluyendo un V60) para un emprendedor cafetero de 22 años con discapacidad que perdió su casa y la mayoría de su equipo en el sismo.',
      sourceUrl: 'https://vaki.co/vaki/elcafedenico',
      sourceOrg: null,
      submitterNote: 'Historia individual concreta y consistente (Nicolás, con "El Café de Nico" operando hace 3 años en ferias/eventos/competencias), sin señales de presión de urgencia. Cero donantes en la última revisión — campaña recién creada. Confianza media-baja dada la falta de tracción y verificación externa.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'VELTRA — punto de acopio',
      address: 'Cra. 25 #24-21, Manizales, Caldas',
      phone: 'WhatsApp 310 757 6221 / 310 899 0911',
      needsText: 'Alimentos no perecederos, productos de higiene, elementos de primeros auxilios.',
      sourceUrl: 'https://www.instagram.com/p/Db6-MplNT1Z/',
      sourceOrg: null,
      submitterNote: 'Negocio local identificable (v_e_l_t_r_a) con dirección exacta y dos números de WhatsApp funcionales, 62 me gusta con comentarios de cuentas reales. No encontrado en ninguna de las tres pasadas anteriores. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Barón Rojo Sur Manizales — Gran Recolecta de Insumos',
      address: 'Parque Caldas, Manizales',
      phone: null,
      needsText: 'Insumos generales para damnificados del terremoto.',
      sourceUrl: 'https://www.facebook.com/baronrojomanizales/posts/pfbid0vsmtf4jVZTiyAyHqj6N5xzDATskwBVg1xMk8QK1Ci24azizwJvEBbeyFXUSVodiwl',
      sourceOrg: 'Barón Rojo Sur Manizales (barra de Once Caldas)',
      submitterNote: 'Barra organizada e identificable, publicación propia con gráfico de evento fechado. NOTA DE VIGENCIA: la jornada estaba programada para el sábado 15 al lunes 17 de agosto — quien modere debe verificar que el punto siga activo antes de aprobarlo, ya que podría ser una campaña puntual ya finalizada. Confianza media, sin corroboración independiente de una segunda fuente.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Ayudemos a Adiela, Marina y Martha a empezar de nuevo (Vaki)',
      address: 'Barrio Chipre, Manizales',
      phone: null,
      needsText: 'Apoyo para tres hermanas de edad avanzada cuyo edificio de apartamentos en Chipre continúa hundiéndose tras el sismo y es inseguro para reingresar a recuperar pertenencias.',
      sourceUrl: 'https://www.facebook.com/groups/841908659236969/?multi_permalinks=27935538626113939',
      sourceOrg: null,
      submitterNote: 'Beneficiarias nombradas, situación específica del edificio descrita en detalle, organizada por la diáspora a través de un grupo de colombianos en Minnesota — mismo patrón de solidaridad diaspórica ya visto como legítimo en pasadas anteriores. Confianza media.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/juridicasysociales/posts/pfbid0iCa9chrhn7VHVJTH34hLehka9mws19Kq5tiw9ss8eTZtmxhX5Z6ja3m4LKLv5Kqxl',
      authorHandle: 'Facultad Ciencias Jurídicas y Sociales (Universidad de Caldas)',
      category: 'AID_POINT' as const,
      placeName: 'Universidad de Caldas — Centro de Acopio (Coliseo), Manizales',
      note: 'ACTUALIZACIÓN DE ESTADO: el punto de acopio de la Universidad de Caldas, ya conocido desde pasadas anteriores, anuncia "¡ÚLTIMO DÍA PARA DONAR!" — el punto está cerrando, no expandiéndose.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Tucanaldigital/posts/pfbid0256ux8XAqcHd7m3iKC87WDSoabq6ZYRwaXmbwGV36mfDcAubNynye1aw6nViUiFfal',
      authorHandle: 'Tu Canal Manizales',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'NUEVA ALERTA DE ESTAFA: la directora del ICBF, María Carolina Restrepo, aclaró públicamente que el ICBF NO solicita dinero ni recibe donaciones para esta emergencia — esa función corresponde a la oficina de la Primera Dama, Ana Lucía Pineda. Se pide al público verificar antes de entregar dinero, bienes o hacer transferencias, especialmente ante solicitudes que usan el nombre/logo de entidades públicas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/RedVoxNoticias/posts/pfbid0FbKne3LYpsHqQx5mX4DTssZwtyfWdA9mvhdkvFGmUncCs6aW15XGCk2wCtnyBjxsl',
      authorHandle: 'Red Vox Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales y Villamaría',
      note: 'NUEVA ALERTA: cobros excesivos de arriendo dirigidos a familias desplazadas por el sismo en Manizales y Villamaría (ejemplo concreto encontrado: alquiler subido de ~$2 a ~$2.5 millones COP). Cita la Ley 820 de 2003 (topes a incrementos de arriendo urbano) y advierte que esta conducta podría abrir investigación. Corroborado el mismo día por Pulzo y El Tiempo, que reportan también sobrecostos en materiales de construcción.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/m.alejandra.gonzalez.727930/posts/pfbid01QY19uXQejyoMp5SJdWxatxQr8PxJYJxaTXXEt7RDLHMurRyxECvAUbVRBnenvggl',
      authorHandle: 'M Alejandra Gonzalez',
      category: 'NEED' as const,
      placeName: 'Manizales / Villamaría',
      note: 'ADVERTENCIA de estafa nombrada: una mujer que hace transmisiones en vivo solicitando donaciones para el terremoto nunca ha entregado ayuda y sigue pidiendo dinero. Corroborado por una segunda publicación independiente de alto alcance ("estas mujeres estafadoras han vuelto a aparecer") y un comentarista independiente adicional describiendo el mismo patrón. Sin confirmación policial oficial — tratar como advertencia comunitaria, no como fraude judicialmente comprobado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/CiudadManizales/posts/pfbid02FJwbkREC955Sqz4362wLcfPTGDM1gCqQwiETorv6jsRaqX4zrdo4t1egMrCnTdRyl',
      authorHandle: 'Alcaldía de Manizales',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'FASE DE RECONSTRUCCIÓN: el Gobierno nacional anunció una "segunda etapa" de recuperación de vivienda para familias afectadas en Caldas (Ministro de Vivienda Jaime Andrés Beltrán, gobernador Henry Gutiérrez y los 27 alcaldes municipales). Primeras medidas concretas: subsidios de arriendo para familias que perdieron vivienda y un subsidio de alivio en servicios públicos.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_2T_hNYF6/',
      authorHandle: 'estefaniaserna1',
      category: 'NEED' as const,
      placeName: 'Manizales',
      note: 'Necesidad urgente: una fundación que cuida a 22 adultos mayores perdió su vivienda por el sismo y necesitaba una casa/finca grande para albergarlos esa misma noche. Contacto: Jaime Hernández, 302 491 1592.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@revistasemana',
      authorHandle: '@revistasemana',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales / departamento de Caldas',
      note: 'RESOLUCIÓN de personas desaparecidas (sistémica, no caso por caso): reporte oficial del Gobierno confirma el balance de Manizales en 5 fallecidos, 112 heridos, 142 personas en albergues temporales, y confirma explícitamente que NO hay personas desaparecidas reportadas en Manizales ni en ningún municipio de Caldas.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@lapatriacom/video/7673957546385755413',
      authorHandle: '@lapatriacom',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'CONTRASTE IMPORTANTE: pese a los anuncios oficiales de subsidios de arriendo y alivio de servicios públicos, La Patria (diario histórico de Manizales) advierte que, a la fecha de esta publicación, ese dinero AÚN NO había sido desembolsado a las víctimas del terremoto — una advertencia contra dar por hecho que la ayuda anunciada ya está fluyendo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7674095145259715860',
      authorHandle: '@noticiascaracol',
      category: 'OFFICIAL' as const,
      placeName: 'Barrio Milán, Manizales',
      note: 'DESARROLLO NUEVO DE FASE DE RECUPERACIÓN (el hallazgo más reciente de esta pasada, ~4 horas de antigüedad): Noticias Caracol reporta que las edificaciones del Barrio Milán, Manizales, están siendo marcadas con símbolos de daño estructural que indican cuáles deben demolerse (ej. "DE" = Daño Estructural), y explica cómo interpretar los distintos códigos.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@hardtabogados/video/7673147707762150673',
      authorHandle: '@hardtabogados',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales (también Cali, Pereira, Armenia, Quibdó)',
      note: 'Explicación legal gratuita de los 8 pasos para acceder a beneficios oficiales de reconstrucción: subsidio de arriendo, un giro de $500,000 COP y 3 meses de servicios públicos gratuitos, condicionado a registrarse en el censo de damnificados de cada ciudad. La firma aclara explícitamente que no cobra por estos trámites.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/vivimoli84/posts/pfbid0uwPU28sjEWCm4kFTrFsxdjw7aXazssw4BhKodBGecRVCL3zGf1Da1wC9BPFcSGQrl',
      authorHandle: 'Viviana Molina',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Chipre, Manizales',
      note: 'Relato personal de la pérdida de su vivienda (afectada por edificios vecinos) y la destrucción del conocido supermercado Rancho Rojo en Chipre; familia a salvo, enfocado en la reconstrucción.',
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
