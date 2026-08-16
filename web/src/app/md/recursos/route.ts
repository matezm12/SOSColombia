import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { alliedCategoryLabel } from "@/lib/labels";

// Markdown mirror of the allied-resources directory (src/app/[locale]/recursos/page.tsx).
// Same filter (status != DEAD), same category grouping/order, as the real page.
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
//
// Short revalidation window instead of force-dynamic: resources get added/
// checked over time, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

const CATEGORY_ORDER = [
  "MAP_TRACKER",
  "AID_DIRECTORY",
  "DONATION_PLATFORM",
  "VOLUNTEER_COORDINATION",
  "NEWS_AGGREGATOR",
  "OTHER",
] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "recursos" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

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
        const cityPath = `${SITE_URL}/md/ciudad/${r.municipio.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
        parts.push(`${c("enfoque")}: [${r.municipio.name}](${cityPath})`);
      }
      if (r.notes) parts.push(`${c("nota")}: ${r.notes}`);
      parts.push(`[${r.url}](${r.url})`);
      return `- ${parts.join(" · ")}`;
    });

    return `## ${alliedCategoryLabel(cat, locale)}\n\n${lines.join("\n")}`;
  }).filter(Boolean);

  const path = locale === "en" ? "/en/recursos" : "/recursos";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${sections.length > 0 ? sections.join("\n\n") : t("vacio")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
