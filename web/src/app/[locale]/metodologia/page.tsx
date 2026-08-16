import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ContradictionCard } from "@/components/data/ContradictionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: contradictions get
// resolved/added over time, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metodologia" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/metodologia", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/metodologia", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function MetodologiaPage(props: PageProps<"/[locale]/metodologia">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("metodologia");
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((c) => c.status === "OPEN");
  const resolved = contradictions.filter((c) => c.status === "RESOLVED");

  return (
    <PageShell width="narrow" backHref="/" title={t("title")}>
      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>{t("intro1")}</p>
        <p>{t("intro2")}</p>
      </div>

      {open.length > 0 && (
        <>
          <SectionHeading first>{t("discrepanciasAbiertas")}</SectionHeading>
          <div className="mt-4 space-y-4">
            {open.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <SectionHeading first={open.length === 0}>{t("discrepanciasResueltas")}</SectionHeading>
          <div className="mt-4 space-y-4">
            {resolved.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {contradictions.length === 0 && (
        <div className="mt-10">
          <EmptyState>{t("sinDiscrepancias")}</EmptyState>
        </div>
      )}

      <p className="mt-10 border-t border-zinc-100 pt-6 text-sm dark:border-zinc-900">
        <Link href="/cambios" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("cambiosLink")}
        </Link>
      </p>
    </PageShell>
  );
}
