import { prisma } from "@/lib/prisma";
import { bestDeathMetric } from "@/lib/queries";
import { SEVERITY_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Markdown mirror of the homepage (src/app/[locale]/page.tsx), served for AI
// crawlers/LLM search at a predictable plain-text URL. Spanish-only for v1 —
// mirrors only the default (unprefixed) locale's content. Queries the exact
// same models/fields the real page renders; no invented data.
//
// Short revalidation window instead of force-dynamic — see [locale]/page.tsx.
// Route Handlers support the same revalidate export as page.tsx.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const [event, municipios] = await Promise.all([
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.municipio.findMany({
      include: {
        department: true,
        tollRecords: {
          where: { metric: { in: ["DEATHS_REPORTED_OFFICIAL", "DEATHS_CONFIRMED_FORENSIC"] } },
        },
      },
      orderBy: { populationDane: "desc" },
    }),
  ]);

  const magnitude = event?.magnitudeSgc != null ? event.magnitudeSgc.toFixed(1) : null;

  const lede = magnitude
    ? `Magnitud ${magnitude} (SGC), epicentro cerca de San José del Palmar, Chocó. Datos verificados de fuentes oficiales — cada cifra lleva su fuente y fecha, nunca un solo número "definitivo".`
    : "Datos verificados de fuentes oficiales — cada cifra lleva su fuente y fecha, nunca un solo número \"definitivo\".";

  const cityLines = municipios.map((m) => {
    const death = bestDeathMetric(m.tollRecords);
    const severity = m.severityLabel ? SEVERITY_LABEL[m.severityLabel] ?? m.severityLabel : null;
    const parts: string[] = [`**${m.name}** (${m.department.name})`];
    if (severity) parts.push(severity);
    if (death) {
      const label =
        death.metric === "DEATHS_CONFIRMED_FORENSIC"
          ? "fallecidos confirmados (Medicina Legal)"
          : "fallecidos reportados";
      parts.push(`${formatNumber(death.value)} ${label}`);
    }
    return `- ${parts.join(" — ")} — [ver ciudad](${SITE_URL}/md/ciudad/${m.divipolaCode})`;
  });

  const title = "SOSColombia — Terremoto de Colombia, 10 de agosto de 2026";
  const description =
    "Datos verificados sobre el terremoto de Colombia del 10 de agosto de 2026: cifras oficiales, puntos de ayuda y cómo donar, por ciudad.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/"
last_updated: "${new Date().toISOString()}"
---

# Terremoto de Colombia — 10 de agosto de 2026

${lede}

## Ciudades

${cityLines.join("\n")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
