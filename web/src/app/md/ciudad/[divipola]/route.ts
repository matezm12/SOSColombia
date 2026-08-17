import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  aidKindLabel,
  aidStatusLabel,
  metricLabel,
  tierLabel,
  crowdfundingPlatformLabel,
  verificationLabel,
  veredaKindLabel,
} from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

// Markdown mirror of the per-city page (src/app/[locale]/ciudad/[divipola]/page.tsx).
// Highest-value mirror in this pass — "how bad is it in Quibdó"-shaped queries
// map directly to one of these. Same query shape as the real page: latest
// toll record per metric (full history stays in the DB, never overwritten),
// aid points grouped by kind, and any city-focused crowdfunding campaigns.
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
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
  request: Request,
  ctx: RouteContext<"/md/ciudad/[divipola]">,
) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const { divipola } = await ctx.params;

  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "ciudad" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

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
      veredas: {
        include: { _count: { select: { aidPoints: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!municipio) {
    return new Response(`# ${c("noEncontradaTitle")}\n\n${c("noEncontradaCiudad")}\n`, {
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
      `**${metricLabel(record.metric, locale)}:** ${formatNumber(record.value)}${record.unit ? ` ${record.unit}` : ""}`,
    ];
    parts.push(`${record.source.org} (${tierLabel(record.tier, locale)}, ${formatDate(record.asOf)})`);
    if (record.notes) parts.push(record.notes);
    return `- ${parts.join(" — ")}`;
  });

  const aidByKind = Object.groupBy(municipio.aidPoints, (a) => a.kind);
  const aidSections = Object.entries(aidByKind).map(([kind, points]) => {
    const lines = (points ?? []).map((p) => {
      const parts: string[] = [`**${p.name}**`];
      parts.push(`${c("estado")}: ${aidStatusLabel(p.status, locale)}`);
      if (p.address) parts.push(`${c("direccion")}: ${p.address}`);
      if (p.phone) parts.push(`${c("tel")}: ${p.phone}`);
      if (p.accessRestriction) parts.push(`${c("accesoRestringido")}: ${p.accessRestriction}`);
      if (p.needsText) parts.push(`${c("necesita")}: ${p.needsText}`);
      const link = p.permalink ?? p.source.url;
      if (link) parts.push(`${c("fuente")}: ${p.source.org} (${tierLabel(p.source.tier, locale)}, ${link})`);
      parts.push(`${c("ultimaVerificacion")}: ${formatDate(p.lastVerifiedAt)}`);
      return `- ${parts.join(" · ")}`;
    });
    return `### ${aidKindLabel(kind, locale)}\n\n${lines.join("\n")}`;
  });

  const campaignLines = municipio.campaigns.map((camp) => {
    const parts: string[] = [`**${camp.title}** — ${camp.orgOrPerson}`];
    parts.push(`${c("plataforma")}: ${crowdfundingPlatformLabel(camp.platform, locale)}`);
    parts.push(`${c("verificacion")}: ${verificationLabel(camp.verificationStatus, locale)}`);
    if (camp.raised !== null) parts.push(`${c("recaudado")}: ${formatCurrency(camp.raised, camp.currency)}`);
    if (camp.goal !== null) parts.push(`${c("metaDonacion")}: ${formatCurrency(camp.goal, camp.currency)}`);
    if (camp.donorCount !== null) parts.push(`${formatNumber(camp.donorCount)} ${c("donantes")}`);
    if (camp.international) parts.push(c("internacional"));
    if (camp.recurring) parts.push(c("mensual"));
    parts.push(`URL: ${camp.url}`);
    if (camp.notes) parts.push(camp.notes);
    parts.push(`${c("ultimaVerificacion")}: ${formatDate(camp.lastCheckedAt)}`);
    return `- ${parts.join(" · ")}`;
  });

  const veredaPath = (slug: string) =>
    `${SITE_URL}/md/ciudad/${municipio.divipolaCode}/${slug}${locale === "en" ? "?locale=en" : ""}`;
  const veredaLines = municipio.veredas.map(
    (v) => `- [${v.name}](${veredaPath(v.slug)}) — ${veredaKindLabel(v.kind, locale)}, ${v._count.aidPoints}`,
  );

  const populationLine = municipio.populationDane
    ? ` · ${formatNumber(municipio.populationDane)} ${c("poblacionDane")}`
    : "";

  const title = t("metaTitle", { city: municipio.name });
  const description = t("metaDescription", { city: municipio.name, department: municipio.department.name });
  const path = locale === "en" ? `/en/ciudad/${municipio.divipolaCode}` : `/ciudad/${municipio.divipolaCode}`;

  const markdown = `---
title: "${title} — SOSColombia"
description: "${description}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${municipio.name}

${municipio.department.name} · DIVIPOLA ${municipio.divipolaCode}${populationLine}

## ${t("cifras")}

${tollLines.length > 0 ? tollLines.join("\n") : t("sinCifras")}
${veredaLines.length > 0 ? `\n## ${t("veredas")}\n\n${veredaLines.join("\n")}\n` : ""}
## ${t("puntosDeAyuda")}

${aidSections.length > 0 ? aidSections.join("\n\n") : t("sinPuntosDeAyuda")}

## ${t("campanasDeRecaudacion")}

${campaignLines.length > 0 ? campaignLines.join("\n") : `${locale === "en" ? "No fundraising campaign specific to this city yet — see" : "Ninguna campaña de recaudación específica para esta ciudad todavía — mira"} [${locale === "en" ? "the general donation page" : "las campañas generales"}](${SITE_URL}/md/donar${locale === "en" ? "?locale=en" : ""}).`}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
