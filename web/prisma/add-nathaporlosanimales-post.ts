/**
 * One-off: adds a real Instagram post (@nathaporlosanimales, a veterinarian
 * coordinating post-earthquake animal-welfare help) to the community
 * moderation queue, per direct user request 2026-08-20 (pasted the real
 * embed code, permalink extracted from data-instgrm-permalink). Caption/
 * author confirmed live via yt-dlp against the real permalink. No specific
 * city mentioned in the caption, so municipioId left unset -- a moderator
 * can set it via /admin/comunidad if warranted.
 *
 * Run once via `npx tsx prisma/add-nathaporlosanimales-post.ts`, NOT part
 * of the repeatable prisma/seed.ts.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.pendingSocialPost.findFirst({
    where: { permalink: 'https://www.instagram.com/reel/DcPvfVCxJRI/' },
  })
  if (existing) {
    console.log('Already pending, skipping:', existing.id)
    return
  }

  const created = await prisma.pendingSocialPost.create({
    data: {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/reel/DcPvfVCxJRI/',
      authorHandle: 'nathaporlosanimales',
      category: 'HUMAN_INTEREST',
      submitterNote:
        'Del colapso de mi bandeja de mensajes de Instagram y WhatsApp, nació esta idea que @vengaleleo me ayudó a materializarla ❤️ (Dr. Nathalia Villada, veterinaria -- coordinación de ayuda animal post-terremoto)',
      origin: 'COMMUNITY',
    },
  })
  console.log('Created:', created.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
