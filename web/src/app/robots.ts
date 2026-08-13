import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Never index the moderation queue — it's Basic-Auth-gated, but there's
      // no reason to invite discovery of the URL either.
      disallow: "/admin/",
    },
    sitemap: "https://sos-colombia-ri329kr9p-matezm12s-projects.vercel.app/sitemap.xml",
  };
}
