import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localizedStory } from "@/lib/stories";

// Markdown mirror of a single story (src/app/[locale]/historias/[slug]/page.tsx).
// Bilingual via ?locale=en (default es): story content comes from its own
// bilingual titleEs/titleEn, ledeEs/ledeEn, bodyEs/bodyEn DB columns via
// localizedStory() (src/lib/stories.ts) — admin-authored, not machine-
// translated, same as the real page. Citation labels come from the shared
// "historias" and "mdCommon" message namespaces.
export const revalidate = 60;

// See ciudad's /md mirror for why this is needed for ISR instead of fully
// dynamic rendering.
export async function generateStaticParams() {
  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return stories.map((s) => ({ slug: s.slug }));
}

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(
  request: Request,
  ctx: RouteContext<"/md/historias/[slug]">,
) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const { slug } = await ctx.params;

  const [t, c] = await Promise.all([
    getTranslations({ locale, namespace: "historias" }),
    getTranslations({ locale, namespace: "mdCommon" }),
  ]);

  const story = await prisma.story.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      municipio: { select: { name: true, divipolaCode: true } },
      campaign: { select: { title: true, orgOrPerson: true, url: true } },
      socialPost: { select: { permalink: true } },
    },
  });

  if (!story) {
    return new Response(`# ${c("noEncontradaTitle")}\n\n${c("noEncontradaHistoria")}\n`, {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const { title, lede, body } = localizedStory(story, locale);

  const citationLines: string[] = [];
  if (story.campaign) {
    citationLines.push(
      `- ${story.campaign.title} — ${story.campaign.orgOrPerson}: ${story.campaign.url}`,
    );
  }
  if (story.socialPost) {
    citationLines.push(`- ${c("publicacionOriginal")}: ${story.socialPost.permalink}`);
  }
  if (story.municipio) {
    const cityPath = `${SITE_URL}/md/ciudad/${story.municipio.divipolaCode}${locale === "en" ? "?locale=en" : ""}`;
    citationLines.push(`- ${c("ciudad")}: [${story.municipio.name}](${cityPath})`);
  }

  const path = locale === "en" ? `/en/historias/${story.slug}` : `/historias/${story.slug}`;

  const markdown = `---
title: "${title} — SOSColombia"
description: "${lede}"
url: "${SITE_URL}${path}"
author: "${story.authorName}"
published: "${(story.publishedAt ?? story.createdAt).toISOString()}"
last_updated: "${story.updatedAt.toISOString()}"
---

# ${title}

${lede}

*${story.authorName}*

${body}

${citationLines.length > 0 ? `## ${t("basadoEn")}\n\n${citationLines.join("\n")}` : ""}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
