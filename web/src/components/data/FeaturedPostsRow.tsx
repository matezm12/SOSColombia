import { FeaturedPostCard } from "./FeaturedPostCard";
import type { FeaturedPost } from "@/lib/featuredPosts";

// Full playable embeds are wide (Instagram/X/TikTok widgets all want real
// width to render well), so this stays capped at 2 columns — same grid
// CommunityFeed/CommunityPostCard already use — rather than stretching to
// 3-4 across. With up to FEATURED_POST_SLOTS (4) cards, that reads as two
// rows of two on desktop, one column on mobile.
//
// `items-start` matters here: each platform's embed has a fixed, content-
// driven height set by its own widget script (an Instagram photo vs. a
// longer thread render at different heights) — it can't stretch to fill
// extra space without distorting. CSS Grid's default `items-stretch` would
// force every card in a row to match its tallest sibling, leaving a dead
// blank gap under any shorter embed. `items-start` lets each card sit at
// its own natural height instead.
//
// Grid stays two columns regardless of post count — same pattern as
// CommunityFeed. A lone post sits in the first cell at its normal card
// width, not stretched to span the whole row.
export function FeaturedPostsRow({
  posts,
  locale,
}: {
  posts: FeaturedPost[];
  locale: string;
}) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-4 grid items-start gap-4 grid-cols-1 sm:grid-cols-2">
      {posts.map((post) => (
        <FeaturedPostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
