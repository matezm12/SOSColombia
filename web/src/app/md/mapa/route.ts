import { prisma } from "@/lib/prisma";
import { SEVERITY_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Markdown mirror of the map page (src/app/[locale]/mapa/page.tsx). A map is
// inherently visual, so instead of trying to describe pixel positions this
// mirror gives crawlers the same underlying data as a table: coordinates,
// severity, population, death toll, aid-point count per city, plus the two
// epicenter readings (SGC/USGS differ slightly, both real pages show both).
//
// Coordinates can be backfilled between deploys — never cache as static
// build-time output.
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
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
      epicenterLines.push(
        `- **Epicentro (SGC):** ${event.epicenterLatSgc}, ${event.epicenterLngSgc}`,
      );
    }
    if (event.epicenterLatUsgs != null && event.epicenterLngUsgs != null) {
      epicenterLines.push(
        `- **Epicentro (USGS):** ${event.epicenterLatUsgs}, ${event.epicenterLngUsgs}`,
      );
    }
    if (event.magnitudeSgc != null) {
      epicenterLines.push(`- **Magnitud (SGC):** ${event.magnitudeSgc.toFixed(1)}`);
    }
    if (event.magnitudeUsgs != null) {
      epicenterLines.push(`- **Magnitud (USGS):** ${event.magnitudeUsgs.toFixed(1)}`);
    }
  }

  const tableRows = municipios.map((m) => {
    const severity = m.severityLabel ? SEVERITY_LABEL[m.severityLabel] ?? m.severityLabel : "—";
    const population = m.populationDane != null ? formatNumber(m.populationDane) : "—";
    const deaths = m.tollRecords[0]?.value != null ? formatNumber(m.tollRecords[0].value) : "—";
    const aidPoints = m._count.aidPoints;
    return `| [${m.name}](${SITE_URL}/md/ciudad/${m.divipolaCode}) | ${m.divipolaCode} | ${severity} | ${population} | ${deaths} | ${aidPoints} | ${m.lat}, ${m.lng} |`;
  });

  const title = "Mapa — SOSColombia";
  const description =
    "Ubicación de las ciudades con datos verificados y el epicentro del sismo del 10 de agosto de 2026 en Colombia (SGC y USGS).";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/mapa"
last_updated: "${new Date().toISOString()}"
---

# Mapa

Ubicación de las ciudades con datos verificados y el epicentro del sismo (SGC y USGS difieren ligeramente, se muestran ambos).

## Epicentro

${epicenterLines.length > 0 ? epicenterLines.join("\n") : "Sin datos de epicentro cargados todavía."}

## Ciudades

${
  tableRows.length > 0
    ? `| Ciudad | DIVIPOLA | Severidad | Población (DANE) | Fallecidos reportados | Puntos de ayuda | Coordenadas |
| --- | --- | --- | --- | --- | --- | --- |
${tableRows.join("\n")}`
    : "Sin coordenadas cargadas todavía."
}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
