import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.soscolombia.xyz";

// es is unprefixed (localePrefix: "as-needed" in src/i18n/routing.ts), en is
// under /en. Every entry gets both, plus an alternates.languages map so
// crawlers see the es/en pair as translations of each other, not duplicates.
function entry(
  path: string,
  opts: {
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    lastModified?: Date;
  },
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
    alternates: {
      languages: {
        es: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  };
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
  { path: "/sugerir", priority: 0.7, changeFrequency: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Municipio has no updatedAt/lastModified column in prisma/schema.prisma,
  // so per-city entries omit lastModified rather than faking a date.
  const municipios = await prisma.municipio.findMany({
    select: { divipolaCode: true },
  });

  return [
    ...STATIC_ROUTES.map((route) =>
      entry(route.path, {
        priority: route.priority,
        changeFrequency: route.changeFrequency,
      }),
    ),
    ...municipios.map((m) =>
      entry(`/ciudad/${m.divipolaCode}`, {
        priority: 0.6,
        changeFrequency: "weekly",
      }),
    ),
  ];
}
