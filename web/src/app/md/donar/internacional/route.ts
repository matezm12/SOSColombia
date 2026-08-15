import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CROWDFUNDING_PLATFORM_LABEL, VERIFICATION_LABEL } from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the international-donations page
// (src/app/[locale]/donar/internacional/page.tsx). Same query as /donar but
// filtered to international:true campaigns, same verification-status split
// and warning content.
//
// Short revalidation window instead of force-dynamic — see donar/page.tsx.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}>;

function formatCampaign(c: CampaignWithMunicipios): string {
  const badges = [VERIFICATION_LABEL[c.verificationStatus] ?? c.verificationStatus];
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

export async function GET() {
  const campaigns = await prisma.crowdfundingCampaign.findMany({
    where: { international: true },
    orderBy: { verificationStatus: "asc" },
    include: { municipios: { select: { name: true, divipolaCode: true } } },
  });

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  const title = "Donaciones internacionales — SOSColombia";
  const description =
    "Canales que puedes usar desde cualquier país — aceptan tarjeta extranjera o PayPal, sin necesidad de cuenta bancaria colombiana. Para transferencias locales en pesos y puntos por ciudad, ve a la página de donación general.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/donar/internacional"
last_updated: "${new Date().toISOString()}"
---

# Donaciones internacionales

${description}

Ver también: [donación general](${SITE_URL}/md/donar).

## Antes de donar

- Verifica el nivel de confianza de cada campaña — "Verificado" solo significa que confirmamos la organización, no que respaldamos su gestión de fondos.
- Las campañas GoFundMe con organizador individual (no institución) llevan una nota cuando encontramos algo digno de mención — léela antes de donar.
- Desconfía de canales compartidos solo por WhatsApp/SMS sin otro rastro y de presión de urgencia.

## Organizaciones verificadas

${verified.length > 0 ? verified.map(formatCampaign).join("\n\n") : "Ninguna todavía."}

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
