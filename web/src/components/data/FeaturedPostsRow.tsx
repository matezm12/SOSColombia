import { FeaturedPostCard } from "./FeaturedPostCard";
import type { FeaturedPost } from "@/lib/featuredPosts";

// Column count keyed by post count, not a flat responsive class — with only
// 2-3 slots filled (common: not every city has 4 posts to draw from), a
// hardcoded lg:grid-cols-4 leaves a dead gap next to the last card.
const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1 sm:grid-cols-2",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function FeaturedPostsRow({
  posts,
  locale,
  verPublicacionLabel,
}: {
  posts: FeaturedPost[];
  locale: string;
  verPublicacionLabel: string;
}) {
  if (posts.length === 0) return null;

  const gridClass = GRID_CLASS[posts.length] ?? GRID_CLASS[4];

  return (
    <div className={`mt-4 grid items-start gap-3 ${gridClass}`}>
      {posts.map((post) => (
        <FeaturedPostCard
          key={post.id}
          post={post}
          locale={locale}
          verPublicacionLabel={verPublicacionLabel}
        />
      ))}
    </div>
  );
}
