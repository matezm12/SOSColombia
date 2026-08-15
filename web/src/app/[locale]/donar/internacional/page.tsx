import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { InternationalCampaignFilters } from "@/components/data/InternationalCampaignFilters";

// Short revalidation window instead of force-dynamic — see donar/page.tsx.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donarInternacional" });
  return { title: t("title"), description: t("lede") };
}

export default async function DonarInternacionalPage(
  props: PageProps<"/[locale]/donar/internacional">
) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("donarInternacional");
  const campaigns = await prisma.crowdfundingCampaign.findMany({
    where: { international: true },
    orderBy: { verificationStatus: "asc" },
    include: { municipios: { select: { name: true, divipolaCode: true } } },
  });

  return (
    <PageShell
      backHref="/donar"
      backLabel={t("backLabel")}
      title={t("title")}
      lede={t("lede")}
    >
      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
          {t("warningTitle")}
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-500">
          <li>{t("warnings.trustLevel")}</li>
          <li>{t("warnings.individualNote")}</li>
          <li>{t("warnings.distrust")}</li>
        </ul>
      </Card>

      <InternationalCampaignFilters
        campaigns={campaigns}
        labels={{
          typeLabel: t("filters.typeLabel"),
          cityLabel: t("filters.cityLabel"),
          allTypes: t("filters.allTypes"),
          allCities: t("filters.allCities"),
          national: t("filters.national"),
          sectionVerified: t("sections.verified"),
          sectionIndividual: t("sections.individual"),
          individualSubtext: t("sections.individualSubtext"),
          sectionFlagged: t("sections.flagged"),
          emptyVerified: t("emptyVerified"),
          emptyFiltered: t("filters.emptyFiltered"),
        }}
      />
    </PageShell>
  );
}
