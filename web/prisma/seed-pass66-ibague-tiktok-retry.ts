/**
 * Pass 66 (2026-08-15) — completes Ibagué's first deep research pass by
 * filling the TikTok gap that hit a session capacity limit in pass 60.
 * Confirms the pass-60 finding still stands: no dedicated albergue for
 * Ibagué's own displaced residents exists, and no Ibagué-targeted scam
 * or missing-persons case was found. Genuinely new: an active, urgent
 * in-city wildfire need (barrio Picaleña, distinct from the already-
 * documented San Luis mutual-aid deployment), a rural vereda not
 * surfaced in pass 60 (Charco Rico Alto), and a reconstruction-safety
 * story — new building permits reportedly being evaluated under lower
 * seismic-hazard standards than a technical study recommends.
 * See wiki/17-allied-resources-and-community.md "Pass 66" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass66-ibague-tiktok-retry.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ibague = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '73001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Universidad del Tolima — punto de acopio (sin confirmar oficialmente)',
      address: 'Universidad del Tolima, Ibagué (edificio exacto no especificado)',
      phone: null,
      needsText: 'Un residente muestra en video la entrega personal de donaciones en un punto de acopio dentro del campus, nombrándolo como uno de varios puntos activos en la ciudad.',
      sourceUrl: 'https://www.tiktok.com/@sarahdsanchez0908/video/7673286851112815892',
      sourceOrg: null,
      submitterNote: 'Cuenta personal (no institucional), 350 likes, 15 comentarios, con etiqueta de ubicación Ibagué. La institución nombrada es real y verificable, pero no hay confirmación de un canal oficial de la universidad — se recomienda verificar directamente antes de aprobar como punto principal.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: ibague.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: ibague.id,
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
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@angelestelevision/video/7673267515493076244',
      authorHandle: '@angelestelevision',
      category: 'NEED' as const,
      placeName: 'Barrio Picaleña, Ibagué',
      note: 'Necesidad urgente EN LA PROPIA CIUDAD, distinta del despliegue de apoyo mutuo hacia San Luis ya documentado: video con humo visible mostrando un incendio activo en el barrio Picaleña de Ibagué, con llamado urgente en pantalla pidiendo apoyo de bomberos.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@mesainformativa/video/7672967480964336914',
      authorHandle: '@mesainformativa',
      category: 'OFFICIAL' as const,
      placeName: 'San Luis, Tolima (bomberos de Ibagué desplegados)',
      note: 'Bomberos voluntarios de Ibagué respondieron al llamado del municipio vecino San Luis para apoyar la extinción de incendios forestales en el corregimiento Payandé y la vereda La Flor.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@capitalmusical/video/7673715329587055879',
      authorHandle: '@capitalmusical',
      category: 'OFFICIAL' as const,
      placeName: 'Ibagué',
      note: 'Ibagué mantiene activa la atención de incendios forestales y el apoyo a municipios afectados; las autoridades piden evitar quemas y reportar cualquier emergencia. Línea de denuncias y reportes: 320 240 0704, además de Bomberos 119 y Policía 123.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@ecosdelcombeima790am/video/7673664031986568468',
      authorHandle: '@ecosdelcombeima790am',
      category: 'NEED' as const,
      placeName: 'Vereda Charco Rico Alto, Ibagué',
      note: 'Ubicación rural nueva, no encontrada en la pasada 60: familias de la vereda Charco Rico Alto necesitan atención tras daños graves por el terremoto; video muestra una vivienda rural de madera colapsada/dañada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@el_olfato/video/7672836941942918408',
      authorHandle: '@el_olfato',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'El Vergel / Boquerón, Ibagué',
      note: 'Respuesta a dos velocidades: la alcaldesa Johana Aranda inspecciona un edificio afectado en El Vergel, mientras una familia en Boquerón sigue esperando una intervención urgente para su vivienda gravemente dañada.',
    },
    {
      platform: 'TIKTOK' as const,
      authorHandle: '@el_olfato',
      permalink: 'https://www.tiktok.com/@el_olfato/video/7672824765018541319',
      category: 'OFFICIAL' as const,
      placeName: 'Ibagué',
      note: 'Desarrollo relevante para la fase de reconstrucción: nuevos permisos de construcción en Ibagué se están evaluando bajo parámetros de amenaza sísmica media, pese a que un estudio técnico recomienda condiciones de amenaza alta, entre otros factores por la Falla de Ibagué.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@el_olfato/video/7673940865227771157',
      authorHandle: '@el_olfato',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio Grisales de Quimbaya, Ibagué',
      note: 'Entre viviendas destruidas y pertenencias expuestas, empieza a surgir solidaridad en el barrio Grisales de Quimbaya, uno de los sectores más golpeados por el terremoto en Ibagué.',
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
        municipioId: ibague.id,
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
