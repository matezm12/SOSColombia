import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { GoFundMeEmbed } from "@/components/data/GoFundMeEmbed";
import { SocialEmbed } from "@/components/data/SocialEmbed";
import { ShareButton } from "@/components/ui/ShareButton";
import { isGoFundMeUrl } from "@/lib/gofundme";
import { localizedStory, storyHref } from "@/lib/stories";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

async function getStory(slug: string) {
  return prisma.story.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      municipio: { select: { name: true, divipolaCode: true } },
      campaign: { select: { title: true, orgOrPerson: true, url: true, platform: true } },
      socialPost: { select: { permalink: true, platform: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  const { title, lede } = localizedStory(story, locale);
  return { title, description: lede };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("historias");
  const story = await getStory(slug);
  if (!story) notFound();

  const { title, lede, body } = localizedStory(story, locale);
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell backHref="/historias" title={title} lede={lede}>
      <div className="relative -mt-2 py-1 pr-10">
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          {story.authorName} · {formatDate(story.publishedAt ?? story.createdAt)}
        </p>
        <ShareButton href={storyHref(slug, locale)} label={title} />
      </div>

      {story.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.coverImageUrl}
          alt={title}
          className="mt-6 aspect-[1200/630] w-full rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
        />
      )}

      <div className="mt-6 space-y-4 text-zinc-700 dark:text-zinc-300">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Real photo/progress-bar visuals straight from the source platform —
          GoFundMe's widget and Instagram/X/TikTok's own embeds already carry
          the actual image, so there's no separate image-extraction step. */}
      {story.campaign && (story.campaign.platform === "GOFUNDME" || isGoFundMeUrl(story.campaign.url)) && (
        <div className="mt-6">
          <GoFundMeEmbed url={story.campaign.url} size="large" />
        </div>
      )}
      {story.socialPost && (
        <div className="mt-6">
          <SocialEmbed platform={story.socialPost.platform} permalink={story.socialPost.permalink} />
        </div>
      )}

      {(story.campaign || story.municipio || story.socialPost) && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-medium text-black dark:text-zinc-50">{t("basadoEn")}</p>
          <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
            {story.campaign && (
              <li>
                {story.campaign.title} — {story.campaign.orgOrPerson} ·{" "}
                <ExternalLink href={story.campaign.url}>{t("verCampana")}</ExternalLink>
              </li>
            )}
            {story.socialPost && (
              <li>
                <ExternalLink href={story.socialPost.permalink}>{t("verPublicacion")}</ExternalLink>
              </li>
            )}
            {story.municipio && (
              <li>
                <Link href={`/ciudad/${story.municipio.divipolaCode}`} className="underline">
                  {story.municipio.name}
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </PageShell>
  );
}
