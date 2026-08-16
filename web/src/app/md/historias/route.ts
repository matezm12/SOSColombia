import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizedStory } from "@/lib/stories";

// Markdown mirror of the historias index (src/app/[locale]/historias/page.tsx).
// Bilingual via ?locale=en (default es): page chrome comes from the same
// "historias" message namespace the real page uses, and each story's own
// title/lede come from its bilingual titleEs/titleEn, ledeEs/ledeEn DB
// columns via localizedStory() (src/lib/stories.ts) — admin-authored,
// not machine-translated, same discipline as the real page.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const t = await getTranslations({ locale, namespace: "historias" });

  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    include: { municipio: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });

  const lines = stories.map((s) => {
    const { title, lede } = localizedStory(s, locale);
    const parts: string[] = [`**${title}**`];
    if (s.municipio) parts.push(s.municipio.name);
    parts.push(lede);
    const storyPath = `${SITE_URL}/md/historias/${s.slug}${locale === "en" ? "?locale=en" : ""}`;
    parts.push(`[${locale === "en" ? "read more" : "leer más"}](${storyPath})`);
    return `- ${parts.join(" — ")}`;
  });

  const path = locale === "en" ? "/en/historias" : "/historias";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("metaDescription")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("metaDescription")}

${lines.length > 0 ? lines.join("\n") : t("vacio")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
