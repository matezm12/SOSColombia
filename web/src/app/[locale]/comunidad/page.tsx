import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CommunityPostCard } from "@/components/data/CommunityPostCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <CommunityPostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && <EmptyState>{t("empty")}</EmptyState>}
      </div>
    </PageShell>
  );
}
