import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CommunityFeed } from "@/components/data/CommunityFeed";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildAlternates } from "@/lib/seo";

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
  return { title: t("title"), description: t("lede"), alternates: buildAlternates("/comunidad", locale) };
}

export default async function ComunidadPage(props: PageProps<"/[locale]/comunidad">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
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
        <Link
          href="/comunidad/sugerir"
          className="shrink-0 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {t("cta")}
        </Link>
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
        />
      )}
    </PageShell>
  );
}
