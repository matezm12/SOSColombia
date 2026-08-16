import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { severityLabel } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Markdown mirror of the map page (src/app/[locale]/mapa/page.tsx). A map is
// inherently visual, so instead of trying to describe pixel positions this
// mirror gives crawlers the same underlying data as a table: coordinates,
// severity, population, death toll, aid-point count per city, plus the two
// epicenter readings (SGC/USGS differ slightly, both real pages show both).
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
//
// Short revalidation window instead of force-dynamic: coordinates get
// backfilled between deploys, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c, home] = await Promise.all([
    getTranslations({ locale, namespace: "mapa" }),
    getTranslations({ locale, namespace: "mdCommon" }),
    getTranslations({ locale, namespace: "home" }),
  ]);

  const [municipios, event] = await Promise.all([
    prisma.municipio.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      orderBy: { populationDane: "desc" },
      include: {
        _count: { select: { aidPoints: true } },
        tollRecords: {
          where: { metric: "DEATHS_REPORTED_OFFICIAL" },
          orderBy: { asOf: "desc" },
          take: 1,
        },
      },
    }),
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  const epicenterLines: string[] = [];
  if (event) {
    if (event.epicenterLatSgc != null && event.epicenterLngSgc != null) {
      epicenterLines.push(`- **${t("epicentroSgc")}:** ${event.epicenterLatSgc}, ${event.epicenterLngSgc}`);
    }
    if (event.epicenterLatUsgs != null && event.epicenterLngUsgs != null) {
      epicenterLines.push(`- **${t("epicentroUsgs")}:** ${event.epicenterLatUsgs}, ${event.epicenterLngUsgs}`);
    }
    if (event.magnitudeSgc != null) {
      epicenterLines.push(`- **${c("magnitud")} (SGC):** ${event.magnitudeSgc.toFixed(1)}`);
    }
    if (event.magnitudeUsgs != null) {
      epicenterLines.push(`- **${c("magnitud")} (USGS):** ${event.magnitudeUsgs.toFixed(1)}`);
    }
  }

  const tableRows = municipios.map((m) => {
    const severity = m.severityLabel ? severityLabel(m.severityLabel, locale) : "—";
    const population = m.populationDane != null ? formatNumber(m.populationDane) : "—";
    const deaths = m.tollRecords[0]?.value != null ? formatNumber(m.tollRecords[0].value) : "—";
    const aidPoints = m._count.aidPoints;
    const cityPath = `${SITE_URL}/md/ciudad/${m.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
    return `| [${m.name}](${cityPath}) | ${m.divipolaCode} | ${severity} | ${population} | ${deaths} | ${aidPoints} | ${m.lat}, ${m.lng} |`;
  });

  const path = locale === "en" ? "/en/mapa" : "/mapa";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

## ${c("epicentro")}

${epicenterLines.length > 0 ? epicenterLines.join("\n") : t("sinCoordenadas")}

## ${home("ciudades")}

${
  tableRows.length > 0
    ? `| ${c("ciudad")} | DIVIPOLA | ${t("severidad")} | ${c("poblacionDane")} | ${t("fallecidosReportados")} | ${c("puntosDeAyuda")} | ${c("coordenadas")} |
| --- | --- | --- | --- | --- | --- | --- |
${tableRows.join("\n")}`
    : t("sinCoordenadas")
}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
