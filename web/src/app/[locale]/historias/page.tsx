import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { StoryCard } from "@/components/data/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Stories get added/edited occasionally, not per-second — matches the
// revalidate convention already used by recursos/ciudad, not force-dynamic.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "historias" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/historias", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/historias", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function HistoriasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("historias");

  const stories = await prisma.story.findMany({
    where: { status: "PUBLISHED" },
    include: {
      municipio: { select: { name: true } },
      campaign: { select: { platform: true, url: true, orgOrPerson: true, title: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <PageShell width="wide" backHref="/" title={t("title")} lede={t("lede")}>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story, index) => (
          <StoryCard key={story.id} story={story} locale={locale} priority={index === 0} />
        ))}
        {stories.length === 0 && <EmptyState>{t("vacio")}</EmptyState>}
      </div>
    </PageShell>
  );
}
