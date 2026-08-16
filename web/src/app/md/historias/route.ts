import { prisma } from "@/lib/prisma";

// Markdown mirror of the historias index (src/app/[locale]/historias/page.tsx).
// Spanish-only, same as every other mirror in this pass — see llms.txt.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    include: { municipio: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });

  const lines = stories.map((s) => {
    const parts: string[] = [`**${s.titleEs}**`];
    if (s.municipio) parts.push(s.municipio.name);
    parts.push(s.ledeEs);
    parts.push(`[leer más](${SITE_URL}/md/historias/${s.slug})`);
    return `- ${parts.join(" — ")}`;
  });

  const title = "Historias — SOSColombia";
  const description =
    "Relatos más largos detrás de algunas campañas de donación y esfuerzos comunitarios específicos — siempre enlazados a la campaña, publicación o ciudad real en la que se basan.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/historias"
last_updated: "${new Date().toISOString()}"
---

# Historias

${description}

${lines.length > 0 ? lines.join("\n") : "Ninguna historia publicada todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
