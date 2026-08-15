/**
 * Pass 21 (2026-08-14) — deep multi-agent research pass on Dosquebradas (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven).
 * Eighth city in the per-city deep-pass rotation. Dosquebradas is directly
 * adjacent to Pereira (same metro area) — every candidate here was checked
 * against generic "Pereira y Dosquebradas" framing and against everything
 * already seeded for Pereira (passes 13-14) to avoid cross-city duplicates;
 * one near-duplicate (a union acopio point at an address already on file
 * under a different name) was deliberately NOT re-seeded, see notes below.
 * See wiki/17-allied-resources-and-community.md "Pass 21" for full agent
 * notes and rejected candidates. Run once via
 * `npx tsx prisma/seed-pass21-dosquebradas-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dosquebradas = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66170' } })

  const aidPoints = [
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Jornada de donación de sangre - ESE Hospital Santa Mónica Dosquebradas',
      address: 'Área del CADRI, junto a Urgencias, ESE Hospital Santa Mónica, Dosquebradas (segundo punto: Hemocentro del Otún, Cra 6 #22-57)',
      phone: null,
      needsText: 'Jornada de donación de sangre en articulación con el Hemocentro del Otún, 9:00 a.m. a 5:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db9A1NhpiBI/',
      sourceOrg: 'ESE Hospital Santa Mónica de Dosquebradas + Hemocentro del Otún',
      submitterNote:
        'Primer punto de donación de sangre confirmado específicamente para Dosquebradas - el Hospital Santa Mónica es su propio hospital, distinto del Hospital San Jorge de Pereira ya sembrado en pasadas anteriores. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Centro Veterinario de Dosquebradas',
      address: 'Calle 42 #15-71, Barrio Buenos Aires, Dosquebradas',
      phone: '310 420 9062 (dígitos parcialmente confirmados, pueden variar)',
      needsText: 'Ayuda a encontrar mascotas perdidas durante el terremoto; consultas veterinarias gratuitas en horario habitual para mascotas afectadas.',
      sourceUrl: 'https://www.instagram.com/p/Db4qnX6N9jR/',
      sourceOrg: 'Centro Veterinario de Dosquebradas (cvdosquebradas)',
      submitterNote: 'Clínica veterinaria local establecida, dirección y barrio específicos (Buenos Aires). Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Aceros Gricar - donación de placas de identificación para mascotas',
      address: 'Cra. 16 #70-68, Dosquebradas, Risaralda',
      phone: null,
      needsText: 'Donación de placas de identificación personalizadas para perros y gatos, fabricadas en planta.',
      sourceUrl: 'https://www.instagram.com/p/Db_beEbB4Ga/',
      sourceOrg: 'Aceros Gricar',
      submitterNote: 'Negocio real de fabricación de acero ofreciendo un aporte en especie concreto y específico, no solicitud de dinero. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Paraíso Canino - refugio de Sol Ángel Allan',
      address: 'Dosquebradas, Risaralda (vivienda/refugio destruido; dirección exacta no dada)',
      phone: '320 676 2772',
      needsText: 'Refugio casero de perros totalmente destruido por el terremoto junto con la vivienda de la responsable. Necesita donaciones, alimento o cualquier apoyo para reconstruir.',
      sourceUrl: 'https://www.facebook.com/reel/1331525642082011',
      sourceOrg: null,
      submitterNote: 'Responsable nombrada con contacto telefónico directo (no un enlace bancario anónimo), reposteado por un medio regional (HUILA Digital). Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue temporal Polideportivo del Campestre',
      address: 'Polideportivo del Campestre, Dosquebradas (caracterización previa en el CAM, carpa amarilla)',
      phone: null,
      needsText: 'Familias que necesiten refugio deben dirigirse primero al Centro Administrativo Municipal (CAM, carpa amarilla) para caracterización antes de ser remitidas al Polideportivo del Campestre.',
      sourceUrl: 'https://www.instagram.com/p/Db8l7UIx6io/',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote:
        'Gráfico oficial de la Alcaldía ("Albergues temporales habilitados"). NOTA: no se pudo confirmar si este es el mismo complejo que "Campestre B" (sembrado abajo) bajo un nombre distinto, o un sitio genuinamente diferente dentro del mismo sector Campestre - no se asume ninguna de las dos opciones. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue temporal Campestre B',
      address: 'Campestre B, Dosquebradas, Risaralda',
      phone: null,
      needsText: 'Aproximadamente 120 personas de 36 familias están alojadas en unas 47 carpas en este albergue temporal.',
      sourceUrl: 'https://www.facebook.com/reel/4565219053735994',
      sourceOrg: null,
      submitterNote:
        'Reportaje de Noticias UNOA con cifras específicas (120 personas/36 familias/47 carpas), corroborado por un segundo video de TikTok (@decoadams) mostrando el mismo sector. NOTA: posible relación con el "Polideportivo del Campestre" sembrado arriba - ver esa nota. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Caseta Comunal en Frailes - reubicación temporal del Hogar Santa Marta',
      address: 'Caseta comunal, barrio Frailes, Dosquebradas (el asilo original está en el barrio Olaya Herrera)',
      phone: null,
      needsText: '17 residentes de edad avanzada del hogar geriátrico Santa Marta, más personal, duermen en colchonetas en el piso de una caseta comunal tras el colapso del edificio de su asilo. Esperan ayuda estatal o privada para reubicar la institución permanentemente.',
      sourceUrl: 'https://www.facebook.com/carlos.zapata.288765/posts/pfbid029R7YhbdQfVTwGtRBHYxAxRpujfBTFbqizmmZiDfHWujQ27DJ6t3A7og5Esme9YYUl',
      sourceOrg: 'Hogar Santa Marta',
      submitterNote:
        'Relato en primera persona de un familiar de una de las residentes, nombra al director (Jaime Hernández) y a la fundadora (doña Rosa de Hernández), sin solicitud de pago. Confianza media-alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Fundación Cristiana Rescatados Por Su Sangre - refugio para ~150 personas',
      address: 'Barrio Frailes, Dosquebradas, Risaralda',
      phone: null,
      needsText:
        'Fundación cristiana de rehabilitación que alberga a ~150 personas (hombres, mujeres, niños y personas en situación de calle) en su programa. Edificio dañado por el terremoto. Donaciones: Bancolombia ahorros 26451852719, Nequi 3244439600.',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0GCpMBSM6sKf8bF3m3kMmZ3LUT8YawiqPs7Yh22dcFt6SpdinLVXqcWV8DpWH5o8il&id=100013028055667',
      sourceOrg: 'Fundación Cristiana Rescatados Por Su Sangre',
      submitterNote:
        'Corroborado independientemente dos días después por un medio de prensa local verificado (Eje al Día Noticias), describiendo la misma fundación como refugio de casi 150 personas en situación de calle. Categorizado como ALBERGUE (no solo donación monetaria) dado que su función principal es alojar personas. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cámara de Comercio de Dosquebradas - cuentas para donaciones en dinero',
      address: null,
      phone: null,
      needsText: 'Donaciones en dinero para apoyar a personas afectadas por el terremoto en Dosquebradas. Banco Popular ahorros 500808278471; Davivienda corriente 126269999309.',
      sourceUrl: 'https://www.instagram.com/p/Db6TGVkRw0n/',
      sourceOrg: 'Cámara de Comercio de Dosquebradas',
      submitterNote: 'Cuenta institucional (Cámara de Comercio), sin reportes de cuentas rotas en comentarios. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Juntos por el hogar de Caro y Oskar',
      address: null,
      phone: null,
      needsText: 'Fondos para ayudar a Carolina (Caro Carantón Agudelo) y Óskar Ortiz a reconstruir tras la destrucción estructural de su vivienda en Dosquebradas por el sismo del 10 de agosto.',
      sourceUrl: 'https://vaki.co/vaki/caro-y-oskar',
      sourceOrg: null,
      submitterNote:
        'Encontrado independientemente por 2 de 5 agentes. Organizadora verificada en Vaki (Juliet Ciro Díaz), 117 donantes, ~$7,000,000 COP recaudados, actualización posterior confirmando actividad activa. El detalle específico de Dosquebradas viene corroborado por cobertura de Pulzo (medio real) citando a la familia directamente. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help Dosquebradas and Claudia\'s Family"',
      address: null,
      phone: null,
      needsText: 'Comidas para familias que dependen de salarios diarios, hidratación para rescatistas, y cobijas/ropa para quienes perdieron pertenencias en Dosquebradas.',
      sourceUrl: 'https://www.gofundme.com/f/help-dosquebradas-and-claudias-family',
      sourceOrg: null,
      submitterNote:
        'Encontrado independientemente por 2 de 5 agentes. Organizadora de la diáspora (Claudia Macuil, Staten Island NY) con hermanos en terreno haciendo trabajo de hidratación/rescate y cocina en Dosquebradas específicamente. $552 recaudados de meta $5,000, 8 donantes nombrados. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Rebuilding After the Earthquake" (Asistimotos)',
      address: 'Nueva sede en expansión: oficina de Asistimotos en Dosquebradas',
      phone: null,
      needsText:
        'Proteger los empleos y nómina de ~20 empleados, mantener operativo el servicio de grúa/asistencia vial, y ampliar/renovar la sede de Dosquebradas para reemplazar la sede central de Pereira (14 años de operación), ahora condenada para demolición.',
      sourceUrl: 'https://www.gofundme.com/f/help-rebuild-asistimotos-and-home',
      sourceOrg: 'Asistimotos',
      submitterNote:
        'El hallazgo más sólido de esta pasada: empresa real (asistencia vial, ~20 empleados) con sede ya existente en Dosquebradas y un plan concreto de "nuevo comienzo desde Dosquebradas". Organizadora de la diáspora (Erika Valencia Bedoya, Smithtown NY) con nota de transparencia explicando el mecanismo de pago vía EE.UU. $3,661 recaudados de meta $35,000, 36 donantes, narrativa bilingüe detallada. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Colecta vereda Santa Ana (Carlos Andres Torres)',
      address: 'Vereda Santa Ana, Dosquebradas',
      phone: '311 308 4429 (Nequi)',
      needsText: 'Donaciones monetarias para damnificados de la vereda Santa Ana. Cuenta Caja Social 24070956805.',
      sourceUrl: 'https://www.tiktok.com/@michelleossag/video/7672819811516304658',
      sourceOrg: null,
      submitterNote:
        'Cuenta establecida (1,027 seguidores) con contacto nombrado y número de cuenta bancaria real, no solo Nequi. Es una colecta individual, no institucional - mismo perfil de riesgo que otras solicitudes personales que este proyecto trata con cautela. Verificar manualmente antes de aprobar. Confianza baja.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación Porque Juntos Somos Más - centro de acopio',
      address: 'K16 #27-8, Dosquebradas, contiguo al Hotel Yellow',
      phone: '315 345 0056 / 313 666 5206',
      needsText: 'Alimentos no perecederos, agua, elementos de aseo, pañales, cobijas, ropa en buen estado, artículos para bebés/niños/adultos. Ofrece recogida a domicilio para donantes que no puedan trasladarse.',
      sourceUrl: 'https://www.instagram.com/p/Db581lMIrK8/',
      sourceOrg: 'Fundación Porque Juntos Somos Más',
      submitterNote: 'Dirección específica distinta de los puntos ya conocidos (Las Vegas, La Rosa). Cero likes al momento de la revisión y el registro de la fundación no se pudo verificar más allá de la cuenta de Instagram - confianza media, verificar antes de promover ampliamente.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación La Granja de los Abuelos',
      address: 'Avenida del Pollo, Vereda La Esmeralda, Dosquebradas',
      phone: null,
      needsText: 'Fundación de cuidado de adultos mayores con techo y estructura dañados. Necesita alimentos, pañales, agua, medicamentos, tejas y elementos de aseo.',
      sourceUrl: 'https://www.facebook.com/victor.ibarra.9638718/posts/pfbid02Hmu2QUY5Xx4cQ77vYWZc2MNbGoQxALcT2wXW2B6XVpHaCV7DkZmqdGdShXVDqVBRl',
      sourceOrg: 'Fundación La Granja de los Abuelos',
      submitterNote: 'Post con fotos de testigo, dirección completa y lista de necesidades concreta. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Parroquia San Marcos Evangelista - nuevo punto de acopio Cáritas Pereira',
      address: 'Templo parroquial, Barrio Santa Isabel, Dosquebradas',
      phone: null,
      needsText: 'Punto de acopio habilitado de forma transitoria por la Diócesis después de que la sede anterior del Banco de Alimentos de Cáritas Pereira (sector Las Aromas, Pereira) resultara afectada. El padre Óscar recibe y organiza ayudas para familias damnificadas.',
      sourceUrl: 'https://www.tiktok.com/@noticiasunoa/video/7673989637261643016',
      sourceOrg: 'Cáritas Pereira / Diócesis',
      submitterNote:
        'Aunque la organización lleva "Pereira" en su nombre, esta es su nueva sede física real, ubicada en Dosquebradas (Barrio Santa Isabel) tras el daño a su sede original en Pereira - no es una mención genérica "Pereira y Dosquebradas", tiene dirección y responsable propios en Dosquebradas. Primer punto de acopio en Santa Isabel. Confianza alta.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: dosquebradas.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: dosquebradas.id,
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
      permalink: 'https://www.instagram.com/p/Db9A1NhpiBI/',
      authorHandle: 'ESE Hospital Santa Mónica',
      category: 'AID_POINT' as const,
      placeName: 'Hospital Santa Mónica, Dosquebradas',
      note: 'Jornada de donación de sangre en articulación con el Hemocentro del Otún.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4qnX6N9jR/',
      authorHandle: 'cvdosquebradas',
      category: 'AID_POINT' as const,
      placeName: 'Centro Veterinario de Dosquebradas',
      note: 'Búsqueda de mascotas perdidas y consultas veterinarias gratuitas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_beEbB4Ga/',
      authorHandle: 'acerosgricar',
      category: 'AID_POINT' as const,
      placeName: 'Aceros Gricar, Dosquebradas',
      note: 'Donación de placas de identificación para mascotas fabricadas en planta.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8l7UIx6io/',
      authorHandle: 'elmedionoticias (repost de Alcaldía de Dosquebradas)',
      category: 'AID_POINT' as const,
      placeName: 'Polideportivo del Campestre, Dosquebradas',
      note: 'Gráfico oficial de albergues temporales habilitados.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6TGVkRw0n/',
      authorHandle: 'camaradedosquebradas',
      category: 'AID_POINT' as const,
      placeName: 'Cámara de Comercio de Dosquebradas',
      note: 'Cuentas bancarias para donaciones en dinero.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db5-5rNRlJB/',
      authorHandle: 'henaougc',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Dosquebradas',
      note: 'Búsqueda de Nicolás Díaz, entrenador en Bodytech, visto por última vez en Dosquebradas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/jatirado/status/2087999373422506164',
      authorHandle: '@jatirado',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas',
      note: 'La Alcaldía de Dosquebradas decretó toque de queda preventivo (6pm-6am) tras el sismo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/infobae/status/2087435163860922503',
      authorHandle: '@infobae',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Dosquebradas',
      note: 'Carlos Luis Cáceres, ciudadano argentino residente en Dosquebradas, fue encontrado vivo tras estar desaparecido varias horas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ValerieInLove/status/2086890644904038546',
      authorHandle: '@ValerieInLove',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'La Mariana, Dosquebradas',
      note: 'Búsqueda de dos psicólogos, Lina Mercedes Gañán y Alejandro Arévalo, en el barrio La Mariana.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1416570303619381',
      authorHandle: 'Eje al Día Noticias',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Cristiana Rescatados Por Su Sangre, Barrio Frailes',
      note: 'Reportaje de prensa confirmando el refugio de ~150 personas en situación de calle, dañado por el sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/4565219053735994',
      authorHandle: 'Noticias UNOA',
      category: 'AID_POINT' as const,
      placeName: 'Campestre B, Dosquebradas',
      note: 'Reportaje sobre el albergue temporal de carpas: 120 personas, 36 familias, 47 carpas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1331525642082011',
      authorHandle: 'HUILA Digital',
      category: 'AID_POINT' as const,
      placeName: 'Paraíso Canino, Dosquebradas',
      note: 'Refugio canino destruido por el terremoto junto con la vivienda de su responsable.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/victor.ibarra.9638718/posts/pfbid02Hmu2QUY5Xx4cQ77vYWZc2MNbGoQxALcT2wXW2B6XVpHaCV7DkZmqdGdShXVDqVBRl',
      authorHandle: 'Victor Ibarra',
      category: 'AID_POINT' as const,
      placeName: 'Fundación La Granja de los Abuelos, Vereda La Esmeralda',
      note: 'Fotos y necesidades específicas tras el daño estructural de la fundación.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02ZNp6KnGe1FUKr5Bs4q8kgvSzXnR431joYzhnzXsa7J7D8SMRcGPgRtwzMg7Uer2kl&id=100064022530300',
      authorHandle: 'Revista Región',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Dosquebradas',
      note: 'Video de un rescate de un perro atrapado en el balcón de un edificio dañado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7673989637261643016',
      authorHandle: '@noticiasunoa',
      category: 'AID_POINT' as const,
      placeName: 'Parroquia San Marcos Evangelista, Santa Isabel',
      note: 'Nuevo punto de acopio de Cáritas Pereira reubicado en Dosquebradas tras el daño a su sede original.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7673602827880533255',
      authorHandle: '@noticiasunoa',
      category: 'NEED' as const,
      placeName: 'Conjunto Portal del Parque, Dosquebradas',
      note: 'La Torre 6 colapsó totalmente, torres 3-5 con daño estructural, todo el complejo evacuado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673321334566358293',
      authorHandle: '@noticiascaracol',
      category: 'NEED' as const,
      placeName: 'Barrio La Graciela, Dosquebradas',
      note: 'Edificio en riesgo de colapso; decenas de familias evacuadas como medida de emergencia.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@sophieecheverril/video/7674008643519450376',
      authorHandle: '@sophieecheverril',
      category: 'NEED' as const,
      placeName: 'Coliseo de Dosquebradas',
      note: 'Llamado urgente por médicos de todas las especialidades en el punto de salud del Coliseo, ya conocido - indica escasez de personal en curso.',
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
        municipioId: dosquebradas.id,
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
