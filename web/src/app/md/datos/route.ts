import { prisma } from "@/lib/prisma";

// Markdown mirror of the open-data page (src/app/[locale]/datos/page.tsx).
// Spanish-only, same as every other mirror — see llms.txt.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const [tollRecords, aidPoints, campaigns, reports, contradictions, resources] =
    await Promise.all([
      prisma.tollRecord.count(),
      prisma.aidPoint.count(),
      prisma.crowdfundingCampaign.count(),
      prisma.govReport.count(),
      prisma.contradiction.count(),
      prisma.alliedResource.count({ where: { status: { not: "DEAD" } } }),
    ]);

  const title = "Datos abiertos — SOSColombia";
  const description =
    "Todo el conjunto de datos verificado, listo para descargar y reutilizar. Cada registro lleva su fuente, su fecha y su nivel de confiabilidad, igual que en el resto del sitio.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/datos"
last_updated: "${new Date().toISOString()}"
---

# Datos abiertos

${description}

${tollRecords} cifras · ${aidPoints} puntos de ayuda · ${campaigns} campañas · ${reports} informes · ${contradictions} discrepancias · ${resources} recursos aliados

## Descargas

- Dataset completo (JSON): ${SITE_URL}/api/export
- Cifras (CSV): ${SITE_URL}/api/export/csv/toll-records
- Puntos de ayuda (CSV): ${SITE_URL}/api/export/csv/aid-points

Uso libre, con atribución. Cada dato ya trae su propia fuente citada — mantenla al reutilizar la información. Ver [metodología completa](${SITE_URL}/metodologia).
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
