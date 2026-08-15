import { prisma } from "@/lib/prisma";
import { TIER_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the official-reports page (src/app/[locale]/informes/page.tsx).
// Same query (all GovReports, most recent first) and same fields as
// GovReportCard: org, docType, date, tier, summary, keyFigures, url.
//
// Short revalidation window instead of force-dynamic: reports land
// occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const reports = await prisma.govReport.findMany({ orderBy: { date: "desc" } });

  const reportSections = reports.map((r) => {
    const keyFigures =
      r.keyFigures && typeof r.keyFigures === "object" && !Array.isArray(r.keyFigures)
        ? (r.keyFigures as Record<string, unknown>)
        : null;

    const lines = [
      `### ${r.title}`,
      "",
      `${r.org} · ${r.docType} · ${formatDate(r.date)} · ${TIER_LABEL[r.sourceTier] ?? `nivel ${r.sourceTier}`}`,
      "",
      r.summary,
    ];

    if (keyFigures && Object.keys(keyFigures).length > 0) {
      lines.push("");
      lines.push(
        Object.entries(keyFigures)
          .map(([key, value]) => `- **${key}:** ${String(value)}`)
          .join("\n"),
      );
    }

    if (r.url) {
      lines.push("");
      lines.push(`[Ver documento](${r.url})`);
    }

    return lines.join("\n");
  });

  const title = "Informes oficiales — SOSColombia";
  const description =
    "Decretos, balances y comunicados oficiales — registro cronológico, con la fuente y el nivel de confiabilidad de cada uno.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/informes"
last_updated: "${new Date().toISOString()}"
---

# Informes oficiales

${description}

${reportSections.length > 0 ? reportSections.join("\n\n") : "Sin informes registrados todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
