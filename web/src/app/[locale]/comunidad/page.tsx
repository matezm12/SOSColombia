import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CommunityFeed } from "@/components/data/CommunityFeed";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: community posts land
// occasionally, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comunidad" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/comunidad", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/comunidad", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

export default async function ComunidadPage(props: PageProps<"/[locale]/comunidad">) {
  // See donar/page.tsx for why this await matters for static rendering.
  const { locale } = await props.params;
  const t = await getTranslations("comunidad");
  const posts = await prisma.socialPost.findMany({
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: { capturedAt: "desc" },
    take: 60,
  });

  return (
    <PageShell
      width="wide"
      backHref="/"
      title={t("title")}
      lede={t("lede")}
    >
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {t("prompt")}
        </p>
        <Button href="/comunidad/sugerir" size="sm" className="shrink-0">
          {t("cta")}
        </Button>
      </Card>

      {posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState>{t("empty")}</EmptyState>
        </div>
      ) : (
        <CommunityFeed
          posts={posts}
          allLabel={t("filterAll")}
          emptyFilteredLabel={t("emptyFiltered")}
          locale={locale}
        />
      )}
    </PageShell>
  );
}
