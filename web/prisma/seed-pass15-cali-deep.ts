/**
 * Pass 15 (2026-08-14) — deep multi-agent research pass on Cali (X + Instagram
 * + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven). Second
 * city in the per-city deep-pass rotation after Pereira (passes 13-14). See
 * wiki/17-allied-resources-and-community.md "Pass 15" for full agent notes,
 * dedup reasoning, and rejected candidates. Run once via
 * `npx tsx prisma/seed-pass15-cali-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const aidPoints = [
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Hospital Universitario del Valle (HUV) - Banco de Sangre',
      address: "Calle 5 #36-08, Cali, Valle del Cauca (Hospital Universitario del Valle 'Evaristo García')",
      phone: null,
      needsText: 'Donantes de sangre urgentemente para atender a las víctimas del terremoto; el hospital habilitó explícitamente la entrada de su banco de sangre para recibir donantes.',
      sourceUrl: 'https://www.instagram.com/p/Db6Lxx0PX2B/',
      sourceOrg: 'Secretaría de Salud de Cali / Alcaldía de Santiago de Cali',
      submitterNote:
        'Corroborado independientemente en 4 plataformas: flyer oficial de la Alcaldía/Secretaría de Salud (Instagram), un post viral en X (505 reposts) etiquetando a Caracol Radio, un reporte de soldados de la Tercera Brigada del Ejército donando sangre ahí (Facebook/TikTok), y video del propio letrero del banco de sangre (TikTok). Confianza alta.',
    },
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Clínica Imbanaco - Banco de Sangre',
      address: 'Carrera 38 Bis #5B2-04, Santa Isabel, Cali (sede principal)',
      phone: null,
      needsText: 'Punto de donación de sangre en la sede principal de Clínica Imbanaco, horario 8:00 a.m.–6:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db6Lxx0PX2B/',
      sourceOrg: 'Secretaría de Salud de Cali / Alcaldía de Santiago de Cali',
      submitterNote:
        'Mismo flyer oficial de la Alcaldía (Instagram) que nombra a Imbanaco junto a HUV y Hemolife; corroborado también en X por dos posts independientes el mismo día. Confianza alta.',
    },
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Hemolife - Banco de Sangre (Cali)',
      address: 'Calle 38N #3N-61, Prados del Norte, Cali',
      phone: null,
      needsText: 'Punto fijo de donación de sangre, horario 8:00 a.m.–6:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db6Lxx0PX2B/',
      sourceOrg: 'Secretaría de Salud de Cali / Alcaldía de Santiago de Cali',
      submitterNote:
        'Mismo flyer oficial de la Alcaldía/Secretaría de Salud de Cali que nombra a Hemolife junto a HUV e Imbanaco, con dirección exacta. Una mención aislada en X sin dirección lo daba como confianza baja; el flyer oficial lo sube a confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Coliseo de Hockey Miguel Calero',
      address: 'Av. Joaquín Borrero Sinisterra #38-47 / Cra 9 con Cra 37A-39, Unidad Deportiva Jaime Aparicio, Cali',
      phone: '312 281 3934',
      needsText: 'Albergue habilitado tras el terremoto ofreciendo alimentación, servicio médico, atención psicológica y punto de acopio.',
      sourceUrl: 'https://www.instagram.com/p/Db_XqlFALVW/',
      sourceOrg: 'Alcaldía de Santiago de Cali',
      submitterNote:
        'Uno de solo dos albergues anunciados oficialmente por la Alcaldía de Cali (el otro es Diamante de Béisbol). Corroborado por un concejal (Henry Peláez Cifuentes), la propia Alcaldía, ICBF Colombia, y una brigada humanitaria de El Salvador documentada en el sitio. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Iglesia Avivamiento Cali',
      address: 'Calle 6 #24-75 / Av. Roosevelt 24-75, frente a la Biblioteca Departamental, Cali',
      phone: '310 548 7069',
      needsText: 'Iglesia funcionando como albergue con puertas abiertas para todos los mayores de 18 años; también acepta voluntarios.',
      sourceUrl: 'https://www.instagram.com/p/Db_XqlFALVW/',
      sourceOrg: 'Avivamiento (red de iglesias)',
      submitterNote:
        'Publicado directamente por Avivamiento, una megaiglesia establecida con sede en Cali (9.5K reacciones, 731 compartidos en su propio post de Facebook), y corroborado por un flyer independiente verificado por estudiantes/funcionarios de la Universidad del Valle. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue y Punto de Acopio - Diamante de Béisbol',
      address: 'Carrera 39 con Calle 9 / Autopista Sur, Cali (junto al Coliseo de Hockey Miguel Calero)',
      phone: '311 601 9511 (WhatsApp)',
      needsText: 'Funciona simultáneamente como albergue y centro de acopio; se solicitan insumos para los damnificados.',
      sourceUrl: 'https://www.tiktok.com/@velacabados/video/7673250476334435605',
      sourceOrg: 'Alcaldía de Santiago de Cali',
      submitterNote:
        'El segundo de los dos únicos albergues anunciados oficialmente por la Alcaldía de Cali junto al Coliseo Miguel Calero. Corroborado por declaraciones oficiales de la Alcaldía y un contacto de WhatsApp funcional visible en el video. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Agrocanes Clínica Veterinaria',
      address: 'Calle 180 #28-82, Cali (Santa Elena / norte de Cali)',
      phone: '318 574 3539 (WhatsApp)',
      needsText: 'Servicio gratuito de radiografía (RX) para mascotas afectadas/heridas por el terremoto.',
      sourceUrl: 'https://www.facebook.com/agrocanes1/posts/pfbid02rKhk8ZFBVUo8LdAoY5TMeEuLFZLbQ6ECqwYjNhMUnfS5UwcoiF3ewMfmLwvEQS8Fl',
      sourceOrg: 'Agrocanes Clínica Veterinaria',
      submitterNote:
        'Página oficial de una clínica veterinaria establecida (no anónima), con dirección, teléfono y botón de WhatsApp reales. Distinta del Centro de Bienestar Animal de Cali (brigada sin dirección fija) ya conocido. Confianza media-alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Centro de Bienestar Animal (CBA) de Cali - dirección confirmada',
      address: 'Carrera 56 #7 Oeste - 445, Cali',
      phone: null,
      needsText: 'Recibe donaciones 24/7 de alimento húmedo (Hill\'s Urgent Care A/D o equivalente Pro Plan C/N) para los caninos de rescate que trabajan en los puntos de emergencia.',
      sourceUrl: 'https://www.instagram.com/p/Db_PI2VNKF9/',
      sourceOrg: 'Protección Animal Cali / Alcaldía de Cali',
      submitterNote:
        'No es una organización nueva — es una actualización de dirección para el Centro de Bienestar Animal de Cali ya registrado (previamente sin dirección fija conocida). Publicado conjuntamente por las cuentas oficiales proteccionanimalcali y alcaldiadecali. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Terremoto en Cali destrozó nuestra familia. Ana nos necesita" (Familia Saavedra)',
      address: null,
      phone: null,
      needsText:
        'Cuidado médico, recuperación de cirugía y costos de vida para Ana María, única sobreviviente de una familia de trillizas (Isabella, Sofía, Ana María); padres y tío también fallecieron cuando su apartamento en Cali colapsó el 10 de agosto.',
      sourceUrl: 'https://www.gofundme.com/f/nuestra-familia-esta-bajo-los-escombros-ayuda',
      sourceOrg: null,
      submitterNote:
        'Organizadora en Doral, FL (diáspora Cali-Miami). $103,707 recaudados de meta $150,000, 2,274 donantes individuales - una escala muy difícil de fabricar. Historia coincide con la cobertura noticiosa independiente de Isabella Saavedra (ver embeds de comunidad). Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Terremoto Colombia" - Torres del Limonar (Constanza Galeano)',
      address: null,
      phone: null,
      needsText:
        'Apoyo para primos Valentina y Juan Esteban Vanegas, atrapados bajo escombros del edificio Torres del Limonar en Cali; el bebé recién nacido y el padre de la familia fueron rescatados con vida y están en UCI en la Fundación Valle del Lili.',
      sourceUrl: 'https://www.gofundme.com/f/terremoto-colombia-gvnf9',
      sourceOrg: null,
      submitterNote:
        'Organizadora en Orlando, FL. Nombra un edificio específico y verificable (Torres del Limonar) y un hospital ya confirmado independientemente en este proyecto (Fundación Valle del Lili). $5,293 recaudados de meta $5,500, 103 donantes. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help My Family in Cali Start Over After the Earthquake" (Angela Echeverry)',
      address: null,
      phone: null,
      needsText: 'Vivienda temporal, ropa/artículos esenciales de reemplazo, alimentos, agua, higiene y necesidades médicas para la familia de la organizadora en Cali, cuyo edificio fue declarado en condena estructural.',
      sourceUrl: 'https://www.gofundme.com/f/help-my-family-in-cali-start-over-after-the-earthquake',
      sourceOrg: null,
      submitterNote: 'Organizadora en Villa Rica, GA. $12,849 recaudados de meta $18,000, 110 donantes. Confianza media - sin nombre de edificio para verificación cruzada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Urgent Earthquake Relief for Cali, Colombia" (Brian Herrera)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua, suministros básicos y herramientas para remoción de escombros, distribuidos directamente por el padre del organizador, quien está en Cali.',
      sourceUrl: 'https://www.gofundme.com/f/urgent-earthquake-relief-for-cali-colombia',
      sourceOrg: null,
      submitterNote: 'Organizador en Nashville, TN. 93% financiado ($1,860/$2,000), 40 donantes. Texto genérico ("primeras 48 horas") sin detalles locales nombrados. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Terremoto Colombia" - Cali/Norte del Valle/Chocó (Emily Cevallos)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua, artículos de higiene, comida para mascotas y materiales de reconstrucción para familias alrededor de Cali/Norte del Valle (y Chocó), distribuidos por contactos nombrados en terreno.',
      sourceUrl: 'https://www.gofundme.com/f/terremoto-colombia-v32j8',
      sourceOrg: null,
      submitterNote:
        'Organizadora en Palm Beach Gardens, FL. Nombra colaboradores específicos en terreno (mecanismo de rendición de cuentas), pero tracción baja: solo $665 recaudados de meta $50,000, 13 donantes. Confianza media con reserva por baja tracción - vigilar.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "TERREMOTO CALI COLOMBIA" (Camila Ramirez, diáspora Cali-Turín)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua y suministros de ayuda para Cali, distribuidos vía familia/amigos de la organizadora en terreno.',
      sourceUrl: 'https://www.gofundme.com/f/terremoto-cali-colombia-m5mhq',
      sourceOrg: null,
      submitterNote:
        'Organizadora nacida en Cali, ahora en Turín, Italia - un corredor de diáspora no documentado antes en este proyecto (Cali-Italia). Solo €620 recaudados de meta €1,800, 29 donantes, plan de distribución vago (sin nombres). Confianza baja - incluir con cautela.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Fondo para voluntariado en Cali, Pereira y Quibdó (diáspora colombiana en Suecia)',
      address: null,
      phone: null,
      needsText: 'Recaudación para apoyar a voluntarios haciendo trabajo de ayuda en terreno tras el terremoto en Cali (y Pereira, Quibdó).',
      sourceUrl: 'https://vaki.co',
      sourceOrg: null,
      submitterNote:
        'Organizado en Vaki.co (plataforma establecida, no un esquema anónimo de QR/billetera) por un usuario identificable de X organizando colombianos en Suecia. Sin reportes de fraude o enlace roto en respuestas. Confianza media - campaña de base, no institucional.',
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
      permalink: 'https://x.com/stevenarce/status/2086849999942328339',
      authorHandle: '@stevenarce',
      category: 'AID_POINT' as const,
      placeName: 'Hospital Universitario del Valle',
      note: 'Llamado viral (505 reposts) a donar sangre en HUV y ayudar a trasladar pacientes de edificios afectados.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MonicaSaadeX/status/2086936780062724096',
      authorHandle: '@MonicaSaadeX',
      category: 'AID_POINT' as const,
      placeName: 'Clínica Imbanaco',
      note: 'Llamado a donar sangre en Clínica Imbanaco tras el terremoto.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/SecPrensaSV/status/2087721905453179039',
      authorHandle: '@SecPrensaSV (Gobierno de El Salvador)',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo del Pueblo, Siloé (Comuna 20)',
      note:
        'Cuenta oficial de prensa del gobierno de El Salvador describiendo una caravana de ayuda humanitaria entregada en un centro de acopio en Siloé, Comuna 20. No se pudo confirmar si es un lugar distinto de la Unidad Deportiva Panamericana ya conocida - no sembrado como punto de ayuda separado por esta ambigüedad, pero se conserva como embed informativo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/LaCapitalNews/status/2088107975462277549',
      authorHandle: '@LaCapitalNews',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo Miguel Calero',
      note: 'Brigada humanitaria salvadoreña realizando actividades para niños y familias en el albergue del Coliseo Miguel Calero.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Zyberia/status/2088178526780309911',
      authorHandle: '@Zyberia',
      category: 'AID_POINT' as const,
      placeName: 'Cali / Pereira / Quibdó (fondo diáspora, Suecia)',
      note: 'Recaudación Vaki organizada por colombianos en Suecia para financiar voluntarios de ayuda en terreno.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/EnterateCali/status/2088301355827925366',
      authorHandle: '@EnterateCali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali (toda la ciudad)',
      note: 'La UAEPA (Unidad Administrativa Especial de Protección Animal) reporta 298 animales desaparecidos desde el terremoto; medio local comienza a publicar contenido para reunir mascotas con sus dueños.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4dMQ2BoWt/',
      authorHandle: 'magazinpacifico',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Unidad Residencial Ariguaní, Cali',
      note:
        'Búsqueda de una familia específica (Kewin Andrés Cadavid, Yazmin Montoya, Damian Cadavid Montoya) no localizada desde el terremoto, con etiqueta a Cruz Roja Valle y dos teléfonos de contacto.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6QIkNo6_N/',
      authorHandle: 'diariooccidente',
      category: 'NEED' as const,
      placeName: 'Hospital San Juan de Dios y Clínica Farallones, Cali',
      note:
        'Lista circulante de pacientes no identificados/no acompañados admitidos en centros médicos de Cali tras el terremoto, pidiendo ayuda al público para identificarlos/reunirlos con familiares. Reposteado por al menos 4 cuentas independientes.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cwmasnoticias/posts/pfbid02Maij12yGrfYFEkNT7NctbyrpJiQqritTS6cDVpJXZGxbiBouZ5fbecNrjXrA5eRyl',
      authorHandle: 'CW+ Noticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'Rostros y nombres de personas aún reportadas como desaparecidas tras el terremoto en Cali; familiares piden ayuda para ubicarlas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1361671655577766',
      authorHandle: 'Nuestra Región',
      category: 'AID_POINT' as const,
      placeName: 'Hospital Universitario del Valle, Cali',
      note: 'Soldados de la Tercera Brigada del Ejército Nacional donando sangre en HUV para reabastecer el banco de sangre del hospital.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@paularestrepof/video/7672641449791606037',
      authorHandle: '@paularestrepof',
      category: 'AID_POINT' as const,
      placeName: 'Albergues Cali (listado)',
      note: 'Video listando los albergues disponibles en Cali para residentes afectados por el terremoto.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@velacabados/video/7673250476334435605',
      authorHandle: '@velacabados',
      category: 'AID_POINT' as const,
      placeName: 'Diamante de Béisbol - punto de acopio',
      note: 'Llamado a donaciones de insumos en el punto Diamante de Béisbol, con contacto de WhatsApp funcional.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search?q=desaparecidos%20Cali%20terremoto',
      authorHandle: 'Red+ Noticias / Blu Radio / CW+ Noticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note:
        'Dos historias corroboradas de la cobertura de #desaparecidos en Cali (no se pudo obtener un permalink individual por video, solo la página de resultados de búsqueda): (1) la búsqueda y hallazgo de Isabella Saavedra, una de un set de trillizas, desaparecida más de 82 horas bajo escombros; encontrada sin vida. Corresponde a la misma familia de la campaña GoFundMe "Ana nos necesita" ya sembrada arriba. (2) el perfil de Yensi Lorena Delgado Restrepo (23), quien murió en el barrio Bajo Jordán protegiendo a sus dos hijos de escombros durante el terremoto.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search?q=brigada%20veterinaria%20Cali%20terremoto%20mascotas',
      authorHandle: 'DarkFilesAnimation / Radio Fórmula',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'Lenny Fernández, abogada residente en Cali, murió protegiendo a su perro Salomón/Shalito durante el terremoto; el perro fue encontrado con vida bajo su cuerpo.',
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
