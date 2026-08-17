import { prisma } from "./prisma";
import type { Prisma, SocialPostCategory } from "@prisma/client";

export const FEATURED_POST_INCLUDE = {
  municipio: { select: { name: true, divipolaCode: true } },
} satisfies Prisma.SocialPostInclude;

export type FeaturedPost = Prisma.SocialPostGetPayload<{ include: typeof FEATURED_POST_INCLUDE }>;

/** 4 slots = one full desktop row; fewer is fine, the grid narrows to fit
 *  (see FeaturedPostsRow) rather than leaving a dead column. */
export const FEATURED_POST_SLOTS = 4;

// Deliberately actionable-first: an aid point or a live need outranks a
// human-interest post when only 2-3 slots end up algorithmically filled.
const CATEGORY_ORDER: SocialPostCategory[] = ["AID_POINT", "NEED", "HUMAN_INTEREST", "OFFICIAL"];

/**
 * Manually-featured posts (newest first) fill the row first. If that's not
 * enough to reach `slots`, the rest are picked by round-robin across
 * SocialPostCategory — newest post per category, cycling through categories
 * — rather than plain recency, so one busy category can't crowd out the
 * others. Pure and sync so it can run on data already fetched (vereda page)
 * without a second DB round trip.
 */
export function pickFeaturedPosts<
  T extends { featured: boolean; category: SocialPostCategory; capturedAt: Date },
>(posts: T[], slots: number = FEATURED_POST_SLOTS): T[] {
  const manual = posts
    .filter((p) => p.featured)
    .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());

  if (manual.length >= slots) return manual.slice(0, slots);

  const chosen = new Set<T>(manual);
  const queues = new Map<SocialPostCategory, T[]>(
    CATEGORY_ORDER.map((category) => [
      category,
      posts
        .filter((p) => !chosen.has(p) && p.category === category)
        .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime()),
    ]),
  );

  const fill: T[] = [];
  let remaining = true;
  while (fill.length + manual.length < slots && remaining) {
    remaining = false;
    for (const category of CATEGORY_ORDER) {
      if (fill.length + manual.length >= slots) break;
      const next = queues.get(category)?.shift();
      if (next) {
        fill.push(next);
        remaining = true;
      }
    }
  }

  return [...manual, ...fill];
}

/**
 * Fetches candidate posts for a city by divipolaCode (not municipioId) so
 * callers can run this inside the same Promise.all as a municipio lookup —
 * no sequential round trip. `orderBy featured desc` first guarantees every
 * manually-featured post falls inside the `take` window, so a hand-curated
 * older post can never be truncated away by newer algorithmic noise.
 */
export async function featuredPostsForCity(
  divipolaCode: string,
  slots: number = FEATURED_POST_SLOTS,
): Promise<FeaturedPost[]> {
  const posts = await prisma.socialPost.findMany({
    where: { municipio: { divipolaCode } },
    include: FEATURED_POST_INCLUDE,
    orderBy: [{ featured: "desc" }, { capturedAt: "desc" }],
    take: 40,
  });
  return pickFeaturedPosts(posts, slots);
}
