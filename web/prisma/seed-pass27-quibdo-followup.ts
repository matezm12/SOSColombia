/**
 * Pass 27 (2026-08-14) — follow-up social media research pass on Quibdó,
 * days after the original deep pass (wiki pass 18 + Facebook retry). The
 * hospital's already-broken blood-bank refrigeration got WORSE, not better:
 * a new 4.2 aftershock forced total evacuation of Hospital San Francisco de
 * Asís. Also surfaces a genuinely new official international donation
 * channel from the Alcaldía itself, a nearly-fully-funded diaspora GoFundMe,
 * and a footballer-led donation channel corroborated across many mainstream
 * outlets. See wiki/17-allied-resources-and-community.md "Pass 27" for full
 * reasoning. Run once via `npx tsx prisma/seed-pass27-quibdo-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const aidPoints = [
    {
      kind: 'HEALTH' as const,
      name: 'Hospital San Francisco de Asís - actualización: evacuación total tras réplica',
      address: 'Hospital San Francisco de Asís, Quibdó, Chocó',
      phone: '313 698 2755 (WhatsApp, Gobernación del Chocó, para quien pueda donar/conseguir la nevera)',
      needsText:
        'ACTUALIZACIÓN GRAVE: además de la refrigeración de sangre aún dañada (ver pasada anterior), una nueva réplica de magnitud 4.2 forzó la EVACUACIÓN TOTAL del hospital. El centro sigue atendiendo pacientes del sismo desde instalaciones alternas. La Gobernación del Chocó publicó un WhatsApp de contacto para quien pueda donar o conseguir una nevera especializada para banco de sangre.',
      sourceUrl: 'https://www.elcolombiano.com/colombia/choco-necesita-nevera-para-almacenar-sangre-heridos-terremotos-MH39857957',
      sourceOrg: 'Gobernación del Chocó (vía El Colombiano)',
      submitterNote:
        'La evacuación total fue reportada independientemente por El Colombiano (TikTok) y corroborada por CAMBIO visitando el hospital el mismo día. Empeora directamente la situación ya documentada en la pasada anterior (nevera de banco de sangre rota) - no ha habido reparación institucional, solo colectas ciudadanas informales. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Colecta comunitaria "Barnard Stith y Amigos" - nevera para banco de sangre',
      address: null,
      phone: '313 893 0965 (WhatsApp)',
      needsText:
        'Recaudo para comprar una nevera Haier HXC-429 (429L, 4±1°C) especializada para banco de sangre para el Hospital San Francisco de Asís, cuya refrigeración de sangre sigue dañada. Meta: $30,000,000 COP. Cuenta Nu Bank ahorros 58649236, a nombre de Yaissy Bejarano.',
      sourceUrl: 'https://www.instagram.com/p/Db8YFynylrJ/',
      sourceOrg: null,
      submitterNote:
        'Corroborado independientemente por dos plataformas (Instagram, X vía @Gegonhe) con el mismo detalle específico (modelo exacto de nevera). Colecta informal/personal, no institucional, pero con un nivel de especificidad inusual (marca, capacidad, precio exacto). Existe una segunda colecta paralela más pequeña (Nequi/Bre-B 317 213 6721, Marcela Hoyos Vivas) para el mismo fin - no se sembró por separado para evitar confundir a los donantes sobre cuál usar; verificar cuál sigue activa antes de dirigir donaciones. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Alcaldía de Quibdó - Canal Internacional de Donaciones (vía Diócesis de Quibdó)',
      address: null,
      phone: null,
      needsText:
        'Donaciones internacionales en USD, EUR o GBP para familias afectadas por el terremoto en Quibdó, canalizadas a través de la Corporación de la Fe (Diócesis de Quibdó). USD: Citibank NY/JPMorgan Chase NY -> Banco de Bogotá cuentas 10922754 y 001-1-171329. EUR: Deutsche Bank Frankfurt (SWIFT DEUTDEFF) -> Banco de Bogotá cuenta 10095129220000. GBP: J.P. Morgan AG Frankfurt (SWIFT CHASDFX/BBOGCOBB) -> cuenta 0059025056. Beneficiario final: Corporación de la Fe - Diócesis de Quibdó, Banco de Bogotá cuenta corriente 578446940, NIT 818.002.136-1. Enviar comprobante a corporacionenlafe@hotmail.com y Hacienda@quibdo-choco.gov.co.',
      sourceUrl: 'https://www.facebook.com/AlDiaConLaAlcaldiaQuibdo/posts/pfbid02XA44ZboFckWYE5St1knKoh1ryZpaxNanf8pFUnWmkd5y7xdkiRd494ndatfbyCD5l',
      sourceOrg: 'Alcaldía de Quibdó + Diócesis de Quibdó',
      submitterNote:
        'Canal genuinamente nuevo y de alta confianza institucional: publicado directamente por la página oficial de la Alcaldía de Quibdó (quibdo-choco.gov.co), con detalle completo de ruteo bancario/SWIFT y un flujo de verificación por correo. Distinto del canal ya conocido de ASINCH. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Escuela Taller de Quibdó',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de viviendas de familias chocoanas afectadas por el terremoto. Cuenta corriente Bancolombia No. 53602082156, a nombre de la Fundación Escuela Taller de Quibdó.',
      sourceUrl: 'https://www.instagram.com/p/DcAE_A1Ef3g/',
      sourceOrg: 'Fundación Escuela Taller de Quibdó',
      submitterNote:
        'Red de ONG de formación vocacional/restauración patrimonial real y establecida (vínculo histórico con AECID), con ramas hermanas en otras ciudades reposteando el mismo llamado; nombra a la ONG aliada real Manos Visibles. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "El mundo mira al Chocó / Juntos por Chocó" (Fundación Tierra Grata)',
      address: 'Puntos de recepción en especie: Bogotá (Casa Jardín Origen, Human Construction, Fundación Catalina Muñoz) y Cartagena (oficinas de Fundación Tierra Grata Colombia)',
      phone: null,
      needsText: 'Agua, alimentos, insumos de higiene, pañales, cobijas, colchonetas, linternas, medicamentos y primeros auxilios para comunidades afectadas del Chocó.',
      sourceUrl: 'https://www.gofundme.com/f/el-mundo-mira-al-choco',
      sourceOrg: 'Fundación Tierra Grata',
      submitterNote:
        'ONG colombiana real y establecida con trayectoria pública; co-organizadora de la diáspora (Carolina Colpas Fernandez, Hackensack NJ, EE.UU.). Casi completamente financiada: US$98,661 recaudados de meta US$100,000, 1,759 donantes. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Jhon Arias - cuentas de donación (Bancolombia / PIX Brasil)',
      address: null,
      phone: null,
      needsText:
        'El futbolista de la selección Colombia Jhon Arias (oriundo de Quibdó) y su esposa Alejandra Ayala habilitaron cuentas para financiar vuelos de ayuda (tres vuelos entre lunes y miércoles con personal de salud y medicinas) y un camión de 30 toneladas de insumos. Bancolombia ahorros 09800005548 (Colombia); cuenta PIX en Brasil (aguilarayala).',
      sourceUrl: 'https://colombia.as.com/futbol/colombianos-por-el-mundo/jhon-arias-envia-ayuda-a-quibdo-tras-terremoto-llegara-un-avion-con-profesionales-de-la-salud-f202608-n/',
      sourceOrg: 'Fundación Jhon Arias',
      submitterNote:
        'Corroborado por numerosos medios independientes (El Colombiano, AS Colombia, El Tiempo, La FM, ESPN Colombia, Noticias Caracol) citando el mismo número de cuenta; esfuerzo activo y escalando (múltiples vuelos y envíos), no un gesto único. Confianza alta.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: quibdo.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: quibdo.id,
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
      permalink: 'https://x.com/elespectador/status/2088333520443715729',
      authorHandle: '@elespectador',
      category: 'NEED' as const,
      placeName: 'Quibdó (barrios El Futuro, Flores de Buenaños, Villa La Victoria, Obrero La Brisa)',
      note: 'Familias con vivienda afectada siguen en incertidumbre y con deudas; duermen en albergues temporales con niños, adultos mayores y mascotas, piden mayor presencia de la Alcaldía y la Gobernación.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Telemedellin/status/2088421745518604767',
      authorHandle: '@Telemedellin',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó / Chocó',
      note: 'El presidente anuncia desde Quibdó un "gerente especial" para coordinar las necesidades del Chocó con el gobierno nacional.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ELTIEMPO/status/2088249284093510071',
      authorHandle: '@ELTIEMPO',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Chocó',
      note: 'El futbolista Jhon Arias envía su TERCER avión con ayuda para los afectados.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db86xrAgTp7/',
      authorHandle: 'hechoscol',
      category: 'OFFICIAL' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'Confirmación de que la nevera de banco de sangre sigue dañada; 245% de sobrecupo en urgencias, las 9 camas de UCI ocupadas, pacientes trasladados a Antioquia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/mauriciovargasperiodista/posts/pfbid0L6zUQQ3TMv8LpH6QkZxNq7FP5NW1qrJ43kPzXS5Q586vD3qx7kPuvAd9zGC8mRbul',
      authorHandle: 'La Voz Mayor del Tolima',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó / Chocó',
      note: 'El presidente propone un "Plan Marshall" para reconstruir el Chocó, anunciado durante su visita al departamento.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/2242235696616559',
      authorHandle: 'Revista. chocó',
      category: 'NEED' as const,
      placeName: 'Villa Avelina, Quibdó',
      note: '38 viviendas colapsadas en el barrio Villa Avelina; los residentes piden materiales de construcción (láminas de zinc, madera), no solo ayuda de emergencia.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@periodicoelcolombiano/video/7673540072313998610',
      authorHandle: '@periodicoelcolombiano',
      category: 'OFFICIAL' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'Una nueva réplica de magnitud 4.2 forzó la evacuación total del hospital.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@nacionpaisa/video/7674042892939185429',
      authorHandle: '@nacionpaisa',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó / Chocó',
      note: 'El presidente anuncia un gerente especial de reconstrucción para el Chocó como parte del "Plan Marshall" (subsidios de vivienda, movilización de tropas, traslado de heridos a Medellín).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673642719046044948',
      authorHandle: '@noticiascaracol',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó, Chocó',
      note: 'El Vicepresidente José Manuel Restrepo entrega un balance oficial de ayuda humanitaria desde Quibdó.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673882906992938258',
      authorHandle: '@noticiascaracol',
      category: 'NEED' as const,
      placeName: 'Chocó (departamental, incl. Quibdó)',
      note: '38 colegios dañados en el Chocó; más de 20,000 estudiantes siguen sin clases, piden apoyo para reparaciones antes de fin de año.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caracolradio/video/7673711657314569493',
      authorHandle: '@caracolradio',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó (rendición de cuentas de donaciones)',
      note: 'Segmento periodístico investigando si un congresista puede legalmente recolectar donaciones para el Chocó en una cuenta personal/de un amigo - posible delito.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@estoescambio/video/7673625406729129234',
      authorHandle: '@estoescambio',
      category: 'NEED' as const,
      placeName: 'Zona Minera, Quibdó',
      note: 'Una vivienda que resistió el sismo colapsó dos días después tras lluvias fuertes, ilustrando el riesgo estructural continuo en edificaciones debilitadas.',
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
        municipioId: quibdo.id,
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
