import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { bestDeathMetric } from "@/lib/queries";
import { severityLabel } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Markdown mirror of the homepage (src/app/[locale]/page.tsx), served for AI
// crawlers/LLM search at a predictable plain-text URL. Bilingual via
// ?locale=en (default es) — see /md/donar/route.ts for the pattern this
// follows. Queries the exact same models/fields the real page renders; no
// invented data.
//
// Short revalidation window instead of force-dynamic — see [locale]/page.tsx.
// Route Handlers support the same revalidate export as page.tsx.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [meta, home] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  const [event, municipios] = await Promise.all([
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.municipio.findMany({
      include: {
        department: true,
        tollRecords: {
          where: { metric: { in: ["DEATHS_REPORTED_OFFICIAL", "DEATHS_CONFIRMED_FORENSIC"] } },
        },
      },
      orderBy: { populationDane: "desc" },
    }),
  ]);

  const magnitude = event?.magnitudeSgc != null ? event.magnitudeSgc.toFixed(1) : null;
  const lede = magnitude ? home("lede", { magnitude }) : meta("description");

  const cityLines = municipios.map((m) => {
    const death = bestDeathMetric(m.tollRecords);
    const severity = m.severityLabel ? severityLabel(m.severityLabel, locale) : null;
    const parts: string[] = [`**${m.name}** (${m.department.name})`];
    if (severity) parts.push(severity);
    if (death) {
      const label =
        death.metric === "DEATHS_CONFIRMED_FORENSIC"
          ? home("fallecidosConfirmados")
          : home("fallecidosReportados");
      parts.push(`${formatNumber(death.value)} ${label}`);
    }
    const cityPath = `${SITE_URL}/md/ciudad/${m.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
    return `- ${parts.join(" — ")} — [${locale === "en" ? "see city" : "ver ciudad"}](${cityPath})`;
  });

  const path = locale === "en" ? "/en" : "";

  const markdown = `---
title: "${meta("title")}"
description: "${meta("description")}"
url: "${SITE_URL}${path}/"
last_updated: "${new Date().toISOString()}"
---

# ${meta("title")}

${lede}

## ${home("ciudades")}

${cityLines.join("\n")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
