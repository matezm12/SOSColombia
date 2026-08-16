import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { aidKindLabel, aidStatusLabel, tierLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the aid-points directory (src/app/[locale]/ayuda/page.tsx).
// Same query/grouping as the real page (all kinds, no filter applied here —
// the mirror always shows everything so a crawler gets the full directory in
// one request). Bilingual via ?locale=en (default es) — see
// /md/donar/route.ts for the pattern this follows.
//
// Short revalidation window instead of force-dynamic: aid-point status
// changes occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "ayuda" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const points = await prisma.aidPoint.findMany({
    include: { source: true, municipio: true },
    orderBy: [{ kind: "asc" }, { municipio: { name: "asc" } }],
  });

  const grouped = Object.groupBy(points, (p) => p.kind);

  const sections = Object.entries(grouped).map(([kind, kindPoints]) => {
    const lines = (kindPoints ?? []).map((p) => {
      const cityPath = `${SITE_URL}/md/ciudad/${p.municipio.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
      const parts: string[] = [`**${p.name}** — ${p.municipio.name} — [${c("verCiudad")}](${cityPath})`];
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

    return `## ${aidKindLabel(kind, locale)}\n\n${lines.join("\n")}`;
  });

  const path = locale === "en" ? "/en/ayuda" : "/ayuda";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${sections.length > 0 ? sections.join("\n\n") : t("vacio")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
