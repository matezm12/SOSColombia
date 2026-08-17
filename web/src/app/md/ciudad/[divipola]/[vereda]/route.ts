import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  aidKindLabel,
  aidStatusLabel,
  tierLabel,
  crowdfundingPlatformLabel,
  verificationLabel,
  veredaKindLabel,
  SOCIAL_PLATFORM_LABEL,
  socialCategoryLabel,
} from "@/lib/labels";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

// Markdown mirror of the per-vereda page (src/app/[locale]/ciudad/[divipola]/[vereda]/page.tsx).
// Same section shape: aid points, campaigns tagged to this vereda, community
// posts tagged to this vereda. Bilingual via ?locale=en (default es).
export const revalidate = 60;

export async function generateStaticParams() {
  const veredas = await prisma.vereda.findMany({
    select: { slug: true, municipio: { select: { divipolaCode: true } } },
  });
  return veredas.map((v) => ({ divipola: v.municipio.divipolaCode, vereda: v.slug }));
}

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(
  request: Request,
  ctx: RouteContext<"/md/ciudad/[divipola]/[vereda]">,
) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const { divipola, vereda: veredaSlug } = await ctx.params;

  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "ciudad" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const municipio = await prisma.municipio.findUnique({ where: { divipolaCode: divipola } });
  const vereda = municipio
    ? await prisma.vereda.findUnique({
        where: { municipioId_slug: { municipioId: municipio.id, slug: veredaSlug } },
        include: {
          municipio: { include: { department: true } },
          aidPoints: { include: { source: true }, orderBy: { kind: "asc" } },
          campaigns: { include: { municipios: { select: { name: true, divipolaCode: true } } } },
          socialPosts: { include: { municipio: { select: { name: true, divipolaCode: true } } }, orderBy: { capturedAt: "desc" } },
        },
      })
    : null;

  if (!vereda) {
    return new Response(`# ${c("noEncontradaTitle")}\n\n${c("noEncontradaCiudad")}\n`, {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const aidByKind = Object.groupBy(vereda.aidPoints, (a) => a.kind);
  const aidSections = Object.entries(aidByKind).map(([kind, points]) => {
    const lines = (points ?? []).map((p) => {
      const parts: string[] = [`**${p.name}**`];
      parts.push(`${c("estado")}: ${aidStatusLabel(p.status, locale)}`);
      if (p.address) parts.push(`${c("direccion")}: ${p.address}`);
      if (p.phone) parts.push(`${c("tel")}: ${p.phone}`);
      if (p.needsText) parts.push(`${c("necesita")}: ${p.needsText}`);
      const link = p.permalink ?? p.source.url;
      if (link) parts.push(`${c("fuente")}: ${p.source.org} (${tierLabel(p.source.tier, locale)}, ${link})`);
      parts.push(`${c("ultimaVerificacion")}: ${formatDate(p.lastVerifiedAt)}`);
      return `- ${parts.join(" · ")}`;
    });
    return `### ${aidKindLabel(kind, locale)}\n\n${lines.join("\n")}`;
  });

  const campaignLines = vereda.campaigns.map((camp) => {
    const parts: string[] = [`**${camp.title}** — ${camp.orgOrPerson}`];
    parts.push(`${c("plataforma")}: ${crowdfundingPlatformLabel(camp.platform, locale)}`);
    parts.push(`${c("verificacion")}: ${verificationLabel(camp.verificationStatus, locale)}`);
    if (camp.raised !== null) parts.push(`${c("recaudado")}: ${formatCurrency(camp.raised, camp.currency)}`);
    if (camp.goal !== null) parts.push(`${c("metaDonacion")}: ${formatCurrency(camp.goal, camp.currency)}`);
    parts.push(`URL: ${camp.url}`);
    return `- ${parts.join(" · ")}`;
  });

  const communityLines = vereda.socialPosts.map((p) => {
    const parts: string[] = [`**${socialCategoryLabel(p.category, locale)}** — ${SOCIAL_PLATFORM_LABEL[p.platform] ?? p.platform}`];
    if (p.authorHandle) parts.push(p.authorHandle);
    parts.push(`[${c("verPublicacion")}](${p.permalink})`);
    parts.push(`${c("capturado")}: ${formatDate(p.capturedAt)}`);
    return `- ${parts.join(" · ")}`;
  });

  const title = t("metaTitleVereda", { vereda: vereda.name, city: vereda.municipio.name });
  const description = t("metaDescriptionVereda", { vereda: vereda.name, city: vereda.municipio.name });
  const path = locale === "en"
    ? `/en/ciudad/${divipola}/${veredaSlug}`
    : `/ciudad/${divipola}/${veredaSlug}`;

  const markdown = `---
title: "${title} — SOSColombia"
description: "${description}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${vereda.name}

${veredaKindLabel(vereda.kind, locale)} · ${vereda.municipio.name}, ${vereda.municipio.department.name}

## ${t("puntosDeAyuda")}

${aidSections.length > 0 ? aidSections.join("\n\n") : t("sinPuntosDeAyudaVereda")}

## ${t("comoDonar")}

${campaignLines.length > 0 ? campaignLines.join("\n") : "—"}

## ${t("comunidad")}

${communityLines.length > 0 ? communityLines.join("\n") : "—"}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
