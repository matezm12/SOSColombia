import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.soscolombia.xyz";

// es is unprefixed (localePrefix: "as-needed" in src/i18n/routing.ts), en is
// under /en. Each path gets its own <loc> per locale (not just an alternate
// hung off the es entry) so both locales are first-class discovery targets
// and the hreflang annotation is reciprocal — each entry's alternates map
// includes an x-default pointing at the es (unprefixed) URL.
function entry(
  path: string,
  opts: {
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    lastModified?: Date;
  },
): MetadataRoute.Sitemap[number][] {
  const languages = {
    es: `${SITE_URL}${path}`,
    en: `${SITE_URL}/en${path}`,
    "x-default": `${SITE_URL}${path}`,
  };
  const base = {
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
    alternates: { languages },
  };
  return [
    { ...base, url: languages.es },
    { ...base, url: languages.en },
  ];
}

// Every indexable route under src/app/[locale]/, one entry per page.tsx.
// Excluded on purpose: /sugerir/gracias and /comunidad/sugerir/gracias —
// those are post-submit thank-you confirmations, not content, and
// shouldn't be indexed.
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  // Data changes constantly on these — homepage dashboard, the figures
  // page, and the map.
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/mapa", priority: 0.9, changeFrequency: "daily" },
  { path: "/cifras", priority: 0.9, changeFrequency: "daily" },
  // High-priority but slower-moving pages.
  { path: "/ayuda", priority: 0.9, changeFrequency: "weekly" },
  { path: "/donar", priority: 0.9, changeFrequency: "weekly" },
  // Other static/informational pages.
  { path: "/donar/internacional", priority: 0.7, changeFrequency: "weekly" },
  { path: "/informes", priority: 0.7, changeFrequency: "weekly" },
  { path: "/fuentes", priority: 0.7, changeFrequency: "weekly" },
  { path: "/metodologia", priority: 0.7, changeFrequency: "weekly" },
  { path: "/recursos", priority: 0.7, changeFrequency: "weekly" },
  { path: "/comunidad", priority: 0.7, changeFrequency: "weekly" },
  { path: "/comunidad/sugerir", priority: 0.7, changeFrequency: "weekly" },
  { path: "/historias", priority: 0.7, changeFrequency: "weekly" },
  { path: "/sugerir", priority: 0.7, changeFrequency: "weekly" },
  { path: "/datos", priority: 0.6, changeFrequency: "weekly" },
  { path: "/cambios", priority: 0.6, changeFrequency: "daily" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Municipio has no updatedAt/lastModified column in prisma/schema.prisma,
  // so per-city entries omit lastModified rather than faking a date.
  const [municipios, stories] = await Promise.all([
    prisma.municipio.findMany({ select: { divipolaCode: true } }),
    prisma.story.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...STATIC_ROUTES.flatMap((route) =>
      entry(route.path, {
        priority: route.priority,
        changeFrequency: route.changeFrequency,
      }),
    ),
    ...municipios.flatMap((m) =>
      entry(`/ciudad/${m.divipolaCode}`, {
        priority: 0.6,
        changeFrequency: "weekly",
      }),
    ),
    ...stories.flatMap((s) =>
      entry(`/historias/${s.slug}`, {
        priority: 0.6,
        changeFrequency: "monthly",
        lastModified: s.updatedAt,
      }),
    ),
  ];
}
