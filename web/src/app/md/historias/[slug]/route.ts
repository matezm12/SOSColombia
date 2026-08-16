import { prisma } from "@/lib/prisma";

// Markdown mirror of a single story (src/app/[locale]/historias/[slug]/page.tsx).
// Spanish-only, same as every other mirror — see llms.txt.
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
  _req: Request,
  ctx: RouteContext<"/md/historias/[slug]">,
) {
  const { slug } = await ctx.params;

  const story = await prisma.story.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      municipio: { select: { name: true, divipolaCode: true } },
      campaign: { select: { title: true, orgOrPerson: true, url: true } },
      socialPost: { select: { permalink: true } },
    },
  });

  if (!story) {
    return new Response("# No encontrada\n\nNo existe ninguna historia con ese slug.\n", {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  const citationLines: string[] = [];
  if (story.campaign) {
    citationLines.push(
      `- ${story.campaign.title} — ${story.campaign.orgOrPerson}: ${story.campaign.url}`,
    );
  }
  if (story.socialPost) {
    citationLines.push(`- Publicación original: ${story.socialPost.permalink}`);
  }
  if (story.municipio) {
    citationLines.push(
      `- Ciudad: [${story.municipio.name}](${SITE_URL}/md/ciudad/${story.municipio.divipolaCode})`,
    );
  }

  const title = `${story.titleEs} — SOSColombia`;

  const markdown = `---
title: "${title}"
description: "${story.ledeEs}"
url: "${SITE_URL}/historias/${story.slug}"
author: "${story.authorName}"
published: "${(story.publishedAt ?? story.createdAt).toISOString()}"
last_updated: "${story.updatedAt.toISOString()}"
---

# ${story.titleEs}

${story.ledeEs}

*${story.authorName}*

${story.bodyEs}

${citationLines.length > 0 ? `## Basado en\n\n${citationLines.join("\n")}` : ""}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
