/**
 * One-off: approves the @nathaporlosanimales community post (staged earlier
 * this session by prisma/add-nathaporlosanimales-post.ts) directly against
 * the DB, mirroring admin/comunidad/actions.ts's approveCommunityPost — done
 * here instead of through the admin UI since this is a scripted continuation
 * of the same session's work, per explicit user request 2026-08-20.
 *
 * Run once via `npx tsx prisma/approve-nathaporlosanimales-post.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PENDING_ID = 'cmt122yg90000w87k0x31b3b5'

async function main() {
  const pending = await prisma.pendingSocialPost.findUnique({ where: { id: PENDING_ID } })
  if (!pending || pending.status !== 'PENDING') {
    console.log('Not found or already reviewed:', pending?.status)
    return
  }

  const post = await prisma.socialPost.create({
    data: {
      platform: pending.platform,
      permalink: pending.permalink,
      authorHandle: pending.authorHandle,
      municipioId: pending.municipioId,
      category: pending.category,
    },
  })

  await prisma.pendingSocialPost.update({
    where: { id: PENDING_ID },
    data: { status: 'APPROVED', reviewedAt: new Date(), promotedSocialPostId: post.id },
  })

  console.log('Approved. SocialPost created:', post.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
