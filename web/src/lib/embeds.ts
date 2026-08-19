// Finds real social-media permalinks embedded in a third-party page's raw
// HTML (a news article, an allied-org's site, etc.) via the standard
// oEmbed blockquote markup every platform's own "embed this post" button
// generates — Instagram/TikTok carry the real permalink right in the
// blockquote's own attribute (data-instgrm-permalink / cite), X/Twitter
// carries it as the blockquote's own final <a href> — no guessing, no
// platform API calls, just reading what's already in the page.
//
// Used by api/cron/discovery to sweep the full article page of any Google
// News result that already matched a keyword+city (not every RSS item —
// only ones already proven relevant get the extra fetch).

export interface EmbeddedPermalink {
  platform: "INSTAGRAM" | "TIKTOK" | "X";
  permalink: string;
}

function cleanUrl(url: string): string {
  return url.split("?")[0].split("#")[0];
}

const BLOCKQUOTE_OPEN_RE = /<blockquote\b[^>]*>/gi;
const TWITTER_BLOCKQUOTE_RE = /<blockquote\b[^>]*class="[^"]*twitter-tweet[^"]*"[^>]*>([\s\S]*?)<\/blockquote>/gi;

export function extractEmbeddedSocialPermalinks(html: string): EmbeddedPermalink[] {
  const found: EmbeddedPermalink[] = [];
  const seen = new Set<string>();

  const add = (platform: EmbeddedPermalink["platform"], raw: string) => {
    const permalink = cleanUrl(raw);
    if (!seen.has(permalink)) {
      seen.add(permalink);
      found.push({ platform, permalink });
    }
  };

  // Instagram/TikTok: the real permalink is an attribute on the blockquote's
  // own opening tag, order-independent (class before or after the data
  // attribute, both seen in the wild) -- match the whole opening tag once,
  // then check/extract from that substring rather than one combined regex
  // that would only match one attribute order.
  for (const tag of html.match(BLOCKQUOTE_OPEN_RE) ?? []) {
    if (/class="[^"]*instagram-media[^"]*"/i.test(tag)) {
      const m = tag.match(/data-instgrm-permalink="([^"]+)"/i);
      if (m) add("INSTAGRAM", m[1]);
    } else if (/class="[^"]*tiktok-embed[^"]*"/i.test(tag)) {
      const m = tag.match(/cite="([^"]+)"/i);
      if (m) add("TIKTOK", m[1]);
    }
  }

  // X/Twitter: the permalink isn't an attribute, it's the blockquote's own
  // content -- the final <a href="...status/<id>"> the embed script replaces
  // with the real rendered tweet.
  for (const match of html.matchAll(TWITTER_BLOCKQUOTE_RE)) {
    const hrefMatch = match[1].match(/<a[^>]*href="(https?:\/\/(?:twitter\.com|x\.com)\/[^"?]+\/status\/\d+)/i);
    if (hrefMatch) add("X", hrefMatch[1]);
  }

  return found;
}
