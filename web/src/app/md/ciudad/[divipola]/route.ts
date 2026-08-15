import { prisma } from "@/lib/prisma";
import {
  AID_KIND_LABEL,
  AID_STATUS_LABEL,
  METRIC_LABEL,
  TIER_LABEL,
  CROWDFUNDING_PLATFORM_LABEL,
  VERIFICATION_LABEL,
} from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

// Markdown mirror of the per-city page (src/app/[locale]/ciudad/[divipola]/page.tsx).
// Highest-value mirror in this pass — "how bad is it in Quibdó"-shaped queries
// map directly to one of these. Same query shape as the real page: latest
// toll record per metric (full history stays in the DB, never overwritten),
// aid points grouped by kind, and any city-focused crowdfunding campaigns.
//
// Short revalidation window instead of force-dynamic — see ciudad/page.tsx.
export const revalidate = 60;

// See ciudad/page.tsx for why this is needed for the dynamic segment to be
// prerendered/ISR-cached instead of falling back to fully dynamic.
export async function generateStaticParams() {
  const municipios = await prisma.municipio.findMany({ select: { divipolaCode: true } });
  return municipios.map((m) => ({ divipola: m.divipolaCode }));
}

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/md/ciudad/[divipola]">,
) {
  const { divipola } = await ctx.params;

  const municipio = await prisma.municipio.findUnique({
    where: { divipolaCode: divipola },
    include: {
      department: true,
      tollRecords: {
        include: { source: true },
        orderBy: [{ metric: "asc" }, { asOf: "desc" }],
      },
      aidPoints: {
        include: { source: true },
        orderBy: { kind: "asc" },
      },
      campaigns: {
        include: { municipios: { select: { name: true, divipolaCode: true } } },
      },
    },
  });

  if (!municipio) {
    return new Response("# No encontrada\n\nNo existe ninguna ciudad con ese código DIVIPOLA.\n", {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  // Latest value per metric — full history stays in the DB, never overwritten.
  const latestByMetric = new Map<string, (typeof municipio.tollRecords)[number]>();
  for (const record of municipio.tollRecords) {
    if (!latestByMetric.has(record.metric)) latestByMetric.set(record.metric, record);
  }

  const tollLines = [...latestByMetric.values()].map((record) => {
    const parts: string[] = [
      `**${METRIC_LABEL[record.metric] ?? record.metric}:** ${formatNumber(record.value)}${record.unit ? ` ${record.unit}` : ""}`,
    ];
    parts.push(`${record.source.org} (${TIER_LABEL[record.tier] ?? `tier ${record.tier}`}, ${formatDate(record.asOf)})`);
    if (record.notes) parts.push(record.notes);
    return `- ${parts.join(" — ")}`;
  });

  const aidByKind = Object.groupBy(municipio.aidPoints, (a) => a.kind);
  const aidSections = Object.entries(aidByKind).map(([kind, points]) => {
    const lines = (points ?? []).map((p) => {
      const parts: string[] = [`**${p.name}**`];
      parts.push(`Estado: ${AID_STATUS_LABEL[p.status] ?? p.status}`);
      if (p.address) parts.push(`Dirección: ${p.address}`);
      if (p.phone) parts.push(`Tel: ${p.phone}`);
      if (p.accessRestriction) parts.push(`Acceso restringido: ${p.accessRestriction}`);
      if (p.needsText) parts.push(`Necesita: ${p.needsText}`);
      const link = p.permalink ?? p.source.url;
      if (link) parts.push(`Fuente: ${p.source.org} (${TIER_LABEL[p.source.tier] ?? `tier ${p.source.tier}`}, ${link})`);
      parts.push(`Última verificación: ${formatDate(p.lastVerifiedAt)}`);
      return `- ${parts.join(" · ")}`;
    });
    return `### ${AID_KIND_LABEL[kind] ?? kind}\n\n${lines.join("\n")}`;
  });

  const campaignLines = municipio.campaigns.map((c) => {
    const parts: string[] = [`**${c.title}** — ${c.orgOrPerson}`];
    parts.push(`Plataforma: ${CROWDFUNDING_PLATFORM_LABEL[c.platform] ?? c.platform}`);
    parts.push(`Verificación: ${VERIFICATION_LABEL[c.verificationStatus] ?? c.verificationStatus}`);
    if (c.raised !== null) parts.push(`Recaudado: ${formatCurrency(c.raised, c.currency)}`);
    if (c.goal !== null) parts.push(`Meta: ${formatCurrency(c.goal, c.currency)}`);
    if (c.donorCount !== null) parts.push(`${formatNumber(c.donorCount)} donantes`);
    if (c.international) parts.push("Internacional");
    if (c.recurring) parts.push("Mensual");
    parts.push(`URL: ${c.url}`);
    if (c.notes) parts.push(c.notes);
    parts.push(`Última verificación: ${formatDate(c.lastCheckedAt)}`);
    return `- ${parts.join(" · ")}`;
  });

  const populationLine = municipio.populationDane
    ? ` · ${formatNumber(municipio.populationDane)} habitantes (DANE)`
    : "";

  const title = `${municipio.name} — SOSColombia`;
  const description = `Cifras verificadas, puntos de ayuda y campañas de recaudación para ${municipio.name}, ${municipio.department.name}.`;

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/ciudad/${municipio.divipolaCode}"
last_updated: "${new Date().toISOString()}"
---

# ${municipio.name}

${municipio.department.name} · DIVIPOLA ${municipio.divipolaCode}${populationLine}

## Cifras

${tollLines.length > 0 ? tollLines.join("\n") : "Sin cifras publicadas todavía para esta ciudad."}

## Puntos de ayuda

${aidSections.length > 0 ? aidSections.join("\n\n") : "Sin puntos de ayuda confirmados todavía para esta ciudad."}

## Campañas de recaudación

${campaignLines.length > 0 ? campaignLines.join("\n") : "Ninguna campaña de recaudación específica para esta ciudad todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
