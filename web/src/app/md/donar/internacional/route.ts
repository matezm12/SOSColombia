import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { crowdfundingPlatformLabel, verificationLabel } from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the international-donations page
// (src/app/[locale]/donar/internacional/page.tsx). Same query as /donar but
// filtered to international:true campaigns, same verification-status split
// and warning content. Bilingual via ?locale=en (default es) — see
// /md/donar/route.ts for the pattern this follows.
//
// Short revalidation window instead of force-dynamic — see donar/page.tsx.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}>;

type MdCommonT = Awaited<ReturnType<typeof getTranslations>>;

function formatCampaign(camp: CampaignWithMunicipios, locale: string, c: MdCommonT): string {
  const badges = [verificationLabel(camp.verificationStatus, locale)];
  if (camp.recurring) badges.push(c("mensual"));

  const lines = [`### ${camp.title} (${badges.join(", ")})`, "", camp.orgOrPerson];

  if (camp.municipios.length > 0) {
    lines.push(
      `${c("enfoque")}: ${camp.municipios
        .map((m) => `[${m.name}](${SITE_URL}/md/ciudad/${m.divipolaCode}${locale === "en" ? "?locale=en" : ""})`)
        .join(", ")}`,
    );
  }

  if (camp.notes) lines.push(`${c("nota")}: ${camp.notes}`);

  if (camp.goal !== null || camp.raised !== null) {
    const parts: string[] = [];
    if (camp.raised !== null) parts.push(`${c("recaudado")}: ${formatCurrency(camp.raised, camp.currency)}`);
    if (camp.goal !== null) parts.push(`${c("metaDonacion")}: ${formatCurrency(camp.goal, camp.currency)}`);
    if (camp.donorCount !== null) parts.push(`${formatNumber(camp.donorCount)} ${c("donantes")}`);
    lines.push(parts.join(" · "));
  }

  lines.push(`${c("plataforma")}: ${crowdfundingPlatformLabel(camp.platform, locale)} — ${camp.url}`);
  lines.push(`${c("ultimaVerificacion")}: ${formatDate(camp.lastCheckedAt)}`);

  return lines.join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "donarInternacional" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const campaigns = await prisma.crowdfundingCampaign.findMany({
    where: { international: true },
    orderBy: { verificationStatus: "asc" },
    include: { municipios: { select: { name: true, divipolaCode: true } } },
  });

  const verified = campaigns.filter((camp) => camp.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (camp) => camp.verificationStatus === "PLAUSIBLE" || camp.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((camp) => camp.verificationStatus === "FLAGGED_SCAM");

  const path = locale === "en" ? "/en/donar/internacional" : "/donar/internacional";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${locale === "en" ? "See also" : "Ver también"}: [${locale === "en" ? "general donations" : "donación general"}](${SITE_URL}/md/donar${locale === "en" ? "?locale=en" : ""}).

## ${t("warningTitle")}

- ${t("warnings.trustLevel")}
- ${t("warnings.individualNote")}
- ${t("warnings.distrust")}

## ${t("sections.verified")}

${verified.length > 0 ? verified.map((camp) => formatCampaign(camp, locale, c)).join("\n\n") : t("emptyVerified")}

## ${t("sections.individual")}

${t("sections.individualSubtext")}

${individual.length > 0 ? individual.map((camp) => formatCampaign(camp, locale, c)).join("\n\n") : t("emptyVerified")}

## ${t("sections.flagged")}

${flagged.length > 0 ? flagged.map((camp) => formatCampaign(camp, locale, c)).join("\n\n") : t("emptyVerified")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
