import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CampaignCard } from "@/components/data/CampaignCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donarInternacional" });
  return { title: t("title"), description: t("lede") };
}

export default async function DonarInternacionalPage() {
  const t = await getTranslations("donarInternacional");
  const campaigns = await prisma.crowdfundingCampaign.findMany({
    where: { international: true },
    orderBy: { verificationStatus: "asc" },
    include: { municipios: { select: { name: true, divipolaCode: true } } },
  });

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

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

      <SectionHeading first>{t("sections.verified")}</SectionHeading>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verified.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
        {verified.length === 0 && <EmptyState>{t("emptyVerified")}</EmptyState>}
      </div>

      {individual.length > 0 && (
        <>
          <SectionHeading>{t("sections.individual")}</SectionHeading>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            {t("sections.individualSubtext")}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {individual.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}

      {flagged.length > 0 && (
        <>
          <SectionHeading>{t("sections.flagged")}</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flagged.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
