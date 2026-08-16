import type { Story } from "@prisma/client";
import { routing } from "@/i18n/routing";
import { fetchVakiImage } from "@/lib/vaki";

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

/**
 * The image to show/cite for a story: an admin-set coverImageUrl always
 * wins; otherwise, for a Vaki-linked campaign, pull its own og:image live
 * (Next's fetch cache dedupes this across generateMetadata + the page
 * render, and across requests via the 24h revalidate window in
 * fetchVakiImage). GoFundMe campaigns aren't covered here — they already
 * show a real photo via the live GoFundMeEmbed widget on the page itself,
 * this is specifically for OG/JSON-LD/cover-image contexts where that
 * embed isn't present.
 */
export async function resolveStoryImage(story: {
  coverImageUrl: string | null;
  campaign: { platform: string; url: string } | null;
}): Promise<string | null> {
  if (story.coverImageUrl) return story.coverImageUrl;
  if (story.campaign?.platform === "VAKI") {
    return fetchVakiImage(story.campaign.url);
  }
  return null;
}
