import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { GovReportCard } from "@/components/data/GovReportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: reports land
// occasionally, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "informes" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/informes", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/informes", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

export default async function InformesPage(props: PageProps<"/[locale]/informes">) {
  // See donar/page.tsx for why this await matters for static rendering.
  const { locale } = await props.params;
  const t = await getTranslations("informes");
  const reports = await prisma.govReport.findMany({ orderBy: { date: "desc" } });

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <GovReportCard key={r.id} report={r} locale={locale} />
        ))}
        {reports.length === 0 && <EmptyState>{t("sinInformes")}</EmptyState>}
      </div>
    </PageShell>
  );
}
