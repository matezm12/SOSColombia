import type { Story } from "@prisma/client";
import { routing } from "@/i18n/routing";
import { fetchOgImage } from "@/lib/ogImage";

/** Picks the title/lede/body for the active locale — story content is
 * bilingual at the DB level (titleEs/titleEn etc.), not via next-intl
 * message files, since it's per-row authored content, not static UI copy. */
export function localizedStory(story: Story, locale: string) {
  const en = locale === "en";
  return {
    title: en ? story.titleEn : story.titleEs,
    lede: en ? story.ledeEn : story.ledeEs,
    body: en ? story.bodyEn : story.bodyEs,
  };
}

/** Locale-prefixed absolute path to a story's own page — for building a raw
 * shareable URL string (ShareButton) rather than a next-intl <Link>, which
 * handles this prefixing automatically for actual navigation but not here. */
export function storyHref(slug: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}/historias/${slug}`;
}

export type StoryImage = {
  url: string;
  // Non-null only when the image was pulled from a linked campaign's page
  // rather than set directly by an admin. Ethical-imagery review flagged
  // that these scraped images previously carried zero attribution in the
  // UI, the only credit was the unrelated "Basado en" citation block.
  credit: string | null;
};

/**
 * The image to show/cite for a story: an admin-set coverImageUrl always
 * wins; otherwise pull the linked campaign's own og:image live (Next's
 * fetch cache dedupes this across generateMetadata + the page render, and
 * across requests via the 24h revalidate window in fetchOgImage). Covers
 * both Vaki and GoFundMe. GoFundMe also shows a real photo via the live
 * GoFundMeEmbed widget on the story page itself, but that embed doesn't
 * reach OG/JSON-LD/card-image contexts, which is what this is for.
 */
export async function resolveStoryImage(story: {
  coverImageUrl: string | null;
  campaign: { platform: string; url: string; orgOrPerson?: string; title?: string } | null;
}): Promise<StoryImage | null> {
  if (story.coverImageUrl) return { url: story.coverImageUrl, credit: null };
  if (story.campaign?.platform === "VAKI" || story.campaign?.platform === "GOFUNDME") {
    const url = await fetchOgImage(story.campaign.url);
    if (!url) return null;
    return { url, credit: story.campaign.orgOrPerson ?? story.campaign.title ?? null };
  }
  return null;
}
