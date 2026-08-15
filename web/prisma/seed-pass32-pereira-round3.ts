/**
 * Pass 32 (2026-08-15) — third research pass on Pereira, run within ~24h
 * of the pass-23 follow-up. Deliberately scoped tight (last ~24h only) so
 * yield is expected to be thin. The standout finding: a scam confirmed
 * directly against an already-seeded aid point — someone swapped the QR
 * code on singer Jhonny Rivera's Hotel La Rivera donation drive to divert
 * funds. Also closes out a missing-persons case (Hotel Dibeni) and catches
 * two newly-evolved scam patterns. See
 * wiki/17-allied-resources-and-community.md "Pass 32" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass32-pereira-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Piscinas Olímpicas (por confirmar)',
      address: 'Junto a las Piscinas Olímpicas, frente al Obelisco, Pereira',
      phone: null,
      needsText: 'Refugio y centro de asistencia con capacidad para 100 personas, reportado como espacio adicional abierto por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/MuyEnojadoSoy/status/2088421671430717461',
      sourceOrg: null,
      submitterNote:
        'PRECAUCIÓN: reportado solo por una cuenta de reacción/repost partidista, no por la cuenta oficial verificada de la Alcaldía de Pereira, y no se pudo localizar un post directo sobre este albergue en la cuenta oficial. El contenido imita el formato de anuncios oficiales previos (capacidad específica, punto de referencia concreto) pero necesita una confirmación independiente antes de tratarse como verificado.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Todos Somos UTP (Asociación de Egresados UTP)',
      address: 'Cra. 26 # 12-24, barrio Álamos, Pereira (junto a NASE)',
      phone: null,
      needsText: 'Donaciones en efectivo, mercados, ropa, insumos de aseo y artículos de primera necesidad para estudiantes, personal y docentes de la UTP afectados por el terremoto. Cuenta de ahorros Davivienda 127270147292 o Llave Bre-B 8914082399. También lleva un censo de necesidades (forms.gle/Bx2XcLd37iY2LU6ZA).',
      sourceUrl: 'https://comunicaciones.utp.edu.co/115923/rectoria/todos-somos-utp-una-campana-para-apoyar-a-la-comunidad-universitaria-afectada-por-el-sismo/',
      sourceOrg: 'Asociación de Egresados UTP / Rectoría UTP',
      submitterNote:
        'Publicado en el portal oficial de comunicaciones de la UTP, con funcionarios nombrados (rectoría, representantes estudiantiles/de egresados, vicerrectoría académica) y resultados concretos del primer día (33 estudiantes reubicados en Pasto, 168 mercados recolectados). Distinta de la ya sembrada "Vaki - Fondo de emergencias universitarias (UTP)" - campaña institucional nueva, no duplicado.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pereira.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
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
      permalink: 'https://www.instagram.com/p/DcCEAkzlR_y/',
      authorHandle: 'jhonnyrivera (vía dimelokingnoticias)',
      category: 'OFFICIAL' as const,
      placeName: 'Hotel La Rivera, Pereira',
      note: 'CONFIRMADO: el cantante Jhonny Rivera (cuyo Hotel La Rivera está sembrado como albergue/punto de acopio en este proyecto) denunció que estafadores copiaron su imagen y cambiaron el código QR de la cuenta de donaciones, desviando fondos destinados a las víctimas del terremoto en Pereira. Su campaña ya había recaudado más de 140 millones de pesos. Corroborado por Noticias RCN. Verificar el QR/canal de donación directamente con el hotel antes de donar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/reel/DcCkFizPXUE/',
      authorHandle: 'eltiempo',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hotel Dibeni, Pereira',
      note: 'Se confirma la muerte de Juan Felipe Giraldo, 24 años, quien estaba desaparecido bajo los escombros del Hotel Dibeni desde el 10 de agosto. Estaba en Pereira por trabajo y se iba a casar el domingo siguiente; deja un hijo de 2 años. Corroborado ampliamente (Noticias Caracol, Semana, El País, Pulzo, El Colombiano, HCH Telev Digital, Impacto On Line) - cierra un caso de desaparecido abierto desde las pasadas anteriores.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBhiB_u4KA/',
      authorHandle: 'urgentepereira',
      category: 'OFFICIAL' as const,
      placeName: 'Puntos de albergue, Pereira',
      note: 'Actualización de estado: el Coliseo Mayor y el Estadio Mora Mora (ambos ya sembrados como albergues) alcanzaron su límite de aforo - se pide redirigir a otros albergues activos (Ecoparque El Vergel, Parque El Oso, Parque Olaya, Boston/Polideportivo Belalcázar, Villa Olímpica/Plazoleta Risaralda).',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCIth3STUP/',
      authorHandle: 'deigoncalva',
      category: 'NEED' as const,
      placeName: 'Pereira',
      note: 'Nuevo patrón de estafa: falsos anuncios de arriendo dirigidos a familias desplazadas de Pereira que buscan vivienda tras perder su hogar. El estafador pide un depósito por Nequi por un lugar "sin verlo" y luego desaparece. Distinto de las estafas de QR de donación ya documentadas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/telemedellin.tv/posts/pfbid0gdGmbGu7fL2AE1Bj9RVqwT7ykANhMf2zm3bMhunXtEN14KV8MnrMfnvDXMU9JWSHl',
      authorHandle: 'TM+ Telemedellín',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'Voluntarios denuncian que una alerta de personas atrapadas bajo escombros en Pereira era falsa - la intervención fue en realidad para recuperar una caja registradora de un negocio dañado, usando falsas alertas de rescate para obtener mano de obra/ayuda gratuita para saqueo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Alcaldiapereira/status/2088442440185196873',
      authorHandle: '@Alcaldiapereira',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira, Risaralda',
      note: 'Balance oficial del PMU publicado directamente por la cuenta de la Alcaldía: 95 muertos, 270 desaparecidos, 259 heridos, 260 rescatados, 66 edificios en colapso total, 35,200+ viviendas afectadas, 40,000+ personas afectadas. Las cifras coinciden con las ya registradas como TollRecord en la pasada 23a (seed-pass23a-toll-update-aug14.ts) - no se crean nuevos TollRecord, se sembró este post porque es la propia cuenta oficial confirmando el balance con una URL distinta.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/NoticiasRCN/status/2088472049836593521',
      authorHandle: '@NoticiasRCN',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'El presidente Abelardo De la Espriella visitó Pereira y Quibdó y anunció que los decretos de emergencia incluirán recursos especiales para Pereira, nombrando a un funcionario oriundo de Pereira para coordinar.',
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
        municipioId: pereira.id,
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
