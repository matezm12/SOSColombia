import { prisma } from "@/lib/prisma";
import { TIER_LABEL, SOURCE_STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the source registry page (src/app/[locale]/fuentes/page.tsx).
// Same query (all Sources with derived-record counts), same ordering
// (tier asc, org asc), same columns as the real table.
//
// Short revalidation window instead of force-dynamic: source status/tier
// changes occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const sources = await prisma.source.findMany({
    include: { _count: { select: { tollRecords: true, aidPoints: true } } },
    orderBy: [{ tier: "asc" }, { org: "asc" }],
  });

  const rows = sources.map((s) => {
    const org = s.url?.startsWith("http") ? `[${s.org}](${s.url})` : s.org;
    const tier = TIER_LABEL[s.tier] ?? `nivel ${s.tier}`;
    const status = SOURCE_STATUS_LABEL[s.status] ?? s.status;
    const derived = s._count.tollRecords + s._count.aidPoints;
    const verified = s.lastFetchedAt ? formatDate(s.lastFetchedAt) : "—";
    return `| ${org} | ${tier} | ${status} | ${derived} | ${verified} |`;
  });

  const title = "Fuentes — SOSColombia";
  const description =
    "Cada dato en este sitio viene de una fuente citada aquí, con su nivel de confiabilidad. Nivel 1 es la fuente oficial más directa; nivel 6 son redes sociales sin verificar.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/fuentes"
last_updated: "${new Date().toISOString()}"
---

# Fuentes

${description}

| Organización | Nivel | Estado | Datos derivados | Verificada |
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
