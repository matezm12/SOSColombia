// Unlike GoFundMe, Vaki has no iframe/widget embed mechanism to reimplement
// (confirmed: no embed.js, no /widget/{size} route on their site) — but it
// does server-render a real og:image meta tag pointing straight at the
// campaign's own photo (confirmed via a direct fetch with a social-crawler
// User-Agent). So there's nothing to embed, just an image to read out of
// the page's own <head>, same spirit as GoFundMeEmbed.tsx reusing the
// platform's own public mechanism instead of inventing one.

const OG_IMAGE_PATTERN = /<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content="([^"]+)"/i;

export function isVakiUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname.replace(/^www\./, "") === "vaki.co";
  } catch {
    return false;
  }
}

/**
 * Fetches a Vaki campaign page and extracts its og:image URL. Used server-
 * side only (Story detail page's generateMetadata + render). Fails closed
 * (returns null) on any network/parse error — a missing image is just a
 * missing image, never worth failing the whole page render over.
 */
export async function fetchVakiImage(campaignUrl: string): Promise<string | null> {
  try {
    const res = await fetch(campaignUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SOSColombiaBot/1.0; +https://www.soscolombia.xyz)",
      },
      // Vaki campaign photos don't change once uploaded — a long cache
      // window avoids re-fetching their page on every story page render.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(OG_IMAGE_PATTERN);
    return match ? match[1].replace(/&amp;/g, "&") : null;
  } catch {
    return null;
  }
}
