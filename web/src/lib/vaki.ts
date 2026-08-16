// Unlike GoFundMe, Vaki has no iframe/widget embed mechanism to reimplement
// (confirmed: no embed.js, no /widget/{size} route on their site) — but it
// does server-render a real og:image meta tag pointing straight at the
// campaign's own photo (confirmed via a direct fetch with a social-crawler
// User-Agent). So there's nothing to embed, just an image to read out of
// the page's own <head>, same spirit as GoFundMeEmbed.tsx reusing the
// platform's own public mechanism instead of inventing one.

export function isVakiUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname.replace(/^www\./, "") === "vaki.co";
  } catch {
    return false;
  }
}

export { fetchOgImage as fetchVakiImage } from "@/lib/ogImage";
