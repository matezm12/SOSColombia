import { getTranslations } from "next-intl/server";
import { nationalTollRecords, departmentTollRecords, latestByMetric } from "@/lib/queries";
import { metricLabel, tierLabel } from "@/lib/labels";
import { formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the national figures page (src/app/[locale]/cifras/page.tsx).
// Same two queries (national + department-level TollRecords), same
// append-only-history framing: every previously published value stays on
// the record, nothing gets silently overwritten. Bilingual via ?locale=en
// (default es) — see /md/donar/route.ts for the pattern this follows.
//
// Short revalidation window instead of force-dynamic: toll records arrive
// via cron/moderation, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "cifras" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const [national, byDepartment] = await Promise.all([
    nationalTollRecords(),
    departmentTollRecords(),
  ]);

  const latestNational = latestByMetric(national);

  const historyByMetric = new Map<string, typeof national>();
  for (const r of national) {
    const list = historyByMetric.get(r.metric) ?? [];
    list.push(r);
    historyByMetric.set(r.metric, list);
  }

  const departmentsByMetric = new Map<string, typeof byDepartment>();
  for (const r of byDepartment) {
    const list = departmentsByMetric.get(r.metric) ?? [];
    list.push(r);
    departmentsByMetric.set(r.metric, list);
  }

  const latestLines = latestNational.map((r) => {
    const parts = [
      `**${metricLabel(r.metric, locale)}:** ${formatNumber(r.value)}${r.unit ? ` ${r.unit}` : ""}`,
      `${r.source.org} (${tierLabel(r.tier, locale)}), ${formatDate(r.asOf)}`,
    ];
    if (r.notes) parts.push(r.notes);
    return `- ${parts.join(" — ")}`;
  });

  const departmentSections = [...departmentsByMetric.entries()].map(([metric, records]) => {
    const rows = [...records]
      .sort((a, b) => b.value - a.value)
      .map(
        (r) =>
          `| ${r.department?.name ?? "—"} | ${formatNumber(r.value)} | ${r.source.org} · ${formatDate(r.asOf)} |`,
      );
    return `### ${metricLabel(metric, locale)}

| ${c("departamento")} | ${c("valor")} | ${c("fuente")} |
| --- | --- | --- |
${rows.join("\n")}`;
  });

  const historySections = [...historyByMetric.entries()].map(([metric, records]) => {
    const rows = [...records]
      .sort((a, b) => b.asOf.getTime() - a.asOf.getTime())
      .map(
        (r) =>
          `| ${formatNumber(r.value)}${r.unit ? ` ${r.unit}` : ""} | ${formatDate(r.asOf)} | ${r.source.org} | ${r.notes ?? "—"} |`,
      );
    return `### ${metricLabel(metric, locale)}

| ${c("valor")} | ${c("fecha")} | ${c("fuente")} | ${c("notas")} |
| --- | --- | --- | --- |
${rows.join("\n")}`;
  });

  const path = locale === "en" ? "/en/cifras" : "/cifras";
  const mdPrefix = locale === "en" ? "?locale=en" : "";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

## ${t("ultimosValores")}

${latestLines.length > 0 ? latestLines.join("\n") : t("sinCifras")}

## ${t("porDepartamento")}

${departmentSections.length > 0 ? departmentSections.join("\n\n") : t("sinCifras")}

## ${t("historialCompleto")}

${t("historialLede")}

${historySections.length > 0 ? historySections.join("\n\n") : t("sinCifras")}

## ${c("verMas")}

${SITE_URL}/md${mdPrefix}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
