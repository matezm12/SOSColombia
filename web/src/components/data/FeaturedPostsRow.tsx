import { FeaturedPostCard } from "./FeaturedPostCard";
import type { FeaturedPost } from "@/lib/featuredPosts";

// Full playable embeds are wide (Instagram/X/TikTok widgets all want real
// width to render well), so this stays capped at 2 columns — same grid
// CommunityFeed/CommunityPostCard already use — rather than stretching to
// 3-4 across. With up to FEATURED_POST_SLOTS (4) cards, that reads as two
// rows of two on desktop, one column on mobile.
export function FeaturedPostsRow({
  posts,
  locale,
}: {
  posts: FeaturedPost[];
  locale: string;
}) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <FeaturedPostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}
