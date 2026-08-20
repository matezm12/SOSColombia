// Derives a real, human-readable source name from a URL when no org label was
// captured at detection time — used as the last resort before falling back to
// a generic "unidentified" label, per explicit instruction: no source should
// ever display an internal "detección automática, revisar" placeholder.
const KNOWN_OUTLETS: Record<string, string> = {
  "semana.com": "Semana",
  "bluradio.com": "Blu Radio",
  "eltiempo.com": "El Tiempo",
  "infobae.com": "Infobae",
  "elespectador.com": "El Espectador",
  "wradio.com.co": "W Radio",
  "rcnradio.com": "RCN Radio",
  "caracoltv.com": "Caracol TV",
  "pulzo.com": "Pulzo",
};

export function deriveSourceName(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (host === "tiktok.com" && segments[0]?.startsWith("@")) {
    return `TikTok — ${segments[0]}`;
  }
  if (host === "instagram.com" && segments[0] && !["p", "reel", "tv", "stories", "explore"].includes(segments[0])) {
    return `Instagram — @${segments[0]}`;
  }
  if ((host === "x.com" || host === "twitter.com") && segments[0] && segments[1] === "status") {
    return `X — @${segments[0]}`;
  }
  if (host === "facebook.com" && segments[0] && !["reel", "groups", "search", "watch"].includes(segments[0])) {
    return `Facebook — @${segments[0]}`;
  }
  if (host === "gofundme.com") return "GoFundMe";
  if (host === "vaki.co") return "Vaki";
  if (KNOWN_OUTLETS[host]) return KNOWN_OUTLETS[host];

  // No specific handle/outlet resolvable (e.g. a Facebook group, search page,
  // or an Instagram permalink with no account name in the URL) — still real
  // and better than a generic "unidentified" label, just not attributable to
  // one account.
  if (host === "instagram.com") return "Instagram";
  if (host === "facebook.com") return "Facebook";
  if (host === "tiktok.com") return "TikTok";
  if (host === "x.com" || host === "twitter.com") return "X";

  return null;
}
