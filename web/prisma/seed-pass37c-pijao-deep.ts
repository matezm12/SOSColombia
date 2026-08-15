/**
 * Pass 37c (2026-08-15) — first deep multi-platform social research pass
 * on Pijao, Quindío, matching the methodology used for the other nine
 * tracked cities (X + Instagram + Facebook + TikTok + crowdfunding).
 * Pijao is fighting an out-of-control wildfire in its rural veredas that
 * broke out the day after the earthquake and, as of this pass, is still
 * not fully contained days later — on top of earthquake damage that
 * hasn't been separately broken out in national coverage (see
 * seed-pass37b for the newly-documented earthquake-specific figures).
 * See wiki/17-allied-resources-and-community.md "Pass 37" for full
 * sourcing and reasoning. Run once via
 * `npx tsx prisma/seed-pass37c-pijao-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Cuerpo de Bomberos Voluntarios de Pijao - llamado a voluntarios y equipos',
      address: 'Estación de Bomberos, Pijao, Quindío (punto de encuentro puntual: Galería municipal, 9:00 a.m.)',
      phone: '320 699 2815',
      needsText: 'Voluntarios y equipos apropiados para combatir el incendio forestal que sigue activo en las veredas rurales; el capitán Javier Ramírez Flores pidió específicamente ayuda para operativos diarios de control del fuego.',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Jp5CN8exfBYLYYNtKsRoaEJfthEeivEwLY276WKyAbJJoRtLUPjdr9z585sEGfPwl&id=61592658691922',
      sourceOrg: 'Cuerpo de Bomberos Voluntarios de Pijao',
      submitterNote:
        'Página oficial del cuerpo de bomberos voluntarios, corroborada independientemente por el propio capitán citado por nombre en Instagram (@estoesquindio) y por Canal Trece. El cuerpo de bomberos agradeció a 7 cuerpos de apoyo mutuo (Barcelona, La Tebaida, Armenia -voluntarios y oficiales-, Buenavista, Córdoba, y Caicedonia -Valle-) por ayudar a controlar 8 incendios forestales registrados el 11 de agosto. Nota: el propio comunicado de la Alcaldía del 11 de agosto habla de "tres incendios" (frentes activos) mientras Bomberos cuenta "ocho" (focos atendidos) el mismo día - discrepancia probablemente de metodología de conteo, documentada aquí sin resolver a un solo número.',
    },
    {
      kind: 'VET' as const,
      name: 'PYBA (Protección y Bienestar Animal) - Gobernación del Quindío, brigada veterinaria móvil',
      address: 'Vereda La Maicena, Pijao, Quindío (despliegue móvil, sin sede fija)',
      phone: null,
      needsText: 'Atención veterinaria de emergencia a mascotas y animales de finca afectados por el incendio: ~30-35 perros y gatos valorados, con medicamentos y alimento suministrados; 6 cachorros y 1 perra gestante trasladados a un hogar de paso. Desplegada junto con la Universidad Alexander von Humboldt y la Policía Nacional (carabineros).',
      sourceUrl: 'https://cronicadelquindio.com/quindio/atienden-a-30-animales-afectados-por-incendio-en-pijao/',
      sourceOrg: 'Gobernación del Quindío (PYBA) + Universidad Alexander von Humboldt + Policía Nacional',
      submitterNote: 'Programa institucional nombrado, con funcionaria citada (Michell Dahiana Marín Buitrago), corroborado independientemente por Quindío Noticias y por un post de la propia Universidad Alexander von Humboldt en X.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación Kenovy Colombia - colecta de agua para Pijao y Génova',
      address: 'Sede Fundación Kenovy, Armenia, Quindío (colecta destinada a Pijao y Génova, no un punto físico en Pijao)',
      phone: 'Nequi/Daviplata/Bre-B: 300 901 8232 / 310 283 8356',
      needsText: 'Agua embotellada para comunidades y animales afectados en Pijao y Génova. También reciben donación monetaria: Bancolombia Ahorros 912835785-72, Banco Caja Social 24129850032, Banco Popular Ahorros 500807801371, Llave Aval @BPJVG492, y Western Union para donaciones internacionales.',
      sourceUrl: 'https://www.instagram.com/p/DcBmQs_xxmE/',
      sourceOrg: 'Fundación Kenovy Colombia',
      submitterNote:
        'Fundación de rescate animal establecida (93.6K seguidores, refugio propio con 300+ animales, clínica veterinaria propia en Armenia) cuya propia infraestructura resultó dañada por el sismo; ahora recolecta específicamente para Pijao y Génova. Confianza media porque la fundación está en Armenia, no en Pijao mismo - es un canal de apoyo hacia Pijao, no un punto dentro del municipio.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'MMQ Media Maratón Quindío (Café Quindío) - campaña "Pijao Nos Necesita"',
      address: 'Puntos de acopio en Pijao y en Armenia (dirección exacta del punto en Pijao no publicada en el post, ni siquiera al ser preguntada en comentarios)',
      phone: '312 304 1997',
      needsText: 'Agua, alimentos no perecederos, productos de higiene, pañales, pañitos húmedos, y concentrado para perros y gatos; también donación económica.',
      sourceUrl: 'https://www.instagram.com/p/Db82d4JRvRa/',
      sourceOrg: 'Media Maratón Quindío (Café Quindío)',
      submitterNote:
        'Marca regional de eventos deportivos establecida (52.3K seguidores), coetiquetada por las cuentas oficiales de la Alcaldía de Pijao y la Gobernación del Quindío - respaldo institucional cruzado. PRECAUCIÓN: una llave Bre-B "@GLP760" circula en reposts de esta campaña atribuida a la Alcaldía, pero no se pudo verificar directamente en el canal oficial de la Alcaldía - dado que hay alertas nacionales activas sobre campañas de donación falsas tras el terremoto, no usar esa llave sin confirmación directa con la Alcaldía de Pijao o la organización.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'ICBF - entrega de Bienestarina y apoyo psicosocial, Vereda La Mariela',
      address: 'Vereda La Mariela, Pijao, Quindío',
      phone: null,
      needsText: 'Entrega gubernamental de Bienestarina (suplemento nutricional) y apoyo psicosocial a niñas, niños, adolescentes y familias de Pijao afectadas por el terremoto. El mismo equipo también atiende el albergue institucional en Quimbaya (municipio vecino).',
      sourceUrl: 'https://www.facebook.com/ICBFColombia/posts/pfbid023q63MWyC2e9kosyf4AKjbdZh5uVo8fP5qdapzWsR9djgatRPP6p3Eh9H4baP9PwLl',
      sourceOrg: 'Instituto Colombiano de Bienestar Familiar (ICBF)',
      submitterNote: 'Página oficial verificada de una agencia nacional de gobierno; primer punto rural específico de Pijao (Vereda La Mariela) documentado recibiendo ayuda gubernamental por el sismo.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Alcaldía de Pijao - directorio oficial de líneas de emergencia',
      address: 'Pijao, Quindío',
      phone: 'Policía 312 789 6517 · Bomberos 320 699 2815 · Hospital Santa Ana 323 899 3800 · Secretaría de Planeación 314 832 5755 · Comisaría de Familia 313 654 6902 · Nacional: Bomberos 119, Defensa Civil 144, Cruz Roja 132, Policía 123',
      needsText: 'Directorio oficial de líneas de emergencia publicado por la Alcaldía para reportar novedades tanto del sismo como del incendio forestal.',
      sourceUrl: 'https://www.instagram.com/p/Db_OvfLFskI/',
      sourceOrg: 'Alcaldía Municipal de Pijao (alcalde John Jairo Restrepo Gallego)',
      submitterNote: 'Publicado directamente por la cuenta oficial verificada del municipio, que enlaza al dominio oficial pijao-quindio.gov.co.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: Support Earthquake & Fire Relief in Quindío, Colombia',
      address: 'Organizadora en Atlanta, GA (diáspora); fondos dirigidos a Pijao, Circasia, Quimbaya y Montenegro',
      phone: null,
      needsText: 'Carpas/refugio temporal, materiales de techo, cobijas, alimentos e insumos esenciales para familias afectadas por el terremoto y, en el caso de Pijao, también por los incendios.',
      sourceUrl: 'https://www.gofundme.com/f/support-earthquake-fire-relief-in-quindio-colombia',
      sourceOrg: null,
      submitterNote:
        'Campaña real y activa (organizadora Kaory K. Laurent), 49% financiada (US$1,070 de meta US$2,200, 19 donantes). Es una campaña individual de la diáspora que cubre cuatro municipios, no exclusiva de Pijao - es la única opción de crowdfunding encontrada que nombra explícitamente a Pijao; no se encontró ninguna campaña de Vaki ni GoFundMe dedicada exclusivamente a Pijao.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pijao.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pijao.id,
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
      permalink: 'https://www.instagram.com/p/Db9w2hEsq8u/',
      authorHandle: 'alcaldiadepijaoq',
      category: 'OFFICIAL' as const,
      placeName: 'Veredas Sinabrio/La Maicena y El Jardín, Pijao',
      note: 'El alcalde John Jairo Restrepo reporta el incendio de Sinabrio/La Maicena "parcialmente controlado" gracias al trabajo conjunto de Bomberos Voluntarios de Pijao, La Tebaida, Buenavista, Córdoba, Génova y Armenia más el Ejército Nacional; un nuevo incendio activo en la vereda El Jardín (límite con Génova) está siendo atendido por bomberos de Génova.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://canaltrece.com.co/noticias/doble-emergencia-en-pijao-tras-los-danos-del-terremoto-incendio-forestal-fuera-de-control-amenaza-bosques-y-cultivos-en-quindio/',
      authorHandle: 'Canal Trece (Johanna Rubiano)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: '"Doble emergencia en Pijao": el incendio inició ~7pm del 11 de agosto en La Maicena y Cueva Loca; la capacidad local de respuesta está "desbordada" porque los mismos recursos atienden simultáneamente heridos y escombros del sismo. El alcalde solicitó formalmente apoyo aéreo (helicópteros con Bambi Bucket) a UNGRD/Fuerza Pública y camiones cisterna a Armenia/Calarcá.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cronicadelquindio/posts/pfbid02XHUp2cm2av4KgGRt17QXmUNL3NdX2TBhXtq5egBtXjKT7yEFZrbdXXbDs7ck1xiDl',
      authorHandle: 'La Crónica del Quindío',
      category: 'NEED' as const,
      placeName: 'Límite Génova-Pijao (Cueva Loca, La Topacia, La Maicena)',
      note: 'Reporte de terreno (14 de agosto): el fuego lleva 3+ días sin control; el terreno escarpado hace "casi imposible" que un carrotanque llegue, así que la comunidad improvisa con mangueras de jardín y tanques de agua transportados a mano. El alcalde de Génova estima (sin medición técnica aún) ~200 hectáreas afectadas en Pijao y ~30 en Génova; una vivienda deshabitada se perdió. Residentes nombradas (Melissa Mosquera, Sara Paz) describen temor por sus cultivos de plátano/café/aguacate/banano y sus gallinas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Ejercito_Div5/status/2087986798160916642',
      authorHandle: '@Ejercito_Div5',
      category: 'OFFICIAL' as const,
      placeName: 'Vereda La Maicena, Pijao',
      note: 'La Quinta División del Ejército Nacional reporta tropas del Batallón de Montaña apoyando a Bomberos, Defensa Civil y UNGRD en las labores de control del incendio en La Maicena.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Fedegan/status/2088047694581203304',
      authorHandle: '@Fedegan',
      category: 'NEED' as const,
      placeName: 'Pijao, Quindío (zona rural)',
      note: 'FEDEGÁN (federación nacional de ganaderos) reporta que Pijao enfrenta tanto daño por el sismo como incendios severos; su profesional regional Sebastián Puerta está en terreno evaluando el impacto en zonas rurales/ganaderas. Etiqueta #SOSGanadero. No se encontraron cifras específicas de pérdidas de ganado para Pijao.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cuerpodebomberos.voluntariogenova/posts/pfbid02oPmmvSWxniNSQvJQh8hZm3hUUxHBwuXC17Z19uz5JUrP8cLFXccYB3jJgB9Kup12l',
      authorHandle: 'Cuerpo De Bomberos Voluntarios Génova Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Límite Génova/Pijao',
      note: 'Reporte con fotos georreferenciadas: un incendio forestal de gran magnitud entre las veredas La Maizena Alta y La Topacia, iniciado en el límite Pijao/Génova, arde desde las 10pm del 11 de agosto y sigue solo parcialmente contenido después de más de 24 horas pese al apoyo de varios cuerpos de bomberos departamentales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Quindio24horas/posts/pfbid02FzatGkZHJDrWfmJiVE1JV3KkYiWtXf1vphtJxsAtyQZE89HKK65y6QJ1mQSbk8q6l',
      authorHandle: 'Quindío 24 Horas',
      category: 'OFFICIAL' as const,
      placeName: 'Vereda La Maicena, Pijao',
      note: 'Citando un reporte oficial del Gobierno del Quindío: el incendio inició en un cultivo de aguacate en la vereda La Maicena y avanzó cerca de viviendas, poniendo en riesgo a varias familias rurales; controlado durante la noche con apoyo de bomberos de municipios vecinos, con labores de remate en curso.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/estoesquindio/reel/Db7QnToy6-g/',
      authorHandle: 'estoesquindio',
      category: 'NEED' as const,
      placeName: 'Pijao, Quindío',
      note: 'Post SOS del 11 de agosto citando a Javier Ramírez Flores, capitán del Cuerpo de Bomberos Voluntarios de Pijao, pidiendo la activación del protocolo de emergencia y apoyo aéreo mientras el incendio se salía de control.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/search/posts/?q=Pijao%20incendio%20forestal%20estafa',
      authorHandle: 'Varias fuentes nacionales (Policía Nacional, medios)',
      category: 'NEED' as const,
      placeName: 'Pijao / Génova (contexto nacional)',
      note: 'PRECAUCIÓN: existen alertas nacionales activas (Policía Nacional - Centro Cibernético, y varios medios) sobre campañas falsas de donación tras el terremoto. Ninguna nombra específicamente una estafa en Pijao o Génova, pero dado el contexto de doble emergencia y la llave Bre-B "@GLP760" sin verificar que circula para la campaña MMQ (ver aidPoints), se recomienda verificar cualquier canal de donación directamente con la Alcaldía de Pijao antes de transferir dinero.',
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
        municipioId: pijao.id,
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
