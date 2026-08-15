import { recentActivity, describeEntry } from "@/lib/changelog";
import { formatDate } from "@/lib/format";

// Markdown mirror of the changelog page (src/app/[locale]/cambios/page.tsx):
// same merged, most-recent-first feed across every append-only table
// (toll records, contradictions, aid points, campaigns, allied resources).
//
// Short revalidation window instead of force-dynamic: this changes as often
// as the underlying tables do, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const entries = await recentActivity();

  const lines = entries.map((entry) => {
    const d = describeEntry(entry);
    return `- **${formatDate(entry.at)}** — ${d.action}: ${d.text} (${SITE_URL}${d.href})`;
  });

  const title = "Cambios recientes — SOSColombia";
  const description =
    "Historial de actividad del sitio: cada cifra nueva, punto de ayuda verificado, campaña revisada, discrepancia registrada y recurso agregado, ordenado por lo más reciente. Nada se sobrescribe -- ver /metodologia y /datos.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/cambios"
last_updated: "${new Date().toISOString()}"
---

# Cambios recientes

${description}

${lines.length > 0 ? lines.join("\n") : "Sin actividad registrada todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
