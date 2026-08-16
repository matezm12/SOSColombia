import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { contradictionStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the methodology page (src/app/[locale]/metodologia/page.tsx):
// the intro copy plus the open/resolved contradiction registry. Short but
// valuable for LLM search to understand how to weigh this site's numbers.
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
//
// Short revalidation window instead of force-dynamic: contradictions get
// resolved/added over time, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

function contradictionLines(
  c: {
    topic: string;
    status: string;
    valueA: string;
    sourceA: string;
    valueB: string;
    sourceB: string;
    resolutionText: string | null;
    loggedAt: Date;
    resolvedAt: Date | null;
  },
  locale: string,
  md: Awaited<ReturnType<typeof getTranslations>>,
): string {
  const parts: string[] = [
    `### ${c.topic} (${contradictionStatusLabel(c.status, locale)})`,
    `- ${md("valorA")}: ${c.valueA} — ${c.sourceA}`,
    `- ${md("valorB")}: ${c.valueB} — ${c.sourceB}`,
  ];
  if (c.resolutionText) parts.push(`- ${md("resolucion")}: ${c.resolutionText}`);
  let dateLine = `- ${md("registrada")} ${formatDate(c.loggedAt)}`;
  if (c.resolvedAt) dateLine += ` · ${md("resuelta")} ${formatDate(c.resolvedAt)}`;
  parts.push(dateLine);
  return parts.join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "metodologia" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((cont) => cont.status === "OPEN");
  const resolved = contradictions.filter((cont) => cont.status === "RESOLVED");

  const path = locale === "en" ? "/en/metodologia" : "/metodologia";
  const mdSuffix = locale === "en" ? "?locale=en" : "";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("metaDescription")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("intro1")}

${t("intro2")}

## ${t("discrepanciasAbiertas")}

${open.length > 0 ? open.map((cont) => contradictionLines(cont, locale, c)).join("\n\n") : (locale === "en" ? "No open discrepancies." : "Sin discrepancias abiertas.")}

## ${t("discrepanciasResueltas")}

${resolved.length > 0 ? resolved.map((cont) => contradictionLines(cont, locale, c)).join("\n\n") : (locale === "en" ? "No resolved discrepancies yet." : "Sin discrepancias resueltas todavía.")}

## ${c("verMas")}

${locale === "en" ? "Full site activity log" : "Historial completo de actividad del sitio"}: ${SITE_URL}/md/cambios${mdSuffix}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
