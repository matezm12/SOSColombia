import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { tierLabel, sourceStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the source registry page (src/app/[locale]/fuentes/page.tsx).
// Same query (all Sources with derived-record counts), same ordering
// (tier asc, org asc), same columns as the real table. Bilingual via
// ?locale=en (default es) — see /md/donar/route.ts for the pattern this
// follows.
//
// Short revalidation window instead of force-dynamic: source status/tier
// changes occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const t = await getTranslations({ locale, namespace: "fuentes" });

  const sources = await prisma.source.findMany({
    include: { _count: { select: { tollRecords: true, aidPoints: true } } },
    orderBy: [{ tier: "asc" }, { org: "asc" }],
  });

  const rows = sources.map((s) => {
    const org = s.url?.startsWith("http") ? `[${s.org}](${s.url})` : s.org;
    const tier = tierLabel(s.tier, locale);
    const status = sourceStatusLabel(s.status, locale);
    const derived = s._count.tollRecords + s._count.aidPoints;
    const verified = s.lastFetchedAt ? formatDate(s.lastFetchedAt) : "—";
    return `| ${org} | ${tier} | ${status} | ${derived} | ${verified} |`;
  });

  const path = locale === "en" ? "/en/fuentes" : "/fuentes";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

| ${t("table.organizacion")} | ${t("table.nivel")} | ${t("table.estado")} | ${t("table.datosDerivados")} | ${t("table.verificada")} |
| --- | --- | --- | --- | --- |
${rows.length > 0 ? rows.join("\n") : "| — | — | — | — | — |"}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
