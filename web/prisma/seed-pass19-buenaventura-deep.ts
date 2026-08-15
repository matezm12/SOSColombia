/**
 * Pass 19 (2026-08-14) — deep multi-agent research pass on Buenaventura (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven).
 * Sixth city in the per-city deep-pass rotation, following up on the earlier
 * Instagram-only deep dive (pass 12). See
 * wiki/17-allied-resources-and-community.md "Pass 19" for full agent notes,
 * the road-access-gap documentation, and rejected candidates. Run once via
 * `npx tsx prisma/seed-pass19-buenaventura-deep.ts`.
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
      kind: 'ALBERGUE' as const,
      name: 'Manglaria (Manglaria Pacífico) - Albergue Temporal y Centro de Acopio',
      address: 'Carrera 56b #5-92, Buenaventura, Valle del Cauca',
      phone: '313 448 0019 (Nequi/contacto)',
      needsText: 'Alimentos no perecederos, agua potable, productos de higiene, cobijas, colchonetas, o aporte económico vía Nequi. Capacidad estimada ~15 personas.',
      sourceUrl: 'https://www.instagram.com/p/Db4mysTN6p0/',
      sourceOrg: 'Manglaria Pacífico',
      submitterNote:
        'Primer albergue confirmado para Buenaventura tras varias pasadas de investigación - un vacío real que se mantuvo abierto hasta ahora. Dirección física dentro de la propia Buenaventura (no un punto de acopio en Cali/Bogotá), con comentarios orgánicos de la comunidad. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Fundación Salvando Huellitas Buenaventura',
      address: 'No publicada (ubicación del refugio mantenida privada por seguridad de los animales)',
      phone: null,
      needsText:
        'Refugio existente con más de 200 animales rescatados; el terremoto y las lluvias posteriores dañaron techos, pisos y mallas de los encierros, causando fugas y pérdidas. Necesita materiales/mano de obra para reparación de techo y piso, refuerzo de jaulas/gatera, y medicamentos.',
      sourceUrl: 'https://vaki.co/vaki/ay-danos-a-reparar-el-hogar-de-m-s-de-200-animalitos-afectados-por-el-temblor-en-Buenaventura',
      sourceOrg: 'Salvando Huellitas Buenaventura (fundadora: Laura Giraldo)',
      submitterNote:
        'Cierra por completo el vacío de VET para Buenaventura, con el nivel de corroboración más fuerte de toda esta pasada: encontrado independientemente en las 4 plataformas (X, Instagram, Facebook, TikTok). Campaña Vaki verificada (269 donantes, ~$6,300 recaudados), corroborada por un post de Facebook no relacionado (Natasha Giraldo) y por un reportaje de Publimetro Colombia (TikTok, 20.6K likes). Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Veterinary Cat Medical Care - Jornada veterinaria en Buenaventura (22-25 agosto)',
      address: null,
      phone: null,
      needsText:
        'Organización veterinaria con base en Bogotá realizará una jornada de salud veterinaria en Buenaventura del 22 al 25 de agosto para gatos y perros afectados por el sismo. Solicita medicamentos no vencidos (Meloxicam, Carprofeno, Cefalexina, Metronidazol, Enrofloxacina, Baxidin, desparasitantes, Omeprazol, Ondansetrón, Dipirona, Tramadol), gasas/algodón/jeringas/agujas, y donaciones económicas.',
      sourceUrl: 'https://x.com/ARMYBogotaCol/status/2087917087477936307',
      sourceOrg: 'Veterinary Cat Medical Care',
      submitterNote: 'Lista de insumos veterinarios específica y plausible, fechas concretas. El sitio exacto en Buenaventura no estaba confirmado al momento de esta pasada. Confianza media.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Colegio Médico Colombiano - Brigada de Salud (Talento Humano en Salud) a Buenaventura y Quibdó',
      address: 'Punto de coordinación: Carrera 96G #16H-20, Fontibón, Bogotá (la brigada viaja a Buenaventura y Quibdó)',
      phone: '316 753 2912',
      needsText: 'Profesionales de salud voluntarios e insumos médico-quirúrgicos para una brigada que se despliega a Buenaventura y Quibdó.',
      sourceUrl: 'https://www.instagram.com/p/Db_A2h6Fu6W/',
      sourceOrg: 'Colegio Médico Colombiano + Propacífico',
      submitterNote: 'Publicado por dos cuentas identificables reales, nombra a un médico específico (Dr. José Ignacio Madero) y a un socio institucional (Propacífico). Confianza alta.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Secretaría de Salud Distrital de Buenaventura - activación de respuesta',
      address: 'Buenaventura, Valle del Cauca (oficinas de la secretaría distrital)',
      phone: null,
      needsText: 'La autoridad de salud distrital activó formalmente acciones de respuesta al terremoto; vocero oficial confirmó las medidas en curso mediante declaración en video.',
      sourceUrl: 'https://www.facebook.com/reel/885484367654225',
      sourceOrg: 'Secretaría de Salud Distrital de Buenaventura',
      submitterNote: 'Página oficial de gobierno verificada, declaración en cámara de un funcionario uniformado filmado en Buenaventura, 3 días después del sismo. Confianza alta.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Refuerzo médico nacional a Buenaventura - hospital de campaña + misión HUV + puente aéreo Satena',
      address: 'Red hospitalaria de Buenaventura (sitio exacto del hospital de campaña no especificado)',
      phone: null,
      needsText:
        'La red hospitalaria de Buenaventura quedó desbordada tras el sismo; el gobierno nacional anunció el despliegue de un hospital de campaña con camas de expansión y unidades de estabilización. El Hospital Universitario del Valle (Cali) envió una misión médica de refuerzo. Un vuelo de Satena aterrizó con 3 toneladas de ayuda humanitaria y 15 profesionales de salud - evidencia directa del puente aéreo usado porque la única vía terrestre está bloqueada.',
      sourceUrl: 'https://www.facebook.com/AgoracolombiaDigital/posts/pfbid0bzBLMuESA4hUkN9qZgP3ZtoBY796HFWvSSbuoUWgDzafoECxcvp7LbkzLVEd3n2fl',
      sourceOrg: 'Ministerio del Interior + Hospital Universitario del Valle + Satena',
      submitterNote:
        'Tres hechos corroborados independientemente que juntos describen la misma ola de refuerzo médico: Ágora Digital (hospital de campaña, citando al Ministro del Interior), Caracol Radio (misión del HUV), y Noticias Caracol (vuelo de Satena) - los tres reportados el mismo período. Es una respuesta móvil/temporal, no una dirección fija a la que la gente pueda acudir. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Earthquake Relief for Buenaventura, Colombia" (Catalina García Cure)',
      address: null,
      phone: null,
      needsText:
        'Alimentos, agua, refugio, higiene e insumos médicos comprados y entregados en terreno por socios locales. Nombra a Patrulla Aérea Civil Colombiana (ONG real de pilotos voluntarios) como el socio que transporta la ayuda por aire mientras la vía a Cali sigue bloqueada por derrumbes.',
      sourceUrl: 'https://www.gofundme.com/f/earthquake-relief-for-buenaventura-colombia-mprzj',
      sourceOrg: null,
      submitterNote:
        'La campaña de mayor tracción y mejor documentada de esta pasada: $8,432 recaudados de meta $15,000, 53 donaciones. Organizadora de la diáspora (Fort Lauderdale, FL), nombra un socio real y verificable, y divulga proactivamente el mecanismo de pago transfronterizo (fondos vía la cuenta de EE.UU. del esposo, ya que GoFundMe no paga directamente a Colombia). Encontrada independientemente en 3 de 5 agentes. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Ayuda humanitaria en Buenaventura - apoya a los líderes, lideresas y sus familias (Erika Parrado)',
      address: null,
      phone: null,
      needsText: 'Apoyo humanitario para líderes y lideresas comunitarias de Buenaventura y sus familias afectadas por el terremoto.',
      sourceUrl: 'https://vaki.co/vaki/ayuda-humanitaria-en-buenaventura-apoya-a-los-l-deres-lideresas-y-sus-familias-afectados-por-el-terremoto',
      sourceOrg: null,
      submitterNote:
        'Organizadora verificada en Vaki, encontrada independientemente por 4 de 5 agentes (X, Instagram, Facebook, crowdfunding). La de mayor tracción entre las campañas Vaki: 165 donantes, ~$8,299 recaudados, donaciones llegando dentro de la hora de cada revisión. Ángulo específico y no cubierto antes (líderes sociales). Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: "Yo Tengo Fe por el Pacífico" (Fundación Yo Tengo Fe)',
      address: null,
      phone: null,
      needsText: 'Ayuda humanitaria general para familias de Buenaventura y Chocó que perdieron su hogar y pertenencias en el terremoto.',
      sourceUrl: 'https://vaki.co/vaki/yo-tengo-fe-por-el-pacifico',
      sourceOrg: 'Fundación Yo Tengo Fe',
      submitterNote:
        'Organizadora institucional nombrada (no un individuo), verificada en Vaki, encontrada independientemente por 4 de 5 agentes. 67 donantes, ~$2,800 recaudados. Confianza alta - aunque cubre Buenaventura y Chocó juntos, no exclusivamente Buenaventura.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: "Apoya a las víctimas del terremoto en Buenaventura" (Fundación Vanguardia Pacífica)',
      address: null,
      phone: null,
      needsText: 'Apoyo monetario general para víctimas del terremoto en Buenaventura.',
      sourceUrl: 'https://vaki.co/vaki/terremoto-buenaventura',
      sourceOrg: 'Fundación Vanguardia Pacífica',
      submitterNote: 'Organización nombrada, verificada en Vaki, encontrada por 3 de 5 agentes. Escala más modesta: $644 recaudados, 15 donantes. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Support Families in Buenaventura After the Quake" (Angela Viveros / Angela Tyson)',
      address: null,
      phone: null,
      needsText: 'Alimentos de emergencia/agua, vivienda temporal, ropa, necesidades médicas y ayuda por pérdida de hogar para familias de Buenaventura.',
      sourceUrl: 'https://www.gofundme.com/f/support-families-in-buenaventura-after-the-quake',
      sourceOrg: null,
      submitterNote:
        'Organizadora de la diáspora nacida en Buenaventura, ahora en Milton, WI. Narrativa transparente en primera persona. Confianza media - tracción modesta ($390 de meta $3,000, 5 donantes) y los socios en terreno no están nombrados específicamente.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Support Buenaventura Families After Earthquake" (Josymar De Leon)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua, reparaciones de vivienda y artículos esenciales para familias de Buenaventura afectadas.',
      sourceUrl: 'https://www.gofundme.com/f/support-buenaventura-families-after-earthquake',
      sourceOrg: null,
      submitterNote:
        'Página real con donantes genuinos (9 donaciones, $485 de meta $4,500), pero texto genérico sin conexión personal declarada con Buenaventura ni socio local nombrado. Confianza baja - incluir con cautela.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: '"Un Solo Corazón" (Tigresas Moviéndose con Corazón) - canal internacional de transferencia bancaria',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias internacionales para Buenaventura vía transferencia bancaria: Banco de Bogotá, SWIFT BBOGCOBB, ABA 021000089.',
      sourceUrl: 'https://www.instagram.com/p/Db8QhI-FVDw/',
      sourceOrg: 'Tigresas Moviéndose con Corazón',
      submitterNote:
        'Cuenta de Instagram verificada con buen alcance, canal de transferencia internacional completo y específico para donantes en el extranjero - responde directamente al ángulo de diáspora. Confianza baja porque la organización detrás ("Tigresas Moviéndose con Corazón") no se pudo verificar como una entidad de ayuda establecida/auditada - verificar antes de promover.',
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
      platform: 'X' as const,
      permalink: 'https://x.com/ARMYBogotaCol/status/2087917087477936307',
      authorHandle: '@ARMYBogotaCol',
      category: 'AID_POINT' as const,
      placeName: 'Buenaventura',
      note: 'Anuncio de la jornada veterinaria gratuita del 22-25 de agosto para mascotas afectadas por el sismo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/LuisFerMejia/status/2087936770423836991',
      authorHandle: '@LuisFerMejia',
      category: 'AID_POINT' as const,
      placeName: 'Bogotá (puntos de acopio hacia Buenaventura)',
      note: 'Tres negocios bogotanos (Matchachá, Amaría, Transportes el Palmar) recolectando donaciones y coordinando entrega a Buenaventura con la Cruz Roja.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6FhQlFLqQ/',
      authorHandle: 'resistencia_antirracista',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Isla Cascajal, Rockefeller, Cajambre, Yurumanguí, Bajo Calima',
      note: 'Reporte de situación: calamidad pública declarada, vías y aeropuerto bloqueados, 10 muertos, cientos de heridos/desaparecidos, ~400 familias desplazadas, Clínica Santa Sofía atendiendo en carpas de campaña.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6mQB5CWy4/',
      authorHandle: 'experimentalfontibon',
      category: 'AID_POINT' as const,
      placeName: 'Bogotá (Fontibón) hacia Quibdó y Buenaventura',
      note: 'Recolección de insumos con dos puntos físicos en Bogotá, logística coordinada con el Ejército Nacional y la Fuerza Aérea Colombiana hacia Buenaventura y Quibdó.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/885484367654225',
      authorHandle: 'Secretaría de Salud Distrital de Buenaventura',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Declaración oficial en video confirmando la activación de acciones de respuesta al terremoto en el sector salud.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/AgoracolombiaDigital/posts/pfbid0bzBLMuESA4hUkN9qZgP3ZtoBY796HFWvSSbuoUWgDzafoECxcvp7LbkzLVEd3n2fl',
      authorHandle: 'Ágora Digital',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'La red hospitalaria de Buenaventura colapsó tras el sismo; el gobierno nacional anuncia un hospital de campaña.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/2160551194489865',
      authorHandle: 'Natasha Giraldo',
      category: 'AID_POINT' as const,
      placeName: 'Buenaventura',
      note: 'Llamado de ayuda para animales, nombrando a Fundación Salvando Huellitas de Buenaventura como refugio de 200+ animales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/SeInformaColombia/posts/pfbid0ANNhsNRXrGqk3G5VDJ52EKKK4MwXaSrXgR9VZZJxNAoCFkwjGgQcHfUPfopVUFk8l',
      authorHandle: 'Se informa Colombia',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura',
      note: 'Búsqueda de Steven Ballesteros, visto por última vez la noche del 12 de agosto camino a un velorio; no ha regresado a casa.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid08zKkGpCjMT3FAFtVePcPEr1M7ZikNzBkEFJr2GhdozqQRtQaJkj4e3KMycrvHziQl&id=100064501497016',
      authorHandle: 'Alcaldía Local Isla del Cascajal',
      category: 'OFFICIAL' as const,
      placeName: 'Isla Cascajal, Buenaventura',
      note: 'Reunión de coordinación entre la Alcaldía Distrital, la Alcaldía Local de Isla Cascajal, Juntas de Acción Comunal y la Gobernación del Valle para priorizar necesidades en esta comuna.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/danielasorany.tapasco/posts/pfbid0X2dRSH1qkyLWDNoQQ1bo6Kjq3PUPL8uYiE6FM4HrNoXVLFx6AJ37VgrN8HUQZLpml',
      authorHandle: 'Daniela Sorany Tapasco',
      category: 'NEED' as const,
      placeName: 'Villa del Carmen, Comuna 12, Buenaventura',
      note: 'Denuncia que Villa del Carmen (Comuna 12) no está recibiendo atención mediática ni ayuda pese a los daños del sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/soydebuenaventura/posts/pfbid0bEvzmeMgXKbNEgctx9u5JsLYwwNjTJdXrmFkrUfTr6wpo8jBvZDNjBtuhSfjUi3Ql',
      authorHandle: 'Soy de Buenaventura',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali (punto de acopio) hacia Buenaventura',
      note: 'Evidencia de que parte de la infraestructura de recolección para Buenaventura está instalada del lado de Cali por el cierre vial.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@publimetrocolombia/video/7673162146057866517',
      authorHandle: '@publimetrocolombia',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Salvando Huellitas Buenaventura',
      note: 'Reportaje sobre los daños de la fundación y su llamado urgente a la solidaridad.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caracolradio/video/7673660671602609428',
      authorHandle: '@caracolradio',
      category: 'AID_POINT' as const,
      placeName: 'Hospital Universitario del Valle',
      note: 'Cobertura de la misión médica enviada desde Cali a Buenaventura para reforzar la respuesta en salud.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673658609040903445',
      authorHandle: '@noticiascaracol',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura (vuelo Satena)',
      note: 'Un vuelo de Satena aterrizó con 3 toneladas de ayuda humanitaria y 15 profesionales de salud para Buenaventura.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@france24_es/photo/7673330958396902678',
      authorHandle: '@france24_es',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Al menos 10 muertos, ~170 heridos, 3 desaparecidos según conteo oficial parcial; 3 derrumbes cerraron la única vía de acceso.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caipa1216/video/7673664062453992725',
      authorHandle: '𝓚 (@caipa1216)',
      category: 'NEED' as const,
      placeName: 'Barrio El Jardín, Buenaventura',
      note: 'Familia con pérdida total de vivienda que no ha recibido ningún tipo de ayuda.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@kienyke/video/7672789373552921874',
      authorHandle: 'kienyke (creadora @Giselle Angulo)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura',
      note: '"No se olviden de Buenaventura, por favor" - llamado a visibilizar la situación del Distrito.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@carolinarojas2089/photo/7673328945495919893',
      authorHandle: 'Carolina Rojas Valdés',
      category: 'NEED' as const,
      placeName: 'Buenaventura (veredas rurales)',
      note: 'Profesional de logística organizando ayuda para veredas rurales de difícil acceso donde la ayuda no está llegando.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@vb.mar8/video/7673058261783940370',
      authorHandle: 'VB Mar',
      category: 'NEED' as const,
      placeName: 'Vía Cali-Buenaventura',
      note: 'Llamado directo por maquinaria y personal para despejar completamente la única vía Cali-Buenaventura.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@manejando.la.tran98/video/7672992809401601301',
      authorHandle: 'Canelosito badguay de la calle',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio 12 de Abril, Buenaventura',
      note: 'Video de una casa de 4 pisos a punto de colapsar en el barrio 12 de Abril.',
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
