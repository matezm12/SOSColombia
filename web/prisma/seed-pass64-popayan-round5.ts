/**
 * Pass 64 (2026-08-15) — round 5 continues, Popayán. Five prior passes
 * (9, 11, 20, 29, 41, 51) already covered this MODERADA-severity city —
 * historically the thinnest of the tracked cities — and this round
 * confirms it: EVERY SINGLE aid-point candidate the five agents surfaced
 * traced back to something already on file. Casa de la Moneda (seeded
 * pass 20, updated pass 29 and pass 41 — this round's "closing today,
 * Aug 15" detail is the same fact pass 41 already recorded), the Hogar
 * San Vicente de Paúl elder-care home (pass 20/29/51), the Hospital San
 * José blood-donation drive (pass 20, down to the identical Instagram
 * permalink), the Alcaldía Secretaría General collection point (pass 41
 * explicitly named it as new back then), and the Arquidiócesis/Cámara de
 * Comercio food bank (pass 51, same two-location structure) are all
 * duplicates. None re-seeded. Crowdfunding remains a confirmed absence
 * for a fifth consecutive round — no Popayán-specific GoFundMe or Vaki
 * campaign has ever existed.
 *
 * What's genuinely new this round is two community-embed updates: a
 * completed radio-led donation drive (15 tons dispatched to northern
 * Valle del Cauca) and the resolution — deceased, not missing — of a
 * Popayán native's case that had been open since the earthquake.
 *
 * Popayán city itself continues to report zero confirmed deaths or
 * injuries from the earthquake, unchanged across all five rounds.
 * See wiki/17-allied-resources-and-community.md "Pass 64" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass64-popayan-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '19001' } })

  const socialPosts = [
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/caucanoticias/posts/pfbid02J2y9ESgyemUxnA6HWWJUxFMBhUegURwYncq5M1186FEBaEgtEnFagdkvYTAWq1LZl',
      authorHandle: 'Cauca Noticias Radio y TV',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán',
      note: '"Gracias Popayán: 15 toneladas de ayudas fueron recolectadas por los oyentes de Tropicana, Bésame y Caracol Radio" — oyentes de tres emisoras de PRISA Media en Popayán recolectaron alimentos no perecederos, cobijas, ropa y colchonetas; 15 toneladas ya despachadas hacia comunidades afectadas del norte del Valle del Cauca. Colecta ya concluida y despachada — informativo, no es un canal activo para nuevos donantes.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4Ro0YE2gS/',
      authorHandle: 'unbuenpolombiano',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán / Pereira',
      note: 'Pablo Rivera Avirama, oriundo de Popayán, había sido reportado desaparecido tras el terremoto mientras estaba en el aeropuerto Matecaña de Pereira. Familiares y amigos mantuvieron la esperanza hasta que se confirmó su muerte; su funeral se realizó unos 2 días antes de esta pasada. Caso ahora RESUELTO (fallecido, no desaparecido) — representa una víctima con vínculo a Popayán no reflejada en el balance local de la ciudad, que sigue en cero muertos/heridos.',
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
