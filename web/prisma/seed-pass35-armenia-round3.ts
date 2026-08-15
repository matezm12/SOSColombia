/**
 * Pass 35 (2026-08-15) — third research pass on Armenia, run within ~24h
 * of the pass-26 follow-up. Two new institutional acopio points, a
 * missing-persons appeal, an important nuance to Fundación Covida's
 * "funded and rebuilding" status (hydrotherapy still suspended pending
 * wall repair), and fresh building-damage detail. See
 * wiki/17-allied-resources-and-community.md "Pass 35" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass35-armenia-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Casa Holística Ananda - Centro de Acopio Solidario',
      address: 'Calle 22 Norte #11-80, Armenia, Quindío, código postal 760035',
      phone: '+57 300 892 9555 (Nequi / WhatsApp / Western Union)',
      needsText: 'Alimentos no perecederos, agua, elementos de aseo, ropa en buen estado, colchonetas, cobijas, almohadas, carpas, para llevar a municipios y zonas rurales del Quindío afectadas. Aportes económicos desde Colombia y el exterior: Nequi 300 892 9555; giros internacionales vía Western Union a nombre de Casa Holística Ananda (Cédula 52.037.113); correo casaanandayosoy@gmail.com. Certificado de donación disponible.',
      sourceUrl: 'https://www.instagram.com/p/DcB0UtXzHJg/',
      sourceOrg: 'Casa Holística Ananda',
      submitterNote: 'Centro de bienestar/comunidad preexistente (1,329 seguidores, programación regular de yoga/terapias), no una cuenta nueva creada para la emergencia. Corroborado independientemente por un post orgánico en X de una alumna describiendo cómo su maestra abrió su casa como punto de acopio.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Ambulancias Paramedic 911 - Punto de recolecta (Florida Mall)',
      address: 'Carrera 11 # 19-13, Local 6, Florida Mall, Armenia, Quindío',
      phone: null,
      needsText: 'Punto de recolección de donaciones organizado por una empresa establecida de ambulancias/EMS local.',
      sourceUrl: 'https://www.tiktok.com/@paramedic911amb/video/7673959779609480456',
      sourceOrg: 'Ambulancias Paramedic 911',
      submitterNote: 'Cuenta de TikTok verificada (11.4K seguidores) de una empresa de ambulancias establecida en Armenia. Corroborado por una publicación idéntica de una cuenta afiliada (posible funcionaria de la empresa) con la misma dirección y hora.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Jacobo Echeverria - Ayuda para remoción de escombros (GoFundMe)',
      address: 'Organizador en Linden, NJ; fondos dirigidos a Armenia, Pereira, Cali y Manizales',
      phone: null,
      needsText: 'Recaudo para comprar herramientas de remoción de escombros (martillos, cinceles, taladros, guantes, cascos, chalecos de seguridad) para una red de voluntarios que el organizador coordina entre EE.UU. y Colombia.',
      sourceUrl: 'https://www.gofundme.com/f/ayuda-para-remocion-de-escombros',
      sourceOrg: null,
      submitterNote:
        'Organizador identificable (oriundo de Armenia, sobreviviente del terremoto de 1999, vive hace 16 años en Nueva Jersey), uso concreto y no monetario de los fondos (herramientas), donantes reales visibles. Nota de fecha: el mensaje del organizador está fechado "hace 3 días" (~12 de agosto), por lo que la campaña podría ser anterior a la pasada 26 y simplemente no haberse detectado antes, en vez de ser genuinamente nueva de las últimas 24h - se incluye de todas formas con esta ambigüedad señalada.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
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
      permalink: 'https://www.facebook.com/reel/1086678107585051',
      authorHandle: 'Alerta Armenia',
      category: 'NEED' as const,
      placeName: 'Fundación Covida, Armenia',
      note: 'Matiz importante al estado "financiado y en reconstrucción" de la pasada 26: más de 200 usuarios (personas con fibromialgia, artritis, discapacidad) siguen sin acceso a hidroterapia porque un muro trasero de la sede sigue comprometido estructuralmente. La fundación (38 años de trayectoria, 14,000+ familias atendidas) sigue pidiendo apoyo de empresas y comunidad para la recuperación de infraestructura.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/lucely.marin.7906/posts/pfbid0t5Gd3Vgr9WcsLSZDWPxaoNYkQnSuHTbo9Gm7TMLbWax7BQ8PppgzBwr3gq7uErxDl',
      authorHandle: 'Lucelly Marín',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío',
      note: 'Llamado "SE BUSCA" de una madre por su hijo Cristian Camilo Arango Marín, desaparecido desde el terremoto del 10 de agosto. Contacto: 314 554 7669.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCg4_iCuW8/',
      authorHandle: 'quindionoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío',
      note: 'La Gobernación del Quindío entregó 500 kg de alimento para mascotas a seis fundaciones de bienestar animal afectadas por el terremoto - seguimiento directo a la crisis de bienestar animal (Fundación Oki Doki y otras) ya documentada.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCnlBPiyxR/',
      authorHandle: 'quindionoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío',
      note: 'Equipos de arquitectos e ingenieros recorren instituciones educativas afectadas del Quindío para determinar cuáles pueden reabrir de forma segura y qué remediación necesitan antes del regreso de los estudiantes.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCbreMRmeB/',
      authorHandle: 'armenialaciudad',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío',
      note: 'Tensión de la fase de reconstrucción: un proyecto de vivienda preexistente (anunciado antes del sismo) ahora también se plantea como solución para familias damnificadas, generando incertidumbre tanto para los beneficiarios originales como para los damnificados mientras avanza el censo oficial.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@periodicoelcolombiano/video/7673934279109381397',
      authorHandle: 'periodicoelcolombiano',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia, Quindío',
      note: 'Reporte de campo: el Condominio El Rincón fue evacuado por completo tras el colapso del tanque de agua del quinto piso, que causó fisuras estructurales graves; la Universidad del Quindío cerró su Bloque de Ciencias Básicas; el Hotel Armenia Estelar también resultó dañado.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Elolfato/status/2088445572495938033',
      authorHandle: '@Elolfato',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Quindío (carretera)',
      note: 'El medio local El Olfato entrevistó a Lucila Montenegro y su familia, quienes viajaban por un cumpleaños cuando ocurrió el sismo y describen haberse arrodillado en la carretera para dar gracias.',
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
        municipioId: armenia.id,
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
