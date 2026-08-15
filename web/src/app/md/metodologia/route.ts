import { prisma } from "@/lib/prisma";
import { CONTRADICTION_STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the methodology page (src/app/[locale]/metodologia/page.tsx):
// the intro copy plus the open/resolved contradiction registry. Short but
// valuable for LLM search to understand how to weigh this site's numbers.
//
// Short revalidation window instead of force-dynamic: contradictions get
// resolved/added over time, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

function contradictionLines(c: {
  topic: string;
  status: string;
  valueA: string;
  sourceA: string;
  valueB: string;
  sourceB: string;
  resolutionText: string | null;
  loggedAt: Date;
  resolvedAt: Date | null;
}): string {
  const parts: string[] = [
    `### ${c.topic} (${CONTRADICTION_STATUS_LABEL[c.status] ?? c.status})`,
    `- Valor A: ${c.valueA} — ${c.sourceA}`,
    `- Valor B: ${c.valueB} — ${c.sourceB}`,
  ];
  if (c.resolutionText) parts.push(`- Resolución: ${c.resolutionText}`);
  let dateLine = `- Registrada ${formatDate(c.loggedAt)}`;
  if (c.resolvedAt) dateLine += ` · resuelta ${formatDate(c.resolvedAt)}`;
  parts.push(dateLine);
  return parts.join("\n");
}

export async function GET() {
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((c) => c.status === "OPEN");
  const resolved = contradictions.filter((c) => c.status === "RESOLVED");

  const title = "Metodología — SOSColombia";
  const description =
    "Cómo este sitio maneja cifras que cambian de fuente a fuente: nunca se sobrescribe un número con otro, y las discrepancias entre fuentes confiables se registran en vez de resolverse en silencio.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/metodologia"
last_updated: "${new Date().toISOString()}"
---

# Metodología

Las cifras de un desastre cambian de fuente a fuente y de día a día — eso no siempre significa un error. Este sitio nunca sobrescribe un número con otro más nuevo: cada cifra queda registrada con su fuente, su fecha y su nivel de confiabilidad, y se muestra la más reciente sin borrar el historial.

Cuando dos fuentes confiables no coinciden en un mismo dato, lo registramos como una discrepancia en lugar de elegir una de las dos en silencio. Algunas se resuelven con más información; otras quedan abiertas hasta que exista un dato definitivo.

## Discrepancias abiertas

${open.length > 0 ? open.map(contradictionLines).join("\n\n") : "Sin discrepancias abiertas."}

## Discrepancias resueltas

${resolved.length > 0 ? resolved.map(contradictionLines).join("\n\n") : "Sin discrepancias resueltas todavía."}

## Ver más

Historial completo de actividad del sitio: ${SITE_URL}/md/cambios
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
