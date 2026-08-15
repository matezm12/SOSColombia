/**
 * Pass 46 (2026-08-15) — second city in the fourth research round, Cali.
 * Three prior rounds (passes 15, 24, 33) already covered this city
 * exhaustively, so this pass hunted for fresh 24-48h posts, status
 * updates, new scams, reconstruction-phase news, missing-persons
 * resolutions, and new crowdfunding campaigns. Several candidates that
 * looked new at first turned out to be duplicates of already-seeded
 * campaigns (Familia Saavedra's GoFundMe from pass 15, Casa Mangle's Vaki
 * from pass 24, the Ciudadela Petronio Álvarez acopio hub known since
 * pass 33 under its new "Casa Grande de la Solidaridad" rebrand) — those
 * are documented as status updates in the wiki, not re-seeded here.
 * Death/missing/injured toll figures (104/115/~1,400) are unchanged from
 * pass 33a's own TollRecord rows, so no new toll rows were added.
 * See wiki/17-allied-resources-and-community.md "Pass 46" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass46-cali-round4.ts`.
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
      kind: 'ACOPIO' as const,
      name: 'Antigua Fábrica de Licores del Valle — Centro de Acopio (Gobernación del Valle)',
      address: 'Antigua Fábrica de Licores, Valle del Cauca',
      phone: null,
      needsText: 'Sigue recibiendo activamente donaciones para familias afectadas en municipios de todo el Valle del Cauca, confirmado por la Gobernación (@GobValle) al 14 de agosto.',
      sourceUrl: 'https://x.com/WrestlingColSoc/status/2088298426496602419',
      sourceOrg: 'Gobernación del Valle del Cauca',
      submitterNote: 'POSIBLE DUPLICADO A VERIFICAR: el nombre "Antigua Fábrica de Licores del Valle" es muy similar al "Centro de acopio La Licorera" ya sembrado en la pasada 6 para Buenaventura, también citado como fuente de la Gobernación del Valle. Podrían ser el mismo sitio físico (la fábrica de licores histórica del departamento) usado como centro logístico para todo el Valle, incluyendo envíos a Buenaventura, o dos puntos distintos. Se deja señalado explícitamente para que quien modere lo revise antes de aprobar, en vez de asumir silenciosamente que son diferentes.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Instituto para Niños Ciegos y Sordos del Valle del Cauca (Vaki)',
      address: 'Barrio San Fernando, Cali (Clínica Visual y Auditiva / Centro de Rehabilitación y Educación)',
      phone: null,
      needsText: 'Reparación del edificio: colapso del techo del segundo piso, daño severo en muros del cuarto nivel, falla estructural en mampostería antigua. Pérdidas estimadas en ~COP 30.000 millones. Los fondos permitirán reabrir la Clínica Visual y Auditiva y el Centro de Rehabilitación y Educación (CRE), que atiende a ~150 niños con discapacidad visual/auditiva al año.',
      sourceUrl: 'https://vaki.co/vaki/todos-por-el-instituto-ciegos-y-sordos',
      sourceOrg: 'Instituto para Niños Ciegos y Sordos del Valle del Cauca',
      submitterNote: 'Institución real de más de 80 años, organizador con insignia verificada de Vaki (Marco Osorio). Dos funcionarias/os fallecidos nombrados específicamente (Ana Lucelly Adarbe, secretaria de la Dirección Médica; Jaime Bonilla, programador de cirugía — ambos murieron al colapsar un muro mientras salían) y 7 más heridos; más de 30 niños estaban en terapia en el sitio cuando ocurrió el sismo. Corroborado de forma independiente en Instagram (@marco_moa) y por la propia página de Facebook del Centro de Rehabilitación y Educación (CRE) del instituto. Cifras vistas variaron entre revisiones del mismo día (de cero aportes a $5,609 de 14 donantes) — movimiento rápido y real, no una contradicción. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Casa Sorora — reparación de techo',
      address: 'Cali (dirección exacta no publicada)',
      phone: 'Nequi/Llave 317 716 9087 (a nombre de Melany Rodríguez)',
      needsText: 'Fondos para reparar el techo dañado por el sismo, para que este espacio comunitario de mujeres pueda reabrir.',
      sourceUrl: 'https://www.instagram.com/p/DcCMGySvwQE/',
      sourceOrg: 'Casa Sorora',
      submitterNote: 'Casa Sorora es un espacio comunitario/de coworking de mujeres ya establecido en Cali (varios miembros de la comunidad con años de trayectoria comentando, incluida solidaridad desde un espacio afín "Casa Oasis Cali"). Publicación de la fundadora (@casa.sorora), 1.8K me gusta, 144 comentarios. Mismo patrón que la ya sembrada Casa Mangle (pasada 24), aunque los fondos se canalizan por una cuenta Nequi personal en vez de una página institucional. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Acopio Barrio Santa Teresita (Edificio Guadalajara)',
      address: 'Calle 13 Oeste #1-45, Edificio Guadalajara, Barrio Santa Teresita, Cali',
      phone: null,
      needsText: 'Agua, comida no perecedera, leche en polvo, colchonetas, carpas, productos de higiene, medicinas, pañales y ropa. Ventana de recolección: viernes 14 y sábado 15 de agosto hasta las 10pm; un camión sale el domingo 16 en la mañana hacia El Pajar, Bolívar, La María y El Palmar (corregimientos de la zona epicentro en Chocó).',
      sourceUrl: 'https://www.instagram.com/p/DcCfxsIxl8L/',
      sourceOrg: null,
      submitterNote: 'Dirección exacta dada por la organizadora (@manuelaparragalvez), 548 me gusta, buen nivel de interacción. NOTA DE VIGENCIA: la ventana de recolección indicada en el post ya cerró (14-15 de agosto) al momento de escribir esto — quien modere debe verificar si el punto sigue activo antes de aprobarlo, ya que podría tratarse de una campaña puntual ya finalizada en vez de un punto permanente.',
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
      permalink: 'https://x.com/lavozdepueblo1/status/2088056109726568920',
      authorHandle: '@lavozdepueblo1',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'NUEVA ALERTA DE ESTAFA específica de Cali: la Secretaría de Gestión del Riesgo advierte que personas se hacen pasar por censistas y visitan casa por casa a familias afectadas para obtener información privada bajo la excusa de una encuesta oficial.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/lafm/status/2088658736793419989',
      authorHandle: '@lafm',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Torres del Limonar, Cali',
      note: 'RESOLUCIÓN trágica del caso de las trillizas Saavedra: Ana María Saavedra confirmada como única sobreviviente; su hermana Isabella fue hallada sin vida el 13 de agosto, confirmando la muerte de 4 miembros de la familia (dos trillizas y ambos padres) en el colapso del Edificio María Alvira/Torres del Limonar. Corrobora y actualiza directamente la campaña GoFundMe "Ana nos necesita" ya sembrada en la pasada 15 (ahora en $123,176 de $150,000, 2,683 donantes, creciendo activamente — no se resiembra como punto nuevo).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MeridianoR_CO/status/2088616814255206840',
      authorHandle: '@MeridianoR_CO',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'FASE DE RECONSTRUCCIÓN: el alcalde de Cali, Alejandro Éder, presentó al presidente una propuesta de aproximadamente $10 billones COP para atender la emergencia y reconstruir la ciudad, con cerca de $4 billones destinados a vivienda.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/EnterateCali/status/2088308635713569056',
      authorHandle: '@EnterateCali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'FASE DE RECONSTRUCCIÓN: el Gobierno nacional anunció un plan de vivienda en tres etapas para familias afectadas, presentado por el Ministro de Vivienda Jaime Andrés Beltrán: atención inmediata, reconstrucción y recuperación urbana.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/lavozdelpuebloelconeo/posts/pfbid0ayCseTg8qagzMo12jsX1gZ2UuH5sDsbEqbuHgQVq9p8VjQzuHxdWKn2mDMvfkRwyl',
      authorHandle: 'La Voz Del Pueblo El Coneo',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'FASE DE RECONSTRUCCIÓN: la Alcaldía de Cali pidió autorización al Gobierno nacional para usar $350.000 millones COP de recursos de estampillas hacia la respuesta y reconstrucción tras el sismo — mecanismo de financiación concreto, distinto del ya conocido pedido de condonación de deuda de EMCALI.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1655640062197772',
      authorHandle: 'Alejandro Éder (alcalde de Cali)',
      category: 'OFFICIAL' as const,
      placeName: 'Ciudadela Petronio Álvarez, Cali',
      note: 'ACTUALIZACIÓN DE ESTADO (no es un punto nuevo): el complejo Ciudadela Petronio Álvarez, ya conocido como centro de acopio desde la pasada 33, fue rebautizado formalmente por la Alcaldía como "Casa Grande de la Solidaridad", ahora el epicentro oficial de donaciones para el suroccidente colombiano. Confirmado activo al 15 de agosto durante una visita presidencial; el alcalde declaró que la reconstrucción tomará al menos dos años.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCfxsIxl8L/',
      authorHandle: 'manuelaparragalvez',
      category: 'AID_POINT' as const,
      placeName: 'Edificio Guadalajara, Barrio Santa Teresita, Cali',
      note: 'Publicación fuente del punto de acopio sembrado arriba — dirección exacta, lista de insumos y logística de camión hacia corregimientos de la zona epicentro en Chocó (El Pajar, Bolívar, La María, El Palmar).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@andressandoval21/video/7674161262518930709',
      authorHandle: '@andressandoval21',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hospital Universitario del Valle, Cali',
      note: 'Familias de víctimas del terremoto protestan en el HUV porque no reciben información sobre sus seres queridos desaparecidos y no hay labores de búsqueda activas en el hospital; señalan que el alcalde Éder, la gobernadora Dilian y el presidente visitaron el sitio pero no hablaron con las familias. Confianza media — coincide con una ola más amplia de cobertura crítica sobre el colapso del HUV.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ashly.handal.5/posts/pfbid0oVTDJCfQVnAD3vgyEBDkDiUMw4iZBm5yuZXRJi6TnCzASYbstiwAUExurkKA5pNnl',
      authorHandle: 'Astrid Medina Rincón (compartiendo contenido crítico de Homecenter)',
      category: 'NEED' as const,
      placeName: 'Cali (alegación sin ubicación de tienda específica)',
      note: 'DENUNCIA VIRAL, luego matizada: se acusó a Homecenter de revender colchones donados para el terremoto, etiquetando al presidente. Homecenter respondió públicamente (video de un empleado en tienda, reportado por Noticias Manizales) aclarando que el video viral fue un malentendido — los productos mostrados sí llevaban un sello de donación pero no eran en realidad productos donados siendo revendidos. Tratar como denuncia disputada/matizada, no como fraude confirmado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/noticiasjudicialesdecolombia/posts/pfbid02DGLeb5wr6A465UxJESCZ8Z1gA9RFHzZncbnr7EFgPAvmctjeW7Vd6HLaw8BLQHuil',
      authorHandle: 'Jose Velasquez Impacto',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'RESOLUCIÓN de personas desaparecidas: los hermanos Valentina Vanegas y Juan Esteban Vanegas, reportados desaparecidos tras el sismo, fueron encontrados con vida entre los escombros. Corroborado de forma independiente por otro medio (reposteo con marca Milenio) en los mismos resultados de búsqueda.',
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
