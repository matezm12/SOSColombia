/**
 * Backfills SocialPost.oembedHtml for Instagram posts by calling Meta's
 * official oEmbed endpoint (graph.facebook.com/instagram_oembed) once per
 * post and caching the raw JSON response. Instagram's anonymous embed.js
 * widget (what SocialEmbed.tsx used to rely on for a live render) throttles
 * hard under real traffic — repeated failures once a session trips it,
 * surfacing as "Refused to display '<URL>' in a frame because it set
 * 'X-Frame-Options' to deny" in the console. The oEmbed endpoint is a
 * different, supported code path and — as of Meta's June 2026 change — works
 * tokenless for public posts, no App Review or app registration needed.
 * Once cached, SocialEmbed renders a static thumbnail card from this data
 * instead of attempting a live embed for Instagram at all.
 *
 * Tokenless calls share ONE global rate-limit pool across every unauthenticated
 * caller on the internet — confirmed live: a batch of ~150 posts immediately hit
 * "(#4) Application request limit reached" (OAuthException code 4), not a
 * per-post content error. A registered Meta app gets its own private quota
 * (1,000 req/hour), so set INSTAGRAM_OEMBED_TOKEN in .env as `{app-id}|{client-token}`
 * — both are free from developers.facebook.com, no App Review needed for
 * oEmbed Read. Get them: Meta App Dashboard → Settings → Basic (App ID) and
 * → Settings → Advanced → Security (Client Token).
 *
 * Safe to re-run: only touches rows where oembedHtml is still null.
 * Run via `npx tsx prisma/backfill-oembed-instagram.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

const OEMBED_ENDPOINT = 'https://graph.facebook.com/v21.0/instagram_oembed'

async function main() {
  const posts = await prisma.socialPost.findMany({
    where: { platform: 'INSTAGRAM', oembedHtml: null },
    select: { id: true, permalink: true },
  })

  console.log(`${posts.length} Instagram post(s) missing a cached oEmbed snapshot.`)

  const token = process.env.INSTAGRAM_OEMBED_TOKEN
  if (!token) {
    console.warn('No INSTAGRAM_OEMBED_TOKEN set — falling back to the shared tokenless pool, which will likely hit "Application request limit reached" almost immediately. See the file header for how to get a free app-id|client-token.')
  }

  for (const post of posts) {
    const url = `${OEMBED_ENDPOINT}?url=${encodeURIComponent(post.permalink)}${token ? `&access_token=${encodeURIComponent(token)}` : ''}`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`  skip ${post.permalink}: HTTP ${res.status}`)
        continue
      }
      const data = await res.json()
      if (typeof data.thumbnail_url !== 'string') {
        console.warn(`  skip ${post.permalink}: no thumbnail_url in response (${JSON.stringify(data).slice(0, 200)})`)
        continue
      }
      await prisma.socialPost.update({
        where: { id: post.id },
        data: { oembedHtml: JSON.stringify(data) },
      })
      console.log(`  cached ${post.permalink}`)
    } catch (err) {
      console.warn(`  skip ${post.permalink}: ${err instanceof Error ? err.message : err}`)
    }
    // Stay well under the documented 1,000 req/hour tokenless ceiling and
    // avoid hammering the endpoint in a tight loop.
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
