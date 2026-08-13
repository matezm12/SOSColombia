import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://sos-colombia-ri329kr9p-matezm12s-projects.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const municipios = await prisma.municipio.findMany({
    select: { divipolaCode: true },
  });

  const staticRoutes = [
    "",
    "/mapa",
    "/cifras",
    "/donar",
    "/informes",
    "/ayuda",
    "/fuentes",
    "/metodologia",
    "/sugerir",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "daily" as const,
    })),
    ...municipios.map((m) => ({
      url: `${SITE_URL}/ciudad/${m.divipolaCode}`,
      changeFrequency: "daily" as const,
    })),
  ];
}
