import { prisma } from "@/lib/prisma";
import { AID_KIND_LABEL, AID_STATUS_LABEL, TIER_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the aid-points directory (src/app/[locale]/ayuda/page.tsx).
// Same query/grouping as the real page (all kinds, no filter applied here —
// the mirror always shows everything so a crawler gets the full directory in
// one request).
//
// Aid-point status/needs change constantly — never freeze at build time.
export const dynamic = "force-dynamic";

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const points = await prisma.aidPoint.findMany({
    include: { source: true, municipio: true },
    orderBy: [{ kind: "asc" }, { municipio: { name: "asc" } }],
  });

  const grouped = Object.groupBy(points, (p) => p.kind);

  const sections = Object.entries(grouped).map(([kind, kindPoints]) => {
    const lines = (kindPoints ?? []).map((p) => {
      const parts: string[] = [
        `**${p.name}** — ${p.municipio.name} — [ver ciudad](${SITE_URL}/md/ciudad/${p.municipio.divipolaCode})`,
      ];
      parts.push(`Estado: ${AID_STATUS_LABEL[p.status] ?? p.status}`);
      if (p.address) parts.push(`Dirección: ${p.address}`);
      if (p.phone) parts.push(`Tel: ${p.phone}`);
      if (p.accessRestriction) parts.push(`Acceso restringido: ${p.accessRestriction}`);
      if (p.needsText) parts.push(`Necesita: ${p.needsText}`);
      const link = p.permalink ?? p.source.url;
      if (link) parts.push(`Fuente: ${p.source.org} (${TIER_LABEL[p.source.tier] ?? `tier ${p.source.tier}`}, ${link})`);
      parts.push(`Última verificación: ${formatDate(p.lastVerifiedAt)}`);
      return `- ${parts.join(" · ")}`;
    });

    return `## ${AID_KIND_LABEL[kind] ?? kind}\n\n${lines.join("\n")}`;
  });

  const title = "Puntos de ayuda — SOSColombia";
  const description =
    "Todos los puntos de ayuda verificados, de todas las ciudades: albergues, centros de acopio, salud, veterinaria, donación de sangre y donación monetaria.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/ayuda"
last_updated: "${new Date().toISOString()}"
---

# Puntos de ayuda

Todos los puntos de ayuda verificados, de todas las ciudades.

${sections.length > 0 ? sections.join("\n\n") : "Sin puntos de ayuda todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
