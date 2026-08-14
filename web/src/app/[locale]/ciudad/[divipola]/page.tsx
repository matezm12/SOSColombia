import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { TollCard } from "@/components/data/TollCard";
import { AidPointCard } from "@/components/data/AidPointCard";
import { CampaignCard } from "@/components/data/CampaignCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { AID_KIND_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Toll figures and aid points update constantly — never freeze at build time.
// (Already rendered dynamically by default due to the [divipola] segment with no
// generateStaticParams, but stated explicitly rather than relying on that implicit
// behavior.)
export const dynamic = "force-dynamic";

export default async function CiudadPage(
  props: PageProps<"/[locale]/ciudad/[divipola]">
) {
  const { divipola } = await props.params;
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
        include: { municipios: { select: { name: true, divipolaCode: true } } },
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

  // Structured data for the municipio being shown — only real, fetched fields.
  // lat/lng are nullable in the DB (Municipio.lat / Municipio.lng), so the geo
  // block is omitted entirely (not emitted with null coordinates) when absent.
  const municipioSchema = {
    "@context": "https://schema.org",
    "@type": "City",
    name: municipio.name,
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

        <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
          {t("cifras")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...latestByMetric.values()].map((record) => (
            <TollCard key={record.id} record={record} />
          ))}
          {latestByMetric.size === 0 && (
            <EmptyState>{t("sinCifras")}</EmptyState>
          )}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
          {t("puntosDeAyuda")}
        </h2>
        <div className="mt-4 space-y-6">
          {Object.entries(aidByKind).map(([kind, points]) => (
            <div key={kind}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {AID_KIND_LABEL[kind] ?? kind}
              </h3>
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

        <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
          {t("campanasDeRecaudacion")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </PageShell>
    </>
  );
}
