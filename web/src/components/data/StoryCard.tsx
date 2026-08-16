import type { Story } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Card } from "../ui/Card";
import { localizedStory } from "@/lib/stories";
import { formatDate } from "@/lib/format";

type StoryWithMunicipio = Story & { municipio?: { name: string } | null };

export function StoryCard({ story, locale }: { story: StoryWithMunicipio; locale: string }) {
  const { title, lede } = localizedStory(story, locale);

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {story.coverImageUrl && (
        // Arbitrary externally-hosted cover images — same reasoning as
        // AlliedResourceCard's og-image handling, can't allowlist every domain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.coverImageUrl}
          alt={title}
          className="aspect-[1200/630] w-full border-b border-zinc-200 object-cover dark:border-zinc-800"
          loading="lazy"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        {story.municipio && (
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            {story.municipio.name}
          </span>
        )}
        <Link
          href={`/historias/${story.slug}`}
          className="mt-1 font-medium text-black hover:underline dark:text-zinc-50"
        >
          {title}
        </Link>
        <p className="mt-2 flex-1 text-sm text-zinc-700 dark:text-zinc-300">{lede}</p>
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600">
          {story.authorName} · {formatDate(story.publishedAt ?? story.createdAt)}
        </p>
      </div>
    </Card>
  );
}
