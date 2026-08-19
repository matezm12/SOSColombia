// Shared RSS/XML parsing — pulled out of api/cron/gov-news-check/route.ts so
// api/cron/discovery (Google News RSS sweep) reuses the exact same,
// already-proven parsing instead of re-deriving it. Regex-based on purpose:
// these feeds are small and simple enough that a full XML parser dependency
// isn't worth it, same call gov-news-check already made for the Manizales feed.

export interface RssItem {
  title: string;
  link: string;
  description: string;
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é").replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
    .replace(/&#8230;/g, "…").replace(/&amp;/gi, "&");
}

export function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) return null;
  return decodeEntities(
    match[1].replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").replace(/<[^>]+>/g, " ").trim(),
  );
}

export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const description = extractTag(block, "description") ?? "";
    if (title && link) items.push({ title, link, description });
  }
  return items;
}
