import { nationalTollRecords, departmentTollRecords, latestByMetric } from "@/lib/queries";
import { METRIC_LABEL, TIER_LABEL } from "@/lib/labels";
import { formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the national figures page (src/app/[locale]/cifras/page.tsx).
// Same two queries (national + department-level TollRecords), same
// append-only-history framing: every previously published value stays on
// the record, nothing gets silently overwritten.
//
// Short revalidation window instead of force-dynamic: toll records arrive
// via cron/moderation, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
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
      `**${METRIC_LABEL[r.metric] ?? r.metric}:** ${formatNumber(r.value)}${r.unit ? ` ${r.unit}` : ""}`,
      `${r.source.org} (${TIER_LABEL[r.tier] ?? `nivel ${r.tier}`}), ${formatDate(r.asOf)}`,
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
    return `### ${METRIC_LABEL[metric] ?? metric}

| Departamento | Valor | Fuente |
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
    return `### ${METRIC_LABEL[metric] ?? metric}

| Valor | Fecha | Fuente | Notas |
| --- | --- | --- | --- |
${rows.join("\n")}`;
  });

  const title = "Cifras nacionales — SOSColombia";
  const description =
    "Cada cifra queda registrada con su fuente y fecha — nunca se sobrescribe. Valor más reciente de cada indicador, más historial completo.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/cifras"
last_updated: "${new Date().toISOString()}"
---

# Cifras nacionales

${description}

## Últimos valores

${latestLines.length > 0 ? latestLines.join("\n") : "Sin cifras nacionales publicadas todavía."}

## Por departamento

${departmentSections.length > 0 ? departmentSections.join("\n\n") : "Sin cifras por departamento publicadas todavía."}

## Historial completo

Los números de un desastre cambian de reporte a reporte — eso no siempre es un error. A continuación, cada valor publicado, no solo el más reciente.

${historySections.length > 0 ? historySections.join("\n\n") : "Sin historial disponible todavía."}

## Ver más

Para cifras por ciudad, ver [la página de cada ciudad](${SITE_URL}/md).
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
