import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { TollCard } from "@/components/data/TollCard";
import { AidPointCard } from "@/components/data/AidPointCard";
import CiudadMapaClient from "@/components/map/CiudadMapaClientLazy";
import { CampaignCard } from "@/components/data/CampaignCard";
import { AlliedResourceCard } from "@/components/data/AlliedResourceCard";
import { StoryCard } from "@/components/data/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SubsectionHeading } from "@/components/ui/SubsectionHeading";
import { AID_KIND_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
import { buildAlternates, absoluteUrl, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: figures update via
// cron/moderation, not per-second, so a 60s cache keeps things fresh without
// a DB round trip on every request.
export const revalidate = 60;

// Without this, the [divipola] segment has no known values at build time and
// the route falls back to fully dynamic regardless of `revalidate` above —
// pre-rendering the currently-tracked cities is what makes ISR apply here.
// New municipios added later still work: Next renders and caches them on
// first request (generateStaticParams doesn't need to be exhaustive).
export async function generateStaticParams() {
  const municipios = await prisma.municipio.findMany({ select: { divipolaCode: true } });
  return municipios.map((m) => ({ divipola: m.divipolaCode }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; divipola: string }>;
}): Promise<Metadata> {
  const { locale, divipola } = await params;
  const municipio = await prisma.municipio.findUnique({
    where: { divipolaCode: divipola },
    include: { department: true },
  });
  if (!municipio) return {};

  const t = await getTranslations({ locale, namespace: "ciudad" });
  const title = t("metaTitle", { city: municipio.name });
  const description = t("metaDescription", {
    city: municipio.name,
    department: municipio.department.name,
  });
  return {
    title,
    description,
    alternates: buildAlternates(`/ciudad/${divipola}`, locale),
    openGraph: buildOpenGraph({ title, description, path: `/ciudad/${divipola}`, locale }),
    twitter: buildTwitter({ title, description, locale }),
  };
}

export default async function CiudadPage(
  props: PageProps<"/[locale]/ciudad/[divipola]">
) {
  const { locale, divipola } = await props.params;
  const t = await getTranslations("ciudad");

  const municipio = await prisma.municipio.findUnique({
    where: { divipolaCode: divipola },
    include: {
      department: true,
      tollRecords: {
        include: { source: true },
        orderBy: [{ metric: "asc" }, { asOf: "desc" }],
      },
      aidPoints: {
        include: { source: true },
        orderBy: { kind: "asc" },
      },
      campaigns: {
        include: {
          municipios: { select: { name: true, divipolaCode: true } },
          stories: { where: { status: "PUBLISHED" }, select: { slug: true }, take: 1 },
        },
      },
      resources: {
        where: { status: { not: "DEAD" } },
        orderBy: [{ tier: "asc" }, { name: "asc" }],
      },
      stories: {
        where: { status: "PUBLISHED" },
        include: { campaign: { select: { platform: true, url: true } } },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!municipio) notFound();

  // Latest value per metric — full history stays visible below, never overwritten in the DB itself.
  const latestByMetric = new Map<string, (typeof municipio.tollRecords)[number]>();
  for (const record of municipio.tollRecords) {
    if (!latestByMetric.has(record.metric)) latestByMetric.set(record.metric, record);
  }

  const aidByKind = Object.groupBy(municipio.aidPoints, (a) => a.kind);
  const geocodedAidPoints = municipio.aidPoints
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({ id: a.id, name: a.name, kind: a.kind, lat: a.lat as number, lng: a.lng as number }));

  // Structured data for the municipio being shown — only real, fetched fields.
  // lat/lng are nullable in the DB (Municipio.lat / Municipio.lng), so the geo
  // block is omitted entirely (not emitted with null coordinates) when absent.
  const municipioSchema = {
    "@context": "https://schema.org",
    "@type": "City",
    name: municipio.name,
    url: absoluteUrl(`/ciudad/${municipio.divipolaCode}`, locale),
    identifier: municipio.divipolaCode,
    address: {
      "@type": "PostalAddress",
      addressLocality: municipio.name,
      addressRegion: municipio.department.name,
      addressCountry: "CO",
    },
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: municipio.department.name,
    },
    ...(municipio.lat != null && municipio.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: municipio.lat,
            longitude: municipio.lng,
          },
        }
      : {}),
    ...(municipio.populationDane != null
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "population",
            value: municipio.populationDane,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(municipioSchema) }}
      />
      <PageShell
        backHref="/"
        backLabel={t("volver")}
        title={municipio.name}
      >
        <p className="-mt-2 text-zinc-500 dark:text-zinc-500">
          {t("subtitulo", {
            department: municipio.department.name,
            code: municipio.divipolaCode,
          })}
          {municipio.populationDane &&
            t("subtituloPoblacion", {
              population: formatNumber(municipio.populationDane),
            })}
        </p>

        {municipio.alertNote && (
          <p className="mt-2 rounded-md bg-severity-critica/10 px-3 py-2 text-sm font-medium text-severity-critica">
            {municipio.alertNote}
          </p>
        )}

        <SectionHeading first>{t("cifras")}</SectionHeading>
        <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          {[...latestByMetric.values()].map((record) => (
            <TollCard key={record.id} record={record} />
          ))}
          {latestByMetric.size === 0 && (
            <EmptyState>{t("sinCifras")}</EmptyState>
          )}
        </div>

        <SectionHeading>{t("puntosDeAyuda")}</SectionHeading>
        {geocodedAidPoints.length > 0 && (
          <div className="mt-4">
            <CiudadMapaClient points={geocodedAidPoints} divipolaCode={municipio.divipolaCode} />
          </div>
        )}
        <div className="mt-4 space-y-6">
          {Object.entries(aidByKind).map(([kind, points]) => (
            <div key={kind}>
              <SubsectionHeading>{AID_KIND_LABEL[kind] ?? kind}</SubsectionHeading>
              <ul className="mt-2 space-y-2">
                {points?.map((point) => (
                  <li key={point.id}>
                    <AidPointCard point={point} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {municipio.aidPoints.length === 0 && (
            <EmptyState>{t("sinPuntosDeAyuda")}</EmptyState>
          )}
        </div>

        <SectionHeading>{t("campanasDeRecaudacion")}</SectionHeading>
        <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          {municipio.campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
          {municipio.campaigns.length === 0 && (
            <EmptyState>
              {t.rich("sinCampanas", {
                link: (chunks) => (
                  <Link href="/donar" className="underline">
                    {chunks}
                  </Link>
                ),
              })}
            </EmptyState>
          )}
        </div>

        <SectionHeading>{t("proyectosLocales")}</SectionHeading>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {municipio.resources.map((resource) => (
            <AlliedResourceCard key={resource.id} resource={resource} />
          ))}
          {municipio.resources.length === 0 && (
            <EmptyState>
              {t.rich("sinProyectosLocales", {
                link: (chunks) => (
                  <Link href="/recursos" className="underline">
                    {chunks}
                  </Link>
                ),
              })}
            </EmptyState>
          )}
        </div>

        {municipio.stories.length > 0 && (
          <>
            <SectionHeading>{t("historias")}</SectionHeading>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {municipio.stories.map((story) => (
                <StoryCard key={story.id} story={story} locale={locale} />
              ))}
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
