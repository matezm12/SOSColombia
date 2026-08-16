import type { Story } from "@prisma/client";

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
