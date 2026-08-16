import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SOCIAL_PLATFORM_LABEL, socialCategoryLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

// Markdown mirror of the community feed (src/app/[locale]/comunidad/page.tsx).
// SocialPost has no summary/body field of its own (just platform, author
// handle, category, and a permalink) -- oembedHtml is a cached embed blob,
// not prose, so it's left out here and the permalink is the thing a
// crawler/LLM should follow for the actual content. Same query/take(60)/order
// as the real page. Bilingual via ?locale=en (default es) — see
// /md/donar/route.ts for the pattern this follows.
//
// Short revalidation window instead of force-dynamic: posts land
// occasionally, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "comunidad" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const posts = await prisma.socialPost.findMany({
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: { capturedAt: "desc" },
    take: 60,
  });

  const lines = posts.map((p) => {
    const parts: string[] = [
      `**${socialCategoryLabel(p.category, locale)}** — ${SOCIAL_PLATFORM_LABEL[p.platform] ?? p.platform}`,
    ];
    if (p.authorHandle) parts.push(p.authorHandle);
    if (p.municipio) {
      const cityPath = `${SITE_URL}/md/ciudad/${p.municipio.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
      parts.push(`[${p.municipio.name}](${cityPath})`);
    }
    parts.push(`[${c("verPublicacion")}](${p.permalink})`);
    parts.push(`${c("capturado")}: ${formatDate(p.capturedAt)}`);
    return `- ${parts.join(" · ")}`;
  });

  const path = locale === "en" ? "/en/comunidad" : "/comunidad";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${lines.length > 0 ? lines.join("\n") : t("empty")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
