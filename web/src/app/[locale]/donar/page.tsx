import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CampaignCard } from "@/components/data/CampaignCard";
import { AidPointCard } from "@/components/data/AidPointCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Short revalidation window instead of force-dynamic: donation status/raised
// amounts don't change second-to-second, and this keeps a traffic spike from
// hitting the database on every request.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donar" });
  return { title: t("title"), description: t("lede") };
}

export default async function DonarPage(props: PageProps<"/[locale]/donar">) {
  // Awaiting params before getTranslations (even though the value isn't used
  // directly) is what lets this route qualify for static rendering + ISR --
  // without it, next-intl resolves the locale through a path Next treats as
  // a Dynamic API, forcing the whole route to server-render on every request.
  await props.params;
  const t = await getTranslations("donar");
  const [campaigns, monetaryPoints] = await Promise.all([
    prisma.crowdfundingCampaign.findMany({
      // International campaigns get their own page (/donar/internacional) —
      // without this filter they showed here too, duplicating that page
      // entirely and making the promo card below imply a split that wasn't
      // actually real.
      where: { international: false },
      orderBy: { verificationStatus: "asc" },
      include: { municipios: { select: { name: true, divipolaCode: true } } },
    }),
    prisma.aidPoint.findMany({
      where: { kind: "MONETARY_DONATION" },
      include: { source: true, municipio: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
          {t("scamWarning.heading")}
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-500">
          <li>{t("scamWarning.point1")}</li>
          <li>{t("scamWarning.point2")}</li>
          <li>{t("scamWarning.point3")}</li>
        </ul>
      </Card>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {t("international.text")}
        </p>
        <Link
          href="/donar/internacional"
          className="shrink-0 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {t("international.cta")}
        </Link>
      </Card>

      <SectionHeading first>{t("sections.verified")}</SectionHeading>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verified.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
        {verified.length === 0 && <EmptyState>{t("emptyVerified")}</EmptyState>}
      </div>

      {monetaryPoints.length > 0 && (
        <>
          <SectionHeading>{t("sections.local")}</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {monetaryPoints.map((p) => (
              <div key={p.id}>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
                  {p.municipio.name}
                </p>
                <AidPointCard point={p} />
              </div>
            ))}
          </div>
        </>
      )}

      {individual.length > 0 && (
        <>
          <SectionHeading>{t("sections.individual")}</SectionHeading>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            {t("sections.individualNote")}
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
