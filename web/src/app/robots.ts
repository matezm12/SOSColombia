import type { MetadataRoute } from "next";

// AI crawlers get an explicit allow rule (still excluding /admin/) so their
// per-user-agent block is unambiguous — most bots match a specific block
// instead of falling back to "*" when one is present for them.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never index the moderation queue — it's Basic-Auth-gated, but
        // there's no reason to invite discovery of the URL either.
        disallow: "/admin/",
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: "/admin/",
      },
    ],
    // Machine-readable site summary for AI crawlers/agents — discoverable by
    // just existing at /llms.txt; MetadataRoute.Robots has no field for it.
    sitemap: "https://www.soscolombia.xyz/sitemap.xml",
  };
}
