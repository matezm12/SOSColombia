import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { METRIC_LABEL, metricLabel } from "@/lib/labels";
import { datasetCounts } from "@/lib/queries";
import { buildAlternates, absoluteUrl, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic -- see donar/page.tsx
// for why `await props.params` before getTranslations matters here.
export const revalidate = 60;

// Same custom domain as the root layout's SITE_URL -- kept local since
// JSON-LD is the only thing on this page needing an absolute URL (same
// pattern as [locale]/page.tsx and ciudad/[divipola]/page.tsx).
const SITE_URL = "https://www.soscolombia.xyz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "datos" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/datos", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/datos", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function DatosPage(props: PageProps<"/[locale]/datos">) {
  const { locale } = await props.params;
  const t = await getTranslations("datos");

  const { tollRecords, aidPoints, campaigns, reports, contradictions, resources } =
    await datasetCounts();

  // schema.org/Dataset -- points AI/search consumers straight at the real
  // export endpoints instead of leaving them to scrape the HTML. Distinct
  // formats are separate DataDownload entries per schema.org convention;
  // variableMeasured lists what TollRecord actually tracks so a consumer can
  // tell what's in the JSON/CSV without downloading it first.
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t("datasetName"),
    description: t("lede"),
    url: absoluteUrl("/datos", locale),
    isAccessibleForFree: true,
    license: t("license"),
    creator: {
      "@type": "Organization",
      name: "SOSColombia",
      url: SITE_URL,
    },
    variableMeasured: Object.keys(METRIC_LABEL).map((key) => metricLabel(key, locale)),
    distribution: [
      {
        "@type": "DataDownload",
        name: t("distJson"),
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/api/export`,
      },
      {
        "@type": "DataDownload",
        name: t("distCifrasCsv"),
        encodingFormat: "text/csv",
        contentUrl: `${SITE_URL}/api/export/csv/toll-records`,
      },
      {
        "@type": "DataDownload",
        name: t("distAyudaCsv"),
        encodingFormat: "text/csv",
        contentUrl: `${SITE_URL}/api/export/csv/aid-points`,
      },
    ],
  };

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
        {t("resumen", { tollRecords, aidPoints, campaigns, reports, contradictions, resources })}
      </p>

      <SectionHeading first>{t("downloadsHeading")}</SectionHeading>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="font-medium text-black dark:text-zinc-50">{t("jsonTitle")}</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("jsonDescription")}</p>
          <p className="mt-3 text-sm">
            <a href="/api/export" className="font-medium text-link hover:underline">
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
              className="block font-medium text-link hover:underline"
            >
              {t("downloadCifrasCsv")}
            </a>
            <a
              href="/api/export/csv/aid-points"
              className="block font-medium text-link hover:underline"
            >
              {t("downloadAyudaCsv")}
            </a>
          </p>
        </Card>
      </div>

      <SectionHeading>{t("licenseHeading")}</SectionHeading>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">{t("license")}</p>
      <p className="mt-2 text-sm">
        <Link href="/metodologia" className="text-link hover:underline">
          {t("methodologyLink")}
        </Link>
      </p>
    </PageShell>
  );
}
