// Generic og:image/twitter:image scraper for platforms with no embed API of
// their own (Vaki, GoFundMe) — used to give story cover images/JSON-LD a
// real campaign photo instead of the site-wide fallback. Matches the whole
// <meta> tag first, then pulls its content= attribute separately, because
// attribute order isn't consistent across platforms: Vaki writes
// property="og:image" before content=, GoFundMe writes content= first.
const META_TAG_PATTERN = /<meta\s+[^>]*(?:property|name)="(?:og:image|twitter:image)"[^>]*>/i;
const CONTENT_ATTR_PATTERN = /content="([^"]+)"/i;

export async function fetchOgImage(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SOSColombiaBot/1.0; +https://www.soscolombia.xyz)",
      },
      next: { revalidate: 86400 },
      // A slow/unresponsive third-party campaign page shouldn't be able to
      // stall a story page's render — especially now that historias/[slug]
      // is ISR-cacheable (see generateStaticParams), this only runs cold
      // once per revalidate window rather than on every request.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const tagMatch = html.match(META_TAG_PATTERN);
    if (!tagMatch) return null;
    const contentMatch = tagMatch[0].match(CONTENT_ATTR_PATTERN);
    return contentMatch ? contentMatch[1].replace(/&amp;/g, "&") : null;
  } catch {
    return null;
  }
}
