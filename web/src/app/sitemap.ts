import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://www.soscolombia.xyz";

// es is unprefixed (localePrefix: "as-needed" in src/i18n/routing.ts), en is
// under /en. Every entry gets both, plus an alternates.languages map so
// crawlers see the es/en pair as translations of each other, not duplicates.
function entry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily",
    alternates: {
      languages: {
        es: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const municipios = await prisma.municipio.findMany({
    select: { divipolaCode: true },
  });

  const staticRoutes = [
    "",
    "/mapa",
    "/cifras",
    "/donar",
    "/donar/internacional",
    "/informes",
    "/ayuda",
    "/fuentes",
    "/metodologia",
    "/recursos",
    "/comunidad",
    "/comunidad/sugerir",
    "/sugerir",
  ];

  return [
    ...staticRoutes.map((route) => entry(route)),
    ...municipios.map((m) => entry(`/ciudad/${m.divipolaCode}`)),
  ];
}
