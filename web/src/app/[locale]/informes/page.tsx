import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { GovReportCard } from "@/components/data/GovReportCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "informes" });
  return { title: t("title"), description: t("lede") };
}

export default async function InformesPage() {
  const t = await getTranslations("informes");
  const reports = await prisma.govReport.findMany({ orderBy: { date: "desc" } });

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <GovReportCard key={r.id} report={r} />
        ))}
        {reports.length === 0 && <EmptyState>{t("sinInformes")}</EmptyState>}
      </div>
    </PageShell>
  );
}
