import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

// Short revalidation window instead of force-dynamic -- see donar/page.tsx
// for why `await props.params` before getTranslations matters here.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "datos" });
  return { title: t("title"), description: t("lede") };
}

export default async function DatosPage(props: PageProps<"/[locale]/datos">) {
  await props.params;
  const t = await getTranslations("datos");

  const [tollRecords, aidPoints, campaigns, reports, contradictions, resources] =
    await Promise.all([
      prisma.tollRecord.count(),
      prisma.aidPoint.count(),
      prisma.crowdfundingCampaign.count(),
      prisma.govReport.count(),
      prisma.contradiction.count(),
      prisma.alliedResource.count({ where: { status: { not: "DEAD" } } }),
    ]);

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
        {t("resumen", { tollRecords, aidPoints, campaigns, reports, contradictions, resources })}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="font-medium text-black dark:text-zinc-50">{t("jsonTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("jsonDescription")}</p>
          <p className="mt-3 text-sm">
            <a href="/api/export" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              {t("downloadJson")}
            </a>
          </p>
        </Card>

        <Card>
          <p className="font-medium text-black dark:text-zinc-50">{t("csvTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("csvDescription")}</p>
          <p className="mt-3 space-y-1 text-sm">
            <a
              href="/api/export/csv/toll-records"
              className="block font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("downloadCifrasCsv")}
            </a>
            <a
              href="/api/export/csv/aid-points"
              className="block font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("downloadAyudaCsv")}
            </a>
          </p>
        </Card>
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">{t("license")}</p>
      <p className="mt-2 text-sm">
        <Link href="/metodologia" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("methodologyLink")}
        </Link>
      </p>
    </PageShell>
  );
}
