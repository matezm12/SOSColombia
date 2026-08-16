import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { tierLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the official-reports page (src/app/[locale]/informes/page.tsx).
// Same query (all GovReports, most recent first) and same fields as
// GovReportCard: org, docType, date, tier, summary, keyFigures, url.
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
//
// Short revalidation window instead of force-dynamic: reports land
// occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "informes" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const reports = await prisma.govReport.findMany({ orderBy: { date: "desc" } });

  const reportSections = reports.map((r) => {
    const keyFigures =
      r.keyFigures && typeof r.keyFigures === "object" && !Array.isArray(r.keyFigures)
        ? (r.keyFigures as Record<string, unknown>)
        : null;

    const lines = [
      `### ${r.title}`,
      "",
      `${r.org} · ${r.docType} · ${formatDate(r.date)} · ${tierLabel(r.sourceTier, locale)}`,
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
      lines.push(`[${c("verDocumento")}](${r.url})`);
    }

    return lines.join("\n");
  });

  const path = locale === "en" ? "/en/informes" : "/informes";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${reportSections.length > 0 ? reportSections.join("\n\n") : t("sinInformes")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
