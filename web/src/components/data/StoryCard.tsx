import type { Story } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";
import { localizedStory, resolveStoryImage } from "@/lib/stories";
import { formatDate } from "@/lib/format";

type StoryWithExtras = Story & {
  municipio?: { name: string } | null;
  campaign?: { platform: string; url: string } | null;
};

export async function StoryCard({
  story,
  locale,
  priority = false,
}: {
  story: StoryWithExtras;
  locale: string;
  // Above-the-fold cards (the first row of /historias) shouldn't carry
  // loading="lazy" — Lighthouse traced the site's worst LCP (3997ms on
  // /historias) to exactly this, since the browser had no reason to
  // prioritize a lazy-loaded image that was already on screen.
  priority?: boolean;
}) {
  const { title, lede } = localizedStory(story, locale);
  const image = await resolveStoryImage({
    coverImageUrl: story.coverImageUrl,
    campaign: story.campaign ?? null,
  });

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {image && (
        // Arbitrary externally-hosted cover images — same reasoning as
        // AlliedResourceCard's og-image handling, can't allowlist every domain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="aspect-[1200/630] w-full border-b border-zinc-200 object-cover dark:border-zinc-800"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        {story.municipio && (
          <span className="text-sm font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            {story.municipio.name}
          </span>
        )}
        <h3 className="mt-1 text-base font-medium">
          <Link href={`/historias/${story.slug}`} className="text-black hover:underline dark:text-zinc-50">
            {title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-zinc-700 dark:text-zinc-300">{lede}</p>
        <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-600">
          {story.authorName} · {formatDate(story.publishedAt ?? story.createdAt)}
        </p>
      </div>
    </Card>
  );
}
