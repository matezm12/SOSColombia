import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ShareButton } from "../ui/ShareButton";
import { SocialEmbed } from "./SocialEmbed";
import { SOCIAL_PLATFORM_LABEL, socialCategoryLabel } from "@/lib/labels";
import type { FeaturedPost } from "@/lib/featuredPosts";

// Same live, playable embed as CommunityPostCard (real oEmbed-style widget,
// not a static link tile) — the whole point of a highlighted post is that
// you can watch/read it right there. The only addition over
// CommunityPostCard is the curated featuredNote line.
export function FeaturedPostCard({
  post,
  locale,
}: {
  post: FeaturedPost;
  locale: string;
}) {
  const label = `${socialCategoryLabel(post.category, locale)} — ${SOCIAL_PLATFORM_LABEL[post.platform] ?? post.platform}`;

  return (
    <Card id={post.id} className="relative">
      <ShareButton anchorId={post.id} label={label} />
      <div className="flex items-center justify-between gap-2 pr-8">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {SOCIAL_PLATFORM_LABEL[post.platform] ?? post.platform}
          {post.authorHandle && <span className="text-zinc-400 dark:text-zinc-600"> · {post.authorHandle}</span>}
        </span>
        <Badge variant="neutral">{socialCategoryLabel(post.category, locale)}</Badge>
      </div>

      {post.municipio && (
        <Link
          href={`/ciudad/${post.municipio.divipolaCode}`}
          className="mt-1 inline-block text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
        >
          {post.municipio.name}
        </Link>
      )}

      {post.featuredNote && (
        <p className="mt-2 line-clamp-3 text-sm italic text-zinc-600 dark:text-zinc-400">
          &ldquo;{post.featuredNote}&rdquo;
        </p>
      )}

      <div className="mt-3">
        <SocialEmbed platform={post.platform} permalink={post.permalink} locale={locale} />
      </div>
    </Card>
  );
}
