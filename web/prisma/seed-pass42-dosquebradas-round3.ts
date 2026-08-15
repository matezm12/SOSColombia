/**
 * Pass 42 (2026-08-15) — third research pass on Dosquebradas, run within
 * ~24h of the pass-30 follow-up. Every candidate again cross-checked
 * against Pereira's aid points per the standing user instruction. The
 * shelter network expanded (two new sites), a field hospital appeared at
 * the coliseum, and the Alcaldía's own damage-report form turned out to
 * be broken per its own comment thread — a second stale-system finding
 * alongside the already-known broken blood-donation point. See
 * wiki/17-allied-resources-and-community.md "Pass 42" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass42-dosquebradas-round3.ts`.
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
      kind: 'ALBERGUE' as const,
      name: 'Albergue Minuto de Dios',
      address: 'Cancha del barrio Minuto de Dios (sector La Graciela), Dosquebradas',
      phone: null,
      needsText: 'Nuevo albergue municipal de emergencia, capacidad para 150 personas. Anunciado por el alcalde Roberto Jiménez Naranjo y confirmado por la Personería de Dosquebradas.',
      sourceUrl: 'https://www.instagram.com/reel/DcACePcqf-L/',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote:
        'Sin solapamiento con Pereira: albergue municipal propio de Dosquebradas, distinto de todos los ya sembrados (Campestre B en Dosquebradas; Ecoparque El Vergel, Estadio Mora Mora, Parque del Oso, Piscinas Olímpicas, Plaza de Ferias en Pereira). Corroborado independientemente por la cuenta oficial de la Alcaldía, la Personería de Dosquebradas y varios medios locales, todos con la misma capacidad (150) y ubicación.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Las Violetas (Barrio La Graciela / vía Frailes)',
      address: 'Vía Frailes / sector La Graciela, Dosquebradas',
      phone: null,
      needsText: 'Cuarto albergue de la red municipal, habilitado como desborde tras alcanzar capacidad los albergues principales (~900 personas en los primeros tres). Aún tiene cupos disponibles, priorizando familias con menores.',
      sourceUrl: 'https://www.instagram.com/reel/DcBnAMXx55y/',
      sourceOrg: 'Alcaldía de Dosquebradas / Personería de Dosquebradas',
      submitterNote:
        'Sin solapamiento con Pereira. PRECAUCIÓN sobre la capacidad: las fuentes dan cifras distintas (150 según un reporte, 300 según otro) - ambas se documentan aquí sin resolver a un solo número. También existe cierta ambigüedad sobre si "vía Frailes" y "Barrio La Graciela" se refieren exactamente al mismo sitio o a ubicaciones cercanas relacionadas - la pasada 30 ya había anticipado un "cuarto albergue en La Graciela"; este parece ser ese mismo sitio, ahora confirmado activo y con nombre ("Las Violetas").',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Hospital de Campaña - Coliseo de Dosquebradas',
      address: 'Coliseo Municipal de Dosquebradas',
      phone: null,
      needsText: 'Hospital móvil/de campaña instalado en el coliseo, con atención médica general y una jornada gratuita de ecografía obstétrica (sábado 15 de agosto, 8am-12pm) para mujeres embarazadas afectadas por el terremoto. Organizado por la Dra. Salome Hinojosa (ginecóloga/obstetra), con apoyo de Fundación CardioClinic y el Hospital Santa Mónica. El mismo recinto también recibe donaciones generales apiladas para damnificados.',
      sourceUrl: 'https://www.instagram.com/p/DcAPfLrgC9r/',
      sourceOrg: 'Fundación CardioClinic + Hospital Santa Mónica',
      submitterNote:
        'Sin solapamiento con Pereira: instalación propia de Dosquebradas en su coliseo municipal. Corroborado por una segunda publicación independiente y por un comentario de alguien que visitó el lugar en persona ("estuvimos allá y están listos para atender"). Algunos comentarios preguntan por qué es difícil para personas de Pereira llegar hasta allí - problema de acceso/logística, no cambia que el punto en sí es propio de Dosquebradas.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'SINALTRAINAL Dosquebradas - Centro de Acopio (sede sindical)',
      address: 'Calle 33 #14-46, Barrio Guadalupe, Dosquebradas (frente a CHEC de Dosquebradas)',
      phone: null,
      needsText: 'La sede del sindicato SINALTRAINAL (seccional Dosquebradas) fue convertida en punto de recolección de donaciones: alimentos, elementos de aseo, cobijas, colchonetas.',
      sourceUrl: 'https://www.facebook.com/reel/1933065467382236',
      sourceOrg: 'SINALTRAINAL Dosquebradas',
      submitterNote: 'Sin solapamiento con Pereira: sede propia del sindicato en Dosquebradas, dirección distinta de cualquier punto ya sembrado. Publicado hace apenas 2 horas por la cuenta institucional del sindicato.',
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
      permalink: 'https://www.instagram.com/alcaldia_dosquebradas/p/DcBdZAWFpmc/',
      authorHandle: 'alcaldia_dosquebradas',
      category: 'NEED' as const,
      placeName: 'Dosquebradas',
      note: 'El propio carrusel informativo de la Alcaldía revela en sus comentarios dos problemas: (1) el formulario/código QR oficial para reportar daños está ROTO - al menos 4 comentaristas independientes (entre 8 y 17 horas antes de esta revisión) dicen "el código QR no funciona" / "el formulario está cerrado" (segunda falla de sistema documentada, tras el punto de sangre ya reportado como roto en la pasada 30); (2) tres edificios reportados como estructuralmente inseguros en el sector Santa Mónica: Edificio SALYFE (Cra 19 #18-129), Edificio Monserrate (Cra 21A #15-20), y Hotel Veneton (sin dirección dada, 3 días sin energía, familias desplazadas esperando ver si colapsa) - residentes dicen que la Alcaldía no ha respondido.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8qfE5xs3A/',
      authorHandle: 'hemocentrodelotun',
      category: 'NEED' as const,
      placeName: 'Hospital Santa Mónica, Dosquebradas',
      note: 'ACTUALIZACIÓN DE ESTADO: el punto de donación de sangre en el Hospital Santa Mónica, marcado como posiblemente roto en la pasada 30, SIGUE SIN RESOLVERSE según comentarios de hace 1 día: "En el hospital Santa Monica no están recibiendo donaciones de sangre", "¿Aún se puede ir a donar?" sin respuesta confirmando que sí.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCSyqFoGSs/',
      authorHandle: 'dhdiariodelhuila',
      category: 'NEED' as const,
      placeName: 'Barrio La Graciela, Dosquebradas',
      note: 'Una manzana completa del barrio La Graciela fue ordenada demoler por daño estructural; se piden donaciones de ropa/zapatos infantiles, artículos de bebé, alimentos no perecederos y agua para las familias desplazadas. El único contacto dado (3144341302) corresponde a Neiva, sede del medio que reporta - no es un punto de donación local confirmado.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/alex_reina/status/2088383093388284185',
      authorHandle: '@alex_reina',
      category: 'NEED' as const,
      placeName: 'pereiravive.com',
      note: 'SOLAPAMIENTO EXPLÍCITO CON PEREIRA: plataforma comunitaria gratuita (pereiravive.com) que lista arriendos disponibles para familias de Pereira Y Dosquebradas que perdieron su vivienda en el terremoto. Recurso compartido entre ambas ciudades, no exclusivo de ninguna.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7674007831858679048',
      authorHandle: '@noticiasunoa',
      category: 'OFFICIAL' as const,
      placeName: 'Albergue Campestre B, Dosquebradas',
      note: 'Cifra actualizada: aproximadamente 120 personas de 36 familias, en unas 47 carpas, en el albergue Campestre B (ya sembrado). Coordinadores enfatizan que la emergencia no ha terminado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7673602827880533255',
      authorHandle: '@noticiasunoa',
      category: 'NEED' as const,
      placeName: 'Conjunto Portal del Parque, Dosquebradas',
      note: 'Decenas de familias del conjunto Portal del Parque siguen sin definición: la Torre 6 sufrió colapso total, las Torres 3, 4 y 5 presentan daño estructural grave. Residentes esperan autorización para reingresar brevemente y recuperar pertenencias.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/pereirahoynoticias/posts/pfbid0ecRBzRLGJbYzMDM9voX3ifBftD8EKLMo1oJNn88HbZPhGw279ECQAYC1KY9Eb446l',
      authorHandle: 'Pereira Hoy',
      category: 'OFFICIAL' as const,
      placeName: 'Sector Santa Mónica, Dosquebradas',
      note: 'Inició la demolición controlada de un edificio de cuatro pisos en el sector Santa Mónica de Dosquebradas por riesgo estructural derivado del sismo - publicado apenas 1 hora antes de esta revisión.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@fer_muelitas/video/7673552341009698068',
      authorHandle: '@fer_muelitas',
      category: 'NEED' as const,
      placeName: 'Pereira y Dosquebradas',
      note: 'PRECAUCIÓN - baja confianza: denuncia ciudadana alegando que en Pereira y Dosquebradas no están dejando entregar ayudas y están inmovilizando vehículos de donación. Sin corroboración institucional ni ubicación/autoridad específica nombrada - se documenta como dinámica a revisar, no como hecho confirmado.',
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
