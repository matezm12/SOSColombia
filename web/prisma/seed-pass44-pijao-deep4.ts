/**
 * Pass 44 (2026-08-15) — fourth deep research pass on Pijao, with a
 * specifically different angle from passes 37-39: instead of verifying
 * Pijao's own local situation, this pass hunted for OTHER cities,
 * accounts, and communities across Colombia (and abroad) amplifying
 * Pijao's need by name and redirecting followers toward ways to help.
 * Confirmed real cross-city amplification: a Bogotá-headquartered
 * mountain-ecosystem NGO (Cumbres Blancas Colombia) and a Bogotá
 * creative studio (co.inspires.lab, though its own bio places it in
 * Armenia) both name Pijao/Génova specifically in active donation
 * appeals; two national public broadcasters (RTVC Noticias, Canal
 * Trece) and a national digital outlet (Pulzo) ran Pijao-specific
 * coverage; a 182K-follower national sustainability influencer
 * (marianateranr) published a donation-point directory naming Pijao
 * drop-off locations. Also captured the primary-source origin post of
 * the #SOSPijao hashtag. Explicitly rejected as off-target: "Una Garra
 * por Colombia" (Vaki campaign), whose own base page scopes itself to
 * "el occidente del país" (Chocó/Pacific), not Quindío/Pijao, despite
 * being informally routed toward Pijao by one Armenia-based amplifier.
 * Several strong candidate posts (cross-city reposts of co.inspires.lab
 * by @2ombie.girl, @antioquiaenvivo, @mi.ocana; an Army 5th Division
 * tweet; a Blu Radio article) could not be seeded because agents could
 * not capture their exact permalinks — documented narratively in the
 * wiki instead of fabricating a URL. See
 * wiki/17-allied-resources-and-community.md "Pass 44" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass44-pijao-deep4.ts`.
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
      kind: 'MONETARY_DONATION' as const,
      name: 'Cumbres Blancas Colombia - campaña incendios forestales (incluye Pijao/Génova)',
      address: 'Bogotá, Colombia (ONG nacional de ecosistemas de montaña)',
      phone: '3237292612',
      needsText: 'Donaciones en efectivo (Bancolombia Ahorros 93549352675, o vía landing.cumbresblancas.org/incendios) para logística de las brigadas que combaten el incendio en Pijao y Génova, junto con Nariño y Antioquia: alimentación, transporte, combustible y equipo de protección.',
      sourceUrl: 'https://landing.cumbresblancas.org/incendios',
      sourceOrg: 'Cumbres Blancas Colombia',
      submitterNote:
        'ONG ambiental nacional (63K+ seguidores en Instagram) con sede confirmada en Bogotá, corroborada de forma independiente por dos de los cinco agentes de esta pasada. Su publicación del 14 de agosto ("¡Las montañas de Colombia necesitan tu ayuda!") nombra explícitamente "QUINDÍO: ¿Dónde están los incendios? Pijao, Génova..." junto a Nariño y Antioquia. Confianza media-alta: un agente encontró el texto que nombra a Pijao en la publicación principal de la cuenta; otro solo lo vio en material secundario/reposteado, así que se marca como corroborado pero no al 100% en la fuente primaria.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'co.inspires.lab - insumos para bomberos voluntarios de Pijao y Génova',
      address: 'Armenia, Quindío (según bio propia de la cuenta: "📍Armenia, Quindío")',
      phone: 'Nequi 3118222674 / llave @emilia7252',
      needsText: 'Insumos de protección para bomberos y voluntarios que combaten el incendio en Pijao y Génova: linternas, guantes industriales, gafas de seguridad, botas y equipo similar.',
      sourceUrl: 'https://www.instagram.com/co.inspires.lab/reel/Db_7THguL47/',
      sourceOrg: 'co.inspires.lab',
      submitterNote:
        'Cuenta pequeña pero identificable (2,457 seguidores, sede confirmada en Armenia, Quindío) cuyo llamado ("Ayudemos a los voluntarios y bomberos que están tratando de contrarrestar el incendio en Pijao y Génova") se volvió el post de origen de una cadena real de reposteos fuera del eje cafetero: cuentas con base declarada en Antioquia (@antioquiaenvivo) y en Ocaña, Norte de Santander (@mi.ocana) lo republicaron con el mismo texto y número de Nequi, además de una influencer de 188K seguidores (@2ombie.girl). Esos reposteos no se sembraron aquí como posts individuales porque no se pudo capturar su permalink exacto (solo evidencia de búsqueda), pero confirman que este es un ejemplo real y verificable del patrón de amplificación entre ciudades que se buscó en esta pasada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Corpofomento Pijao - cuenta de reconstrucción',
      address: 'Pijao, Quindío',
      phone: null,
      needsText: 'Donaciones para la reconstrucción de Pijao vía Bancolombia, Cuenta de Ahorros No. 374334620-42, a nombre de Corpofomento Pijao, NIT 900781279-2.',
      sourceUrl: 'https://www.facebook.com/paangava/posts/pfbid04UYj8Fk3tg4Ri6YqjGjnVsXhNhCGqiieFCrrUa3ouvMxZh7RhFL8UJLxkytxqv49l',
      sourceOrg: 'Corpofomento Pijao',
      submitterNote:
        'Corpofomento Pijao es una organización local preexistente, documentada de forma independiente en una guía de desarrollo comunitario del SENA y en cobertura de La Crónica del Quindío sobre las Fiestas Aniversarias de Pijao (que cita a "Olga Narváez, de Corpofomento Pijao" - coincide con una de las cuatro administradoras nombradas en el volante: Mónica Vásquez Hincapié, Olga Narváez Trujillo, María Inés Mejía Llano y Angela Johana Camacho Alzate). Los mismos datos bancarios fueron publicados de forma independiente por la cuenta de Instagram monicavasquezhinca. Es un fondo de base local (no una campaña organizada desde otra ciudad), pero se incluye por ser un hallazgo genuinamente nuevo tras tres pasadas anteriores, y porque se está reenviando activamente hacia audiencias fuera de Pijao (una traducción al inglés circuló entre cuentas de la diáspora).',
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
      permalink: 'https://www.instagram.com/p/Db_uMVij-4A/',
      authorHandle: 'marianateranr',
      category: 'NEED' as const,
      placeName: 'Pijao (La Maizena, Cueva Loca) y Génova, Quindío',
      note: 'Abogada y creadora digital de sostenibilidad con 182K seguidores (sin vínculo declarado con Quindío) publicó, junto con la ONG Cumbres Blancas Colombia, un carrusel nacional "¿Cómo ayudar ante los incendios forestales en Colombia?" (Nariño, Tolima, Quindío, Antioquia). La lámina de Quindío nombra a Pijao específicamente y lista puntos de acopio concretos (Tráiler de Esto es Quindío; recinto gastronómico/antigua galería de Pijao), además de acreditar a un voluntario nombrado (@usmadavid_) que recoge y entrega las donaciones. 37.2K me gusta, 28.3K reenvíos - alto alcance real. En los comentarios, seguidores desde Bogotá y "desde Medellín" preguntan dónde donar y la autora los redirige a Cumbres Blancas Colombia, confirmando que el post funciona activamente como puente entre donantes de otras ciudades y las necesidades de Pijao.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8Q0a7DgPU/',
      authorHandle: 'rtvcnoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío (vereda La Maicena)',
      note: 'RTVC Noticias - el sistema de medios públicos nacional de Colombia (Bogotá, 439K seguidores, cuenta verificada) - publicó una nota dedicada: "la emergencia por un incendio forestal que inició... en la vereda La Maicena, en Pijao (Quindío), continúa avanzando con múltiples focos activos... en medio de las fallas de comunicación generadas tras el sismo." Es cobertura de medios NACIONALES (no solo regionales de Quindío) nombrando a Pijao específicamente - va más allá de los medios regionales ya catalogados en pasadas anteriores.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/reels/Db8O_hHsauh/',
      authorHandle: 'canaltrececo',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'Canal Trece, televisión pública nacional con sede en Bogotá (148K seguidores), publicó: "Habitantes de Pijao, Quindío, solicitan apoyo de los organismos de socorro y las autoridades ante un incendio que permanece activo..." - segundo medio de televisión pública nacional (distinto de RTVC) con cobertura específica de Pijao.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.youtube.com/shorts/YK43G8iSRMI',
      authorHandle: 'Pulzo (@PulzoCol)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'Pulzo, medio digital nacional con sede en Bogotá (no un medio regional de Quindío), publicó un short específico sobre el incendio de Pijao: "Incendio forestal avanza en Pijao, Quindío", con el texto en pantalla señalando que la comunidad pide "máxima difusión para visibilizar" la situación. Sin enlace de donación directo - funciona como amplificación/visibilización nacional, no como canal de ayuda estructurado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/valentina.gomez.182768/posts/pfbid0EM2Xne4eQa5vZ3MnVrLCqUoQgMSsJ2hBEYnJ2iDRp8DjVGLfrEVuD7NzMToAkVThl',
      authorHandle: 'Valentina Gomez',
      category: 'NEED' as const,
      placeName: 'Pijao, Quindío',
      note: 'Publicación original (12 de agosto) que dio origen al hashtag #SOSPijao: residente local etiqueta directamente a @BomberosColombia, @CruzRojaCol, @DefensaCivilColombiana, @PoliciaColombia, @EjercitoNacional, @UNGRD, @UDEGERDQuindio, @GobQuindio y @AlcaldiaPijao, denunciando que el apoyo aéreo (helicóptero/Bambi Bucket) prometido por la Fuerza Aeroespacial Colombiana nunca llegó a la hora acordada. Es la fuente primaria real del hallazgo ya contestado en la pasada 39 (apoyo aéreo "probablemente no llegó") - no lo resuelve de forma distinta, pero es el post de origen citado por la cobertura posterior de Quindío Noticias.',
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
