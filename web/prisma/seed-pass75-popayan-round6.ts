/**
 * Pass 75 (2026-08-16) — round 6 continues, Popayán. Six prior rounds
 * (9, 11, 20, 29, 41, 51, 64) covered this city, most recently (pass 64)
 * finding every single aid-point candidate was a duplicate. This round
 * breaks that streak: the "huge update" surge reached even the
 * thinnest-covered tracked city, surfacing five genuinely new,
 * concrete acopio points tied to named organizations with verifiable
 * addresses — none of them overlapping with the five already on file
 * (Casa de la Moneda, Hogar San Vicente de Paúl, Hospital San José,
 * Alcaldía Secretaría General, Arquidiócesis/Cámara de Comercio).
 *
 * Popayán's own death/injury toll remains at zero, unchanged across all
 * six rounds — the UNGRD's own Aug 16 national balance explicitly names
 * Chocó, Valle del Cauca, Risaralda, Caldas and Quindío as the affected
 * departments; Cauca isn't on the list. The one death connected to this
 * city — Pablo Andrés Rivera Avirama, a Popayán native and UNIMAYOR
 * alumnus — occurred at the Pereira airport, not in Popayán itself, so
 * it doesn't change the local count; his funeral was held in the city
 * and widely mourned, corroborated by five independent sources.
 *
 * Crowdfunding remains a confirmed absence for a sixth consecutive
 * round — no Popayán-specific GoFundMe or Vaki campaign has ever
 * existed. One repeat finding (15 tons of radio-station-collected aid
 * dispatched outbound to Valle del Cauca) is the same story pass 64
 * already documented under a different reposting page — not re-seeded.
 * See wiki/17-allied-resources-and-community.md "Pass 75" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass75-popayan-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '19001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'AAPSA — Acueducto y Alcantarillado de Popayán (Campaña #AapsaSolidaria)',
      address: 'Calle 3 N° 4-29, sector histórico, Popayán, Cauca',
      phone: '(602) 832 1000 / WhatsApp 316 320 3662',
      needsText: 'Alimentos no perecederos, artículos de aseo, cobijas y ropa para familias damnificadas por el sismo. Campaña activa del 12 al 14 de agosto, "Payaneses, unidos en un solo corazón".',
      sourceUrl: 'https://www.facebook.com/acueductopopayan/posts/aapsasolidaria-hoy-tambi%C3%A9n-puedes-traer-tu-aportepayaneses-unidos-en-un-solo-cor/1516595283842345/',
      sourceOrg: 'Acueducto y Alcantarillado de Popayán S.A. E.S.P. (AAPSA)',
      submitterNote: 'Corroborado de forma independiente por los cinco agentes de esta pasada: la página oficial de AAPSA, un post de X previo (12 de agosto), y una publicación de Popayán Moderna, todos con la misma dirección confirmada en el sitio institucional aapsa.com.co. No estaba entre los cinco puntos ya conocidos de las seis pasadas anteriores.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Donatón Solidario — Centro Comercial Monserrat Plaza',
      address: 'Centro Comercial Monserrat Plaza, Vía al Bosque, Popayán, Cauca',
      phone: null,
      needsText: 'Guantes, sogas, palas, bebidas hidratantes, alimentos no perecederos, elementos de aseo, insumos hospitalarios, pañales, cobijas, colchonetas, ropa en buen estado y medicamentos, destinados a municipios del norte del Cauca. Horario 8:00am-10:00pm, jueves 13 a domingo 16 de agosto (hoy es el último día).',
      sourceUrl: 'https://www.instagram.com/p/Db9pnsjIFtM/',
      sourceOrg: 'Centro Comercial Monserrat Plaza',
      submitterNote: 'Publicado por la cuenta oficial verificada del centro comercial, con dirección, fechas y horario concretos.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Nos Movemos por Colombia — Jornada Solidaria, TerraPlaza',
      address: 'Centro Comercial TerraPlaza, Popayán, Cauca',
      phone: null,
      needsText: 'Jornada de donación presencial hoy (16 de agosto) desde las 9:00am, organizada por @imdancecol; también acepta contribuciones virtuales/remotas para quienes no puedan asistir en persona.',
      sourceUrl: 'https://www.instagram.com/p/DcEXoz9lgXZ/',
      sourceOrg: null,
      submitterNote: 'Etiqueta de ubicación explícita en Popayán, fecha del evento coincide exactamente con el día de esta pasada.',
    },
    {
      kind: 'VET' as const,
      name: 'Veterinaria Patitas / Dr. Arbeláez Clínica Veterinaria — colecta para mascotas damnificadas',
      address: 'Popayán, Cauca (clínicas veterinarias físicas)',
      phone: null,
      needsText: 'Alimento, cobijas, medicamentos y artículos de higiene para animales afectados por el sismo, coordinado con un evento de adopción en Santa Clara. Ventana de colecta declarada hasta el sábado al mediodía — probablemente ya cerrada, pero las clínicas siguen siendo un recurso local permanente.',
      sourceUrl: 'https://www.instagram.com/p/Db8k9g2s4Sg/',
      sourceOrg: null,
      submitterNote: 'Cuentas locales nombradas y etiquetadas geográficamente en Popayán; confianza media porque el plazo declarado de la colecta probablemente ya pasó.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio INVÍAS — Gestora Social de Popayán',
      address: 'Sede INVÍAS Popayán, diagonal al Centro Comercial Campanario, Popayán, Cauca',
      phone: null,
      needsText: 'Ropa, alimentos y elementos de primera necesidad para familias afectadas por el terremoto.',
      sourceUrl: 'https://www.facebook.com/reel/1446113214022239',
      sourceOrg: 'Gestora Social de Popayán (Yessenia Velasco Mosquera)',
      submitterNote: 'Publicado por la página oficial de EMTEL SA ESP Telecomunicaciones Popayán, nombrando a la Gestora Social por su nombre. Fuente única, por eso confianza media. Posible relación con una colecta de un colectivo de mujeres emprendedoras vista por separado en TikTok en el mismo centro comercial Campanario — no se pudo confirmar si es el mismo esfuerzo o uno distinto.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: popayan.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: popayan.id,
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
      permalink: 'https://www.facebook.com/unimayor/posts/desde-la-instituci%C3%B3n-universitaria-colegio-mayor-del-cauca-lamentamos-el-sensibl/1373212628273869/',
      authorHandle: 'Institución Universitaria Colegio Mayor del Cauca (UNIMAYOR)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán, Cauca (fallecido en Pereira)',
      note: 'PRIMERA MUERTE CONECTADA A POPAYÁN en las seis rondas de investigación: Pablo Andrés Rivera Avirama, egresado de UNIMAYOR y oriundo de Popayán, fue reportado desaparecido en el aeropuerto Matecaña de Pereira tras el sismo y luego confirmado fallecido allí. Su funeral se realizó en Popayán alrededor del 14-15 de agosto, con duelo amplio en la ciudad. Corroborado de forma independiente por al menos cuatro medios más (Sabe la Última Radio, Cauca Primicia, Noticias Cauca, Popayán Moderna). IMPORTANTE: la muerte ocurrió en Pereira, no en Popayán — no cambia el conteo municipal de víctimas de esta ciudad, que sigue en cero.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/alcaldiadepopayan/posts/pfbid038M5k6xxZSGUaiiRncCFTSk7gd6MAtEAMj1rytUyExWgSp4Hf84TAH23n1m3NzoVol',
      authorHandle: 'Alcaldía de Popayán / Secretaría de Infraestructura',
      category: 'OFFICIAL' as const,
      placeName: 'Hogar San Vicente de Paúl y establecimientos comerciales, Popayán',
      note: 'Desarrollo de fase de recuperación: cuadrillas municipales continúan la remoción de escombros en el ya conocido Hogar San Vicente de Paúl y en varios establecimientos comerciales dañados de Popayán, con apoyo del Ejército (más de una tonelada retirada según una publicación corroborante).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caracolradio/video/7672976633996889365',
      authorHandle: '@caracolradio',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán',
      note: 'Caracol Radio reporta que el servicio eléctrico fue restablecido en Popayán tras los cortes causados por el terremoto — hito genuino de la fase de recuperación.',
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
        municipioId: popayan.id,
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
