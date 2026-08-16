import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  crowdfundingPlatformLabel,
  verificationLabel,
  aidStatusLabel,
  tierLabel,
} from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

// Markdown mirror of the donation channels page (src/app/[locale]/donar/page.tsx).
// Same two queries (CrowdfundingCampaigns + MONETARY_DONATION AidPoints),
// same three-way verification-status split, same scam-warning content —
// this is the page an LLM answering "how do I donate to Colombia earthquake
// relief" would want to quote, so it must carry the same warnings verbatim.
//
// Bilingual via ?locale=en (default es): reuses the same next-intl message
// files the real page's chrome pulls from (getTranslations works outside
// request scope when given an explicit locale, which is what a route
// handler is). Only page chrome/labels are translated — DB free-text
// (org names, notes) has no English column and stays as entered, same as
// every other Story/campaign field on this site that isn't Story's own
// bilingual titleEs/titleEn-style columns.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}>;

type Labels = Awaited<ReturnType<typeof buildLabels>>;

async function buildLabels(locale: string) {
  const t = await getTranslations({ locale, namespace: "donar" });
  const c = await getTranslations({ locale, namespace: "mdCommon" });
  return { t, c };
}

function formatCampaign(c: CampaignWithMunicipios, locale: string, labels: Labels): string {
  const badges = [verificationLabel(c.verificationStatus, locale)];
  if (c.international) badges.push(labels.c("internacional"));
  if (c.recurring) badges.push(labels.c("mensual"));

  const lines = [`### ${c.title} (${badges.join(", ")})`, "", c.orgOrPerson];

  if (c.municipios.length > 0) {
    lines.push(
      `${labels.c("enfoque")}: ${c.municipios
        .map((m) => `[${m.name}](${SITE_URL}/md/ciudad/${m.divipolaCode})`)
        .join(", ")}`,
    );
  }

  if (c.notes) lines.push(`${labels.c("nota")}: ${c.notes}`);

  if (c.goal !== null || c.raised !== null) {
    const parts: string[] = [];
    if (c.raised !== null) parts.push(`${labels.c("recaudado")}: ${formatCurrency(c.raised, c.currency)}`);
    if (c.goal !== null) parts.push(`${labels.c("metaDonacion")}: ${formatCurrency(c.goal, c.currency)}`);
    if (c.donorCount !== null) parts.push(`${formatNumber(c.donorCount)} ${labels.c("donantes")}`);
    lines.push(parts.join(" · "));
  }

  lines.push(`${labels.c("plataforma")}: ${crowdfundingPlatformLabel(c.platform, locale)} — ${c.url}`);
  lines.push(`${labels.c("ultimaVerificacion")}: ${formatDate(c.lastCheckedAt)}`);

  return lines.join("\n");
}

type AidPointWithSource = Prisma.AidPointGetPayload<{ include: { source: true; municipio: true } }>;

function formatMonetaryPoint(p: AidPointWithSource, locale: string, labels: Labels): string {
  const lines = [`### ${p.name} — ${p.municipio.name} (${aidStatusLabel(p.status, locale)})`, ""];
  if (p.address) lines.push(`${labels.c("direccion")}: ${p.address}`);
  if (p.phone) lines.push(`${labels.c("tel")}: ${p.phone}`);
  if (p.accessRestriction) lines.push(`${labels.c("accesoRestringido")}: ${p.accessRestriction}`);
  if (p.needsText) lines.push(`${labels.c("necesita")}: ${p.needsText}`);
  const link = p.permalink ?? p.source.url;
  if (link) lines.push(`[${p.permalink ? labels.c("publicacionOriginal") : labels.c("fuente")}](${link})`);
  lines.push(
    `${labels.c("fuente")}: ${p.source.org} (${tierLabel(p.source.tier, locale)}) — ${formatDate(p.lastVerifiedAt)}`,
  );
  return lines.join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const labels = await buildLabels(locale);
  const { t } = labels;

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

  const verified = campaigns.filter((camp) => camp.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (camp) => camp.verificationStatus === "PLAUSIBLE" || camp.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((camp) => camp.verificationStatus === "FLAGGED_SCAM");

  const title = `${t("title")} — SOSColombia`;
  const description = t("metaDescription");
  const path = locale === "en" ? "/en/donar" : "/donar";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

## ${t("scamWarning.heading")}

- ${t("scamWarning.point1")}
- ${t("scamWarning.point2")}
- ${t("scamWarning.point3")}

${t("international.text")} [${t("international.cta")}](${SITE_URL}/md/donar/internacional${locale === "en" ? "?locale=en" : ""})

## ${t("sections.verified")}

${verified.length > 0 ? verified.map((camp) => formatCampaign(camp, locale, labels)).join("\n\n") : t("emptyVerified")}

## ${t("sections.local")}

${monetaryPoints.length > 0 ? monetaryPoints.map((p) => formatMonetaryPoint(p, locale, labels)).join("\n\n") : t("emptyVerified")}

## ${t("sections.individual")}

${t("sections.individualNote")}

${individual.length > 0 ? individual.map((camp) => formatCampaign(camp, locale, labels)).join("\n\n") : t("emptyVerified")}

## ${t("sections.flagged")}

${flagged.length > 0 ? flagged.map((camp) => formatCampaign(camp, locale, labels)).join("\n\n") : t("emptyVerified")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
