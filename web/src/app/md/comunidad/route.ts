import { prisma } from "@/lib/prisma";
import { SOCIAL_PLATFORM_LABEL, SOCIAL_CATEGORY_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the community feed (src/app/[locale]/comunidad/page.tsx).
// SocialPost has no summary/body field of its own (just platform, author
// handle, category, and a permalink) -- oembedHtml is a cached embed blob,
// not prose, so it's left out here and the permalink is the thing a
// crawler/LLM should follow for the actual content. Same query/take(60)/order
// as the real page.
//
// Short revalidation window instead of force-dynamic: posts land
// occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const posts = await prisma.socialPost.findMany({
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: { capturedAt: "desc" },
    take: 60,
  });

  const lines = posts.map((p) => {
    const parts: string[] = [
      `**${SOCIAL_CATEGORY_LABEL[p.category] ?? p.category}** — ${SOCIAL_PLATFORM_LABEL[p.platform] ?? p.platform}`,
    ];
    if (p.authorHandle) parts.push(p.authorHandle);
    if (p.municipio) {
      parts.push(`[${p.municipio.name}](${SITE_URL}/md/ciudad/${p.municipio.divipolaCode})`);
    }
    parts.push(`[ver publicación](${p.permalink})`);
    parts.push(`Capturado: ${formatDate(p.capturedAt)}`);
    return `- ${parts.join(" · ")}`;
  });

  const title = "Comunidad — SOSColombia";
  const description =
    "Publicaciones de Instagram, X, Facebook y TikTok sobre lugares y necesidades que aún no están en el directorio oficial — revisadas antes de publicarse aquí.";

  const markdown = `---
title: "${title}"
description: "${description}"
url: "${SITE_URL}/comunidad"
last_updated: "${new Date().toISOString()}"
---

# Comunidad

${description}

${lines.length > 0 ? lines.join("\n") : "Sin publicaciones todavía."}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
