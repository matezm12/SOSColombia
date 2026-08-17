/**
 * Pass 83 (2026-08-17) — a single new Ibagué aid point/social post, per an
 * explicit user submission (a resource shared with them directly). Both
 * rows go into the pending moderation queue (status PENDING), same as
 * every other seed-pass finding — the user explicitly wants to review and
 * approve it via /admin/comunidad rather than have it auto-publish.
 *
 * INTECS (Instituto Nacional de Técnicas), a technical institute with
 * campuses in Ibagué and Honda (Tolima), organized a student/staff-run
 * acopio collecting supplies for people AND animals affected by the
 * wildfires burning in the Tolima veredas/municipios of Valle de San Juan,
 * San Luis, Coello, and Payandé — all four are separate Tolima localities
 * near Ibagué, not districts of the city itself; the physical collection
 * point is at INTECS's own campus. Confirmed via the institute's own
 * Instagram bio that its "sede principal" (the post's stated location) is
 * the Ibagué campus, not the smaller Honda one.
 *
 * Caution worth carrying into moderation: Instagram itself labels the
 * source post "AI content" (its own transparency label, likely for an
 * AI-touched caption or graphic) — noted here for the reviewer's
 * awareness, not treated as evidence the underlying institute or drive
 * isn't real (INTECS itself is a real, findable technical institute with
 * two physical campuses and a live enrollment presence).
 * Run once via `npx tsx prisma/seed-pass83-ibague-intecs.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ibague = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '73001' } })

  const aidPointName = 'INTECS — Centro de acopio para veredas afectadas por incendios (Valle de San Juan, San Luis, Coello, Payandé)'
  const existingAid = await prisma.pendingAidPoint.findFirst({ where: { name: aidPointName, municipioId: ibague.id } })
  if (!existingAid) {
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: ibague.id,
        kind: 'ACOPIO',
        name: aidPointName,
        address: 'Recepción INTECS, sede principal (Ibagué) — dirección exacta no indicada en el post; confirmar con el instituto antes de publicar',
        phone: '313 873 9902',
        needsText: 'Para personas: alimentos no perecederos, agua embotellada, elementos de aseo, ropa, cobijas, pañales y toallas húmedas. Para animales: medicamentos (cefalexina, meloxicam, cloroxidina), desparasitantes, vitaminas y alimento para mascotas. Fechas de recolección: 18 y 19 de agosto.',
        sourceUrl: 'https://www.instagram.com/p/Db_o6UrlY4s/',
        sourceOrg: 'INTECS — Instituto Nacional de Técnicas (estudiantes, docentes y equipo)',
        submitterNote: 'Compartido directamente por el usuario. Instituto real y verificable (cuenta oficial @intecsco, sedes confirmadas en Ibagué y Honda, matrículas activas) — la dirección exacta de la sede de Ibagué no aparece en el post ni en la bio, solo el teléfono; confirmar antes de aprobar. Instagram etiqueta el post como "AI content" (su propia etiqueta de transparencia) — anotado para el revisor, no es evidencia de que el instituto o la colecta sean falsos.',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingAidPoint: INTECS')
  } else {
    console.log('PendingAidPoint already exists — no changes made')
  }

  const permalink = 'https://www.instagram.com/p/Db_o6UrlY4s/'
  const existingPost = await prisma.pendingSocialPost.findFirst({ where: { permalink } })
  if (!existingPost) {
    await prisma.pendingSocialPost.create({
      data: {
        platform: 'INSTAGRAM',
        permalink,
        authorHandle: 'intecsco',
        category: 'AID_POINT',
        municipioId: ibague.id,
        placeName: 'Ibagué',
        submitterNote: '"INTECS se moviliza por el Tolima" — centro de acopio de estudiantes/docentes/equipo INTECS para familias y animales afectados por incendios forestales en veredas del Tolima. Compartido directamente por el usuario.',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingSocialPost: INTECS Instagram post')
  } else {
    console.log('PendingSocialPost already exists — no changes made')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
