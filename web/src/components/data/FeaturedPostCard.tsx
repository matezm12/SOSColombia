import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ExternalLinkIcon } from "../ui/icons";
import { SOCIAL_PLATFORM_LABEL, SOCIAL_PLATFORM_TILE_CLASS, socialCategoryLabel } from "@/lib/labels";
import type { FeaturedPost } from "@/lib/featuredPosts";

// No live oEmbed here on purpose — this card is a plain server component
// (no client JS, no third-party embed script) so it's safe to render above
// the fold on the city page. The full embed lives in CommunityPostCard,
// further down the vereda page's chronological "Comunidad" feed.
export function FeaturedPostCard({
  post,
  locale,
  verPublicacionLabel,
}: {
  post: FeaturedPost;
  locale: string;
  verPublicacionLabel: string;
}) {
  const platformLabel = SOCIAL_PLATFORM_LABEL[post.platform] ?? post.platform;
  const tileClass = SOCIAL_PLATFORM_TILE_CLASS[post.platform] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      <Card id={post.id} className="flex h-full flex-col overflow-hidden p-0">
        <div className={`flex aspect-[4/3] w-full items-center justify-center ${tileClass}`}>
          <span className="text-sm font-semibold">{platformLabel}</span>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <Badge variant="neutral">{socialCategoryLabel(post.category, locale)}</Badge>
          {post.authorHandle && (
            <span className="mt-1.5 truncate text-xs text-zinc-500 dark:text-zinc-500">
              {post.authorHandle}
            </span>
          )}
          {post.featuredNote && (
            <p className="mt-1.5 line-clamp-3 text-sm text-zinc-700 dark:text-zinc-300">
              {post.featuredNote}
            </p>
          )}
          {post.municipio && (
            <span className="mt-1 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
              {post.municipio.name}
            </span>
          )}
          <span className="mt-auto flex items-center gap-1 pt-2 text-xs text-blue-600 dark:text-blue-400">
            {verPublicacionLabel}
            <ExternalLinkIcon />
          </span>
        </div>
      </Card>
    </a>
  );
}
