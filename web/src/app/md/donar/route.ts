import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  CROWDFUNDING_PLATFORM_LABEL,
  VERIFICATION_LABEL,
  AID_STATUS_LABEL,
  TIER_LABEL,
} from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the donation channels page (src/app/[locale]/donar/page.tsx).
// Same two queries (CrowdfundingCampaigns + MONETARY_DONATION AidPoints),
// same three-way verification-status split, same scam-warning content —
// this is the page an LLM answering "how do I donate to Colombia earthquake
// relief" would want to quote, so it must carry the same warnings verbatim.
//
// Verification status / raised amounts change frequently — never cache as
// static build-time output.
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.soscolombia.xyz";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}>;

function formatCampaign(c: CampaignWithMunicipios): string {
  const badges = [VERIFICATION_LABEL[c.verificationStatus] ?? c.verificationStatus];
  if (c.international) badges.push("Internacional");
  if (c.recurring) badges.push("Mensual");

  const lines = [`### ${c.title} (${badges.join(", ")})`, "", c.orgOrPerson];

  if (c.municipios.length > 0) {
    lines.push(
      `Enfoque: ${c.municipios
        .map((m) => `[${m.name}](${SITE_URL}/md/ciudad/${m.divipolaCode})`)
        .join(", ")}`,
    );
  }

  if (c.notes) lines.push(`Nota: ${c.notes}`);

  if (c.goal !== null || c.raised !== null) {
    const parts: string[] = [];
    if (c.raised !== null) parts.push(`Recaudado: ${formatCurrency(c.raised, c.currency)}`);
    if (c.goal !== null) parts.push(`Meta: ${formatCurrency(c.goal, c.currency)}`);
    if (c.donorCount !== null) parts.push(`${formatNumber(c.donorCount)} donantes`);
    lines.push(parts.join(" · "));
  }

  lines.push(`Plataforma: ${CROWDFUNDING_PLATFORM_LABEL[c.platform] ?? c.platform} — ${c.url}`);
  lines.push(`Última verificación: ${formatDate(c.lastCheckedAt)}`);

  return lines.join("\n");
}

type AidPointWithSource = Prisma.AidPointGetPayload<{ include: { source: true; municipio: true } }>;

function formatMonetaryPoint(p: AidPointWithSource): string {
  const lines = [`### ${p.name} — ${p.municipio.name} (${AID_STATUS_LABEL[p.status] ?? p.status})`, ""];
  if (p.address) lines.push(`Dirección: ${p.address}`);
  if (p.phone) lines.push(`Teléfono: ${p.phone}`);
  if (p.accessRestriction) lines.push(`Acceso restringido: ${p.accessRestriction}`);
  if (p.needsText) lines.push(`Necesita: ${p.needsText}`);
  const link = p.permalink ?? p.source.url;
  if (link) lines.push(`[${p.permalink ? "Ver publicación original" : "Ver fuente"}](${link})`);
  lines.push(
    `Fuente: ${p.source.org} (${TIER_LABEL[p.source.tier] ?? `nivel ${p.source.tier}`}) — verificado ${formatDate(p.lastVerifiedAt)}`,
  );
  return lines.join("\n");
}

export async function GET() {
  const [campaigns, monetaryPoints] = await Promise.all([
    prisma.crowdfundingCampaign.findMany({
      orderBy: { verificationStatus: "asc" },
      include: { municipios: { select: { name: true, divipolaCode: true } } },
    }),
    prisma.aidPoint.findMany({
      where: { kind: "MONETARY_DONATION" },
      include: { source: true, municipio: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  const title = "Cómo donar — SOSColombia";
  const description =
    "Organizaciones y campañas verificadas por este proyecto. Cada una lleva un nivel de confianza — verifica tú mismo antes de donar, especialmente en campañas individuales.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/donar"
last_updated: "${new Date().toISOString()}"
---

# Cómo donar

${description}

## Antes de donar

- "SOS Chocó" no es una sola organización — es un lema que usan al menos 5 actores distintos (Manos Visibles, Fundación Plan, FECOER, entre otros). Verifica a cuál organización específica va tu donación antes de confiar en un enlace con ese nombre.
- "Rescatistas LATAM" fue investigado y no se encontró evidencia de que exista como organización real. No dones a través de canales con ese nombre.
- Desconfía de: enlaces compartidos solo por WhatsApp/SMS sin otro rastro, perfiles nuevos y anónimos, presión de urgencia, y "listas exclusivas de víctimas".

¿Donas desde fuera de Colombia? Los canales locales de esta página requieren cuenta bancaria colombiana para algunos casos. Ver [donaciones internacionales](${SITE_URL}/md/donar/internacional).

## Organizaciones verificadas

${verified.length > 0 ? verified.map(formatCampaign).join("\n\n") : "Ninguna todavía."}

## Canales locales e institucionales

${monetaryPoints.length > 0 ? monetaryPoints.map(formatMonetaryPoint).join("\n\n") : "Ninguno todavía."}

## Campañas individuales

Recaudadores individuales, no instituciones — revisa el nivel de confianza de cada una antes de donar.

${individual.length > 0 ? individual.map(formatCampaign).join("\n\n") : "Ninguna todavía."}

## Riesgo de fraude

${flagged.length > 0 ? flagged.map(formatCampaign).join("\n\n") : "Ninguna todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
