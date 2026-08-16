import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Badge } from "@/components/ui/Badge";
import { GoFundMeEmbed } from "@/components/data/GoFundMeEmbed";
import { SocialEmbed } from "@/components/data/SocialEmbed";
import { ShareButton } from "@/components/ui/ShareButton";
import { isGoFundMeUrl } from "@/lib/gofundme";
import { VERIFICATION_LABEL } from "@/lib/labels";
import { localizedStory, storyHref } from "@/lib/stories";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

// Same custom domain as the root layout's SITE_URL — kept local since JSON-LD
// and absolute OG/canonical URLs are the only things on this page needing
// one (same pattern as [locale]/page.tsx and ciudad/[divipola]/page.tsx).
const SITE_URL = "https://www.soscolombia.xyz";

async function getStory(slug: string) {
  return prisma.story.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      municipio: { select: { name: true, divipolaCode: true } },
      campaign: {
        select: { title: true, orgOrPerson: true, url: true, platform: true, verificationStatus: true },
      },
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

  const url = `${SITE_URL}${storyHref(slug, locale)}`;
  const image = story.coverImageUrl ?? `${SITE_URL}/opengraph-image`;
  const keywords = [
    "terremoto Colombia 2026",
    story.municipio?.name,
    story.campaign?.title,
  ].filter((k): k is string => Boolean(k));

  return {
    title,
    description: lede,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${SITE_URL}${storyHref(slug, "es")}`,
        en: `${SITE_URL}${storyHref(slug, "en")}`,
      },
    },
    openGraph: {
      title,
      description: lede,
      url,
      type: "article",
      publishedTime: (story.publishedAt ?? story.createdAt).toISOString(),
      modifiedTime: story.updatedAt.toISOString(),
      authors: [story.authorName],
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: lede,
      images: [image],
    },
  };
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
  const pageUrl = `${SITE_URL}${storyHref(slug, locale)}`;
  const publishedAt = (story.publishedAt ?? story.createdAt).toISOString();

  // schema.org/Article — grounded only in real fetched fields, same
  // discipline as the Organization/Dataset/City schemas elsewhere on the
  // site. `about` names the city when the story is tied to one; it doesn't
  // try to model the linked campaign as structured data (no schema.org
  // type fits a crowdfunding campaign cleanly) — that stays as the visible
  // "Basado en" citation instead.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: lede,
    image: [story.coverImageUrl ?? `${SITE_URL}/opengraph-image`],
    datePublished: publishedAt,
    dateModified: story.updatedAt.toISOString(),
    inLanguage: locale === "en" ? "en-US" : "es-CO",
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    author: { "@type": "Organization", name: story.authorName },
    publisher: {
      "@type": "Organization",
      name: "SOSColombia",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image` },
    },
    ...(story.municipio ? { about: { "@type": "Place", name: story.municipio.name } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
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
        <div className="mt-6 max-w-sm">
          <GoFundMeEmbed url={story.campaign.url} />
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
              <li className="flex flex-wrap items-center gap-1.5">
                <span>
                  {story.campaign.title} — {story.campaign.orgOrPerson} ·{" "}
                  <ExternalLink href={story.campaign.url}>{t("verCampana")}</ExternalLink>
                </span>
                <Badge variant="verification" value={story.campaign.verificationStatus}>
                  {VERIFICATION_LABEL[story.campaign.verificationStatus] ?? story.campaign.verificationStatus}
                </Badge>
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
    </>
  );
}
