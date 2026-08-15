/**
 * Pass 25 (2026-08-14) — follow-up social media research pass on Manizales,
 * days after the original deep pass (wiki pass 16). Confirms both
 * previously-found Cámara de Comercio funds are still active and shows a
 * major economic-recovery expansion; surfaces a scam alert (ICBF
 * impersonation), coffee-economy recovery activity, and several new
 * institutional aid points. See wiki/17-allied-resources-and-community.md
 * "Pass 25" for full reasoning. Run once via
 * `npx tsx prisma/seed-pass25-manizales-followup.ts`.
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
      name: 'Fundación Pequeño Corazón - centro de acopio (alianza Alcaldía de Manizales)',
      address: 'Carrera 24 No. 53-39, Barrio La Arboleda, Manizales',
      phone: '321 816 9600 / 313 244 5968',
      needsText: 'Colchonetas y almohadas, cobijas, elementos de aseo, alimentos no perecederos, comida para mascotas; redistribuye ayuda hacia zonas rurales afectadas en alianza con la Alcaldía.',
      sourceUrl: 'https://www.lapatria.com/salud/la-fundacion-pequeno-corazon-se-une-la-alcaldia-de-manizales-estas-son-las-donaciones-que',
      sourceOrg: 'Fundación Pequeño Corazón + Alcaldía de Manizales',
      submitterNote:
        'Encontrado independientemente por 3 de 5 agentes (X, Instagram, Facebook), todos citando La Patria (diario principal de Manizales) con la misma dirección exacta. Dos números de teléfono ligeramente distintos reportados por diferentes fuentes - ambos incluidos. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Iglesia Cristiana Remanente Manizales - Campaña "Estamos Contigo"',
      address: 'Calle 50 No. 26-72, Manizales',
      phone: '310 374 5069 / 323 324 3930',
      needsText: 'Alimentos no perecederos, elementos de aseo personal, artículos para el hogar (meta: 100 kits); también acompañamiento espiritual y psicosocial. Recibe donaciones miércoles a sábado, 1:00pm-7:00pm.',
      sourceUrl: 'https://www.lapatria.com/manizales/esta-iglesia-cristiana-de-manizales-puso-en-marcha-campana-de-recoleccion-y-ofrece-ayuda',
      sourceOrg: 'Iglesia Cristiana Remanente Manizales',
      submitterNote: 'Pastor nombrado (Leandro Osorio Montoya), dirección y horario específicos, dos teléfonos de contacto. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Juguetes por Colombia - recolección para niños afectados',
      address: 'Sector de El Cable, Manizales (dirección exacta no dada)',
      phone: null,
      needsText: 'Pañales, juguetes y aportes económicos para niños y bebés afectados por el terremoto.',
      sourceUrl: 'https://www.instagram.com/p/DcCW8JljZoC/',
      sourceOrg: null,
      submitterNote: 'Publicado por Tu Canal Manizales (medio local real, 17K seguidores), muy reciente. Confianza media.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Like por la Vida (con Psicomed and Soul) - apoyo psicológico',
      address: 'Donaciones: Cra. 26 No. 49-64, Barrio Versalles (detrás de Confa de La 50), Manizales. Oficinas: Cra. 21 #64A-33 / Cra. 21 N°29-29 Ed. Infimanizales.',
      phone: '350 811 3916 / 310 870 0740',
      needsText: 'Apoyo psicológico/psiquiátrico gratuito para sobrevivientes del terremoto (en albergues y zonas rurales); también recibe alimentos no perecederos, cobijas, toallas higiénicas, elementos de higiene, crema para bebés.',
      sourceUrl: 'https://www.lapatria.com/salud/por-la-vida-brinda-apoyo-psicologico-los-sobrevivientes-del-terremoto-de-este-10-de-agosto',
      sourceOrg: 'Like por la Vida (fundador: Rubén Obando)',
      submitterNote: 'Servicio de salud mental real y preexistente (perfil de Google Business, 5.0 estrellas), ahora activado específicamente para sobrevivientes del sismo. Cierra el ángulo de seguimiento en salud mental que se buscaba en esta pasada. Confianza alta.',
    },
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Jornada de donación de sangre - Hemocentro del Café / FIODS Colombia',
      address: 'Manizales, Caldas',
      phone: null,
      needsText: 'Donación de sangre para atender a heridos del terremoto en Manizales y el Eje Cafetero.',
      sourceUrl: 'https://www.instagram.com/p/Db6_xAVkZbF/',
      sourceOrg: 'Hemocentro del Café + FIODS Colombia',
      submitterNote: 'Etiqueta a la cuenta real del banco de sangre regional y a la federación nacional de donantes; sin dirección/horario exactos en el post, marcado por Instagram como "AI content" (probablemente solo el gráfico). Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cámara de Comercio de Manizales - Ruta Integral de Apoyo a la Reactivación Económica (actualización)',
      address: null,
      phone: '323 942 1880 (WhatsApp Oficina Empresarial)',
      needsText:
        'ACTUALIZACIÓN de los dos fondos ya conocidos (Fondo Solidario Manizales y Fondo Solidario por los Empresarios de Caldas): ambos siguen ACTIVOS, no cerrados. Además, la CCMPC anunció una ruta completa de recuperación económica: asesoría gratuita legal/financiera/contable/psicológica vía "Oficina Empresarial" (WhatsApp 323 942 1880, oficinaempresarial@ccm.org.co), censo de daños empresariales, visitas de campo (incl. reunión con ~60 empresarios en Riosucio), y una reunión el 13 de agosto con el Ministro de Comercio pidiendo líneas de crédito Bancoldex, alivios tributarios y subsidios de empleo.',
      sourceUrl: 'https://ccmpc.org.co/la-camara-de-comercio-de-manizales-por-caldas-despliega-ruta-integral-de-apoyo-para-la-reactivacion-economica-tras-los-sismos/',
      sourceOrg: 'Cámara de Comercio de Manizales por Caldas (CCMPC)',
      submitterNote:
        'Encontrado independientemente por 4 de 5 agentes. Fuente primaria: el propio sitio web de la CCMPC, fechado "hoy 13 de agosto", con funcionarios nombrados. Responde directamente al ángulo de recuperación económica/empresarial que pedía esta pasada - incluye también el ángulo cafetero (Comité de Cafeteros de Caldas coordinando reporte de daños en fincas junto a la Alcaldía). Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Obras Rotarias Manizales (Club Rotario Manizales)',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias para reconstrucción y bienestar familiar en Manizales tras el terremoto. NIT 810003401, Bancolombia ahorros 37300025294.',
      sourceUrl: 'https://www.instagram.com/p/Db6OHyQjP7m/',
      sourceOrg: 'Fundación Obras Rotarias Manizales',
      submitterNote: 'Organización cívica establecida (Club Rotario Manizales), NIT y cuenta bancaria completos para transparencia, corroborado por la página de Facebook del Club Rotario. Genuinamente nueva - no encontrada en la pasada anterior. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help 40 Families After Manizales Earthquake" (Sergio Giraldo)',
      address: null,
      phone: null,
      needsText: 'Vivienda de emergencia, alimentos, suministros, transporte y limpieza para ~40 familias desplazadas de un edificio dañado en Manizales.',
      sourceUrl: 'https://www.gofundme.com/f/help-40-families-after-manizales-earthquake',
      sourceOrg: null,
      submitterNote: 'Organizador nombrado con historia específica y verificable (el edificio de su madre); $1,920 recaudados de meta $5,000, 30 donaciones, insignia de donación protegida de GoFundMe. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help my people in Manizales & Pereira after the earthquake" (Valeria Blandon)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua limpia y suministros médicos para Manizales y Pereira.',
      sourceUrl: 'https://www.gofundme.com/f/manizales-pereira-earthquake',
      sourceOrg: null,
      submitterNote: 'Organizadora de la diáspora (Miami, FL) con historia personal; $1,145 recaudados de meta $5,000, 14 donaciones. Prioridad menor que la campaña de Sergio Giraldo por no ser exclusiva de Manizales. Confianza media.',
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
      platform: 'X' as const,
      permalink: 'https://x.com/LaPatriaRadio/status/2087872399437922428',
      authorHandle: '@LaPatriaRadio',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'Regresaron las clases en Manizales el martes, aunque dos colegios y una escuela seguían cerrados por daños estructurales.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_QSkHFPuH/',
      authorHandle: 'tucanaldigital',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'Alerta de estafa: la directora del ICBF aclara que la entidad NO solicita dinero; estafadores usan su nombre/logo. El canal oficial es la Oficina de la Primera Dama de Caldas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCKXCgAF8M/',
      authorHandle: 'tucanaldigital',
      category: 'AID_POINT' as const,
      placeName: 'Albergue Coliseo de Manizales',
      note: 'Visita de verificación no anunciada tras quejas sobre comida/cobijas/atención - el medio confirmó que sí se estaba proveyendo, con porciones ajustadas tras un exceso inicial.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcB4BHsDsA6/?img_index=1',
      authorHandle: 'elmarmateno',
      category: 'OFFICIAL' as const,
      placeName: 'Caldas / Manizales',
      note: 'Cifras oficiales actualizadas del PMU: 9,159 viviendas afectadas en el departamento, 428 instituciones educativas afectadas, 10,183 damnificados. Subregión Centro Sur (Manizales, Villamaría, Neira, Palestina, Chinchiná): 1,271 viviendas destruidas totalmente, 2,936 parcialmente afectadas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9ZXf7lOF8/?img_index=1',
      authorHandle: 'fnc_caldas',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Neira, Caldas (subregión cafetera de Manizales)',
      note: 'El Comité de Cafeteros de Caldas inicia visitas territoriales para escuchar a familias cafeteras sobre daños del sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/NotiCaldasInformativo1/posts/pfbid02ph22g5XgSJ9uwc15kYwdFcXv4axBZvpiyW1k5YiwKg62cGHy9a6WTQPVqAN5SX2Tl',
      authorHandle: 'Noticaldas Informativo',
      category: 'OFFICIAL' as const,
      placeName: 'Catedral Basílica, Manizales',
      note: 'Acerías PazdelRío (Grupo Trinity) donará el 100% del acero para reparar la torre de la Catedral Basílica, dañada y inclinada tras el sismo; también dona kits de protección a la Cruz Roja.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/4468651793413895',
      authorHandle: 'Jorge Eduardo Rojas',
      category: 'OFFICIAL' as const,
      placeName: 'Centro de Manizales',
      note: 'Anuncio de una nueva gerencia dedicada a la reactivación económica del centro de la ciudad, evaluando negocio por negocio y casa por casa.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid025yNKYvDcgBCGwotRdv4krn661BkTBZDfZtteFeXXNWMAsAeQ4kaZWb4b3wqcHmcyl&id=61566729489864',
      authorHandle: 'Holamanizalesoficial (Alcaldía de Manizales)',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'Manizales inicia el retorno progresivo a las actividades académicas tras el sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/laveintitresco/posts/pfbid02AoiBDAd5oNG52foS2cP22sKzKtxS76rzdRP9GBvXuwdthGC3ay24AGxNhb12qyeCl',
      authorHandle: 'La Veintitrés',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales (zonas rurales cafeteras)',
      note: 'La Alcaldía y el Comité Municipal de Cafeteros abren una ruta formal para que caficultores reporten daños en sus fincas.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@revistasemana/video/7672866275206384916',
      authorHandle: '@revistasemana',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'Balance oficial actualizado específico de Manizales (vía el presidente): 5 muertos, 112 heridos, 142 personas en albergues temporales, sin desaparecidos - cifra ligeramente distinta a la de 6 muertos ya registrada, ambas conservadas sin fusionar.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@milenio/video/7673366343378341141',
      authorHandle: '@milenio',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional, incl. Manizales)',
      note: 'El presidente declaró un estado de "emergencia económica" para agilizar la asignación de recursos sin esperar al Congreso.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@revistasemana/video/7673671219023006983',
      authorHandle: '@revistasemana',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia',
      note: 'CAF (Banco de Desarrollo de América Latina) entrega USD $48 millones destinados a colegios dañados por el sismo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caracolradio/video/7674050138662309141',
      authorHandle: '@caracolradio',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional)',
      note: 'La Policía Nacional alerta sobre estafas con falsas campañas de ayuda tras el terremoto.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@bluradioco/video/7674012275463785749',
      authorHandle: '@bluradioco',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia',
      note: 'La familia Santo Domingo (Fundación Santo Domingo) anuncia una donación de $100,000 millones COP para la reconstrucción de zonas afectadas.',
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
