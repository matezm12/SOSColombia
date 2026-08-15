import { prisma } from "@/lib/prisma";
import { ALLIED_CATEGORY_LABEL } from "@/lib/labels";

// Markdown mirror of the allied-resources directory (src/app/[locale]/recursos/page.tsx).
// Same filter (status != DEAD), same category grouping/order, as the real page.
//
// Resources get added/checked over time -- never freeze at build time.
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.soscolombia.xyz";

const CATEGORY_ORDER = [
  "MAP_TRACKER",
  "AID_DIRECTORY",
  "DONATION_PLATFORM",
  "VOLUNTEER_COORDINATION",
  "NEWS_AGGREGATOR",
  "OTHER",
] as const;

export async function GET() {
  const resources = await prisma.alliedResource.findMany({
    where: { status: { not: "DEAD" } },
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: [{ tier: "asc" }, { name: "asc" }],
  });

  const grouped = Object.groupBy(resources, (r) => r.category);

  const sections = CATEGORY_ORDER.map((cat) => {
    const items = grouped[cat];
    if (!items || items.length === 0) return null;

    const lines = items.map((r) => {
      const parts: string[] = [`**${r.name}**${r.org ? ` — ${r.org}` : ""}`, r.description];
      if (r.municipio) {
        parts.push(`Enfoque: [${r.municipio.name}](${SITE_URL}/md/ciudad/${r.municipio.divipolaCode})`);
      }
      if (r.notes) parts.push(`Nota: ${r.notes}`);
      parts.push(`[${r.url}](${r.url})`);
      return `- ${parts.join(" · ")}`;
    });

    return `## ${ALLIED_CATEGORY_LABEL[cat] ?? cat}\n\n${lines.join("\n")}`;
  }).filter(Boolean);

  const title = "Recursos y aliados — SOSColombia";
  const description =
    "Otros sitios y herramientas independientes construidos para esta emergencia — mapas, directorios de ayuda, plataformas de donación y coordinación de voluntariado.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/recursos"
last_updated: "${new Date().toISOString()}"
---

# Recursos y aliados

${description}

${sections.length > 0 ? sections.join("\n\n") : "Sin recursos todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
