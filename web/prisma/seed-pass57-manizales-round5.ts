/**
 * Pass 57 (2026-08-15) — third city in the fifth research round,
 * Manizales. Four prior rounds (16, 25, 34, 47) already covered this
 * city, so this pass hunted narrowly for fresh developments and
 * specifically chased down the Homecenter donation-reselling story
 * other cities' rounds this week found trending. Verdict, after all
 * five agents dug in: genuinely contested and NOT confirmed
 * Manizales-specific — evidence points toward Antioquia (San Pedro de
 * los Milagros/Medellín) as the actual origin, though a Manizales news
 * outlet did air its own on-camera clarification from a real local
 * Homecenter store, so it's documented as a live, unresolved
 * contradiction rather than asserted either way. The bigger confirmed
 * development: the "second phase" rental-subsidy program pass 47 flagged
 * as announced-but-not-flowing has now started actual disbursement.
 * Two campaigns the crowdfunding agent flagged as "new" — a taller
 * rebuild for Sandra Milena Rendón Valencia, and a Vaki for Mariana
 * Montes González — turned out on cross-check to already be seeded
 * (the former under Pereira, the latter under this same city's pass 47)
 * and were not re-seeded.
 * See wiki/17-allied-resources-and-community.md "Pass 57" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass57-manizales-round5.ts`.
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
      name: 'Coliseo Menor de Manizales — punto de acopio reabastecido',
      address: 'Coliseo Menor, Manizales, Caldas',
      phone: '(606) 893-2880 / (606) 878-1700 / WhatsApp +57 320 727 3645',
      needsText: 'La Alcaldía anunció el 15 de agosto que las donaciones se agotaron tras entregar 2,800 mercados. Piden reabastecer con: jabón de ropa y lavaplatos; champú/jabón/crema para bebé; champú, desodorante y crema dental para adultos; leche líquida y en polvo; enlatados; pastas, fríjoles, lentejas, harina; café, azúcar, galletas, pan; sal; cepillos de dientes; máquinas de afeitar; pañales (etapas 0-3); colchonetas, almohadas y ropa de cama NUEVA.',
      sourceUrl: 'https://www.lapatria.com/manizales/se-agotaron-las-ayudas-en-manizales-piden-mas-donaciones-para-afectados-por-el-terremoto',
      sourceOrg: 'Alcaldía de Manizales',
      submitterNote: 'Encontrado de forma independiente por los cinco agentes de esta pasada — corroboración excepcional. Artículo oficial de La Patria (15 de agosto) citando directamente a la Alcaldía, con lista de necesidades muy desglosada. Corroborado por publicaciones frescas mostrando a jugadores de Once Caldas (Dayro Moreno, Jefry Zapata, Juan Pablo Patiño) como voluntarios en el sitio. Distinto del Coliseo Mayor (el albergue principal ya conocido). Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fondo Solidario Comunitario / Juntos por Manizales',
      address: null,
      phone: null,
      needsText: 'Donaciones en dinero vía PSE/débito/crédito (web.ccmpc.org/DonacionesManizales) o transferencia internacional a Banco Davivienda, titular Cámara de Comercio de Manizales por Caldas, SWIFT CAFECOBB — para apoyar a familias, negocios y empresas afectadas por el terremoto.',
      sourceUrl: 'https://www.facebook.com/Jorge.Eduardo.Rojas.Giraldo/posts/pfbid0FMnMAukVhy319KJnBfFYbPkxxdxGYWZcyLxZSKiGtPrrXn1BtzY9JDry6iZ2R6WYl',
      sourceOrg: 'Cámara de Comercio de Manizales por Caldas / Cruz Roja Colombiana Seccional Caldas',
      submitterNote: 'Publicado directamente desde la cuenta del alcalde Jorge Eduardo Rojas, co-liderado por la Cámara de Comercio y la Cruz Roja Seccional Caldas, respaldado por la Alcaldía y La Patria — detalles bancarios/PSE/SWIFT completos, no un llamado vago. Genuinamente nuevo, no sembrado en las cuatro pasadas anteriores. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Ayudemos a reconstruir el hogar de Mary y Marco tras el terremoto de Manizales',
      address: null,
      phone: null,
      needsText: 'Evaluación estructural, remoción segura de escombros y reconstrucción de la vivienda de Mary y Marco Antonio, sobre la cual colapsó un edificio de apartamentos vecino el 10 de agosto.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-reconstruir-el-hogar-de-mary-y-marco-tras-el-terremoto-de-manizales',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por tres de los cinco agentes de esta pasada. Creada el 11 de agosto, insignia de organizador verificado en Vaki, cierra el 31 de agosto, donantes reales y fechados. Genuinamente nueva. Alta confianza.',
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
      permalink: 'https://x.com/ciudadyregionfm/status/2088702265117077675',
      authorHandle: '@ciudadyregionfm',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Coliseo Menor de Manizales',
      note: 'Jugadores de Once Caldas (Dayro Moreno, Jefry Zapata, Juan Pablo Patiño) fueron fotografiados como voluntarios en el punto de acopio del Coliseo Menor, ayudando a recibir donaciones junto a cientos de voluntarios más.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.lapatria.com/manizales/alcalde-de-manizales-anuncia-la-entrega-subsidios-de-arrendamiento-por-terremoto-este-es',
      authorHandle: 'La Patria / Alcaldía de Manizales',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales',
      note: 'ACTUALIZACIÓN DE ESTADO importante: la "segunda fase" de recuperación (subsidios de arriendo) que la pasada 47 marcó como "anunciada pero sin fluir" ya empezó a desembolsarse este sábado 15 de agosto. $300,000 COP/mes para arrendatarios (el alcalde está tramitando extenderlo de 1 a 3 meses) y 3 meses para propietarios que habitan el inmueble. Los afectados reciben un SMS para reclamar el primer pago en la Cruz Roja. Se abrió también una línea de denuncia (6068931378) contra la especulación en arriendos y materiales de construcción, con amenaza de remisión a Fiscalía/Sijín.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/3390865467742066',
      authorHandle: 'Noticias Manizales',
      category: 'OFFICIAL' as const,
      placeName: 'Homecenter, Manizales',
      note: 'CONTRADICCIÓN ENTRE FUENTES, sin resolver: la controversia nacional sobre Homecenter presuntamente revendiendo donaciones del terremoto está siendo cubierta activamente por medios de Manizales — este clip muestra a un empleado nombrado de una tienda Homecenter con marca visible aclarando en cámara que se trató de un error de rotulado interno, no reventa. SIN EMBARGO, una investigación más profunda esta misma pasada (por otros agentes, buscando el video viral original y sus hashtags) encontró que el clip que originó la controversia parece rastrearse a Antioquia (San Pedro de los Milagros/Medellín), no a Manizales, y otra publicación lo atribuyó a Pereira. Es posible que se trate de una controversia nacional multiciudad que los medios de Manizales simplemente amplificaron con más fuerza, en vez de un incidente exclusivo de esta ciudad — se documentan ambas lecturas en vez de afirmar una sola con certeza.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1304079204941001',
      authorHandle: 'Tu Canal Manizales',
      category: 'NEED' as const,
      placeName: 'Coliseo Mayor de Manizales',
      note: 'ACTUALIZACIÓN NEGATIVA de estado: denuncias sobre condiciones de comida, cobijas y atención general para las familias desplazadas que aún permanecen en el albergue del Coliseo Mayor Jorge Arango Uribe, al 14 de agosto — no es una confirmación de que el albergue siga bien abastecido.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/julianacarmonag/status/2088258890517405727',
      authorHandle: '@julianacarmonag',
      category: 'NEED' as const,
      placeName: 'Coliseo Mayor (albergue temporal), Manizales',
      note: 'PRECAUCIÓN: publicación que nombra a "Laboratorio de Vida", un grupo de base liderado por Cesar Duque que hace brigadas de alimentación para el albergue del Coliseo Mayor, con cuenta de Instagram propia (@laboratoriodevida_) pero solicitando donaciones a una cuenta bancaria y Nequi PERSONALES en vez de institucionales — verificar directamente con la cuenta de Instagram del grupo antes de donar dinero.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/nataly.saavedraarenas/posts/pfbid0HChVW5zkjwqKZLTNQTZj1LoaWrUSpaneQjnMkNVWmnE8CVbEqm8AY5HRZdYPEgxHl',
      authorHandle: 'Nataly Saavedra Arenas',
      category: 'NEED' as const,
      placeName: 'Manizales',
      note: 'Llamado individual: el tío y primos de la publicadora perdieron su vivienda en el terremoto y recaudan dinero para reconstruir vía Nequi/Bre-B al 314 706 9566. Fundraiser personal sin respaldo institucional — confianza media dado lo específico del contacto, pero sin verificación más allá de la publicación misma.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db37D5NhYpV/',
      authorHandle: 'anasofiaf_ugc',
      category: 'NEED' as const,
      placeName: 'Manizales',
      note: 'PATRÓN PROBABLE DE ESTAFA: video de una creadora de contenido pidiendo donaciones de agua/comida/kits de higiene a cuatro números de celular personales distintos bajo cuatro nombres distintos (María José, Ana, Estefanía, Luisa). Los comentarios principales lo señalan como sospechoso ("Solo hagan donación en canales oficiales, cuidado") y cuestionan que la creadora luzca completamente arreglada/maquillada para tratarse de una emergencia real. No tratar los números como destinatarios verificados.',
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
