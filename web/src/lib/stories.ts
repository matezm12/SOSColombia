import type { Story } from "@prisma/client";
import { routing } from "@/i18n/routing";

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
