import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { bestDeathMetric } from "@/lib/queries";
import { severityLabel as severityLabelFor } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
import MapaClient from "@/components/map/MapaClientLazy";
import type { MunicipioMarker, EpicenterPoint } from "@/components/map/MapaClient";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: coordinates get
// backfilled/updated between deploys, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapa" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/mapa", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/mapa", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

export default async function MapaPage(props: PageProps<"/[locale]/mapa">) {
  const { locale } = await props.params;
  const t = await getTranslations("mapa");
  const [municipios, event] = await Promise.all([
    prisma.municipio.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      orderBy: { populationDane: "desc" },
      include: {
        _count: { select: { aidPoints: true } },
        tollRecords: {
          where: { metric: { in: ["DEATHS_REPORTED_OFFICIAL", "DEATHS_CONFIRMED_FORENSIC"] } },
        },
      },
    }),
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  // Prisma can't be called from a Client Component, so the fetch happens here and only
  // the plain data each marker needs gets passed down.
  const markers: MunicipioMarker[] = municipios.map((m) => {
    const death = bestDeathMetric(m.tollRecords);
    return {
      name: m.name,
      divipolaCode: m.divipolaCode,
      lat: m.lat as number,
      lng: m.lng as number,
      severityLabel: m.severityLabel,
      populationDane: m.populationDane,
      aidPointCount: m._count.aidPoints,
      deathValue: death?.value,
      deathIsForensic: death?.metric === "DEATHS_CONFIRMED_FORENSIC",
    };
  });

  const epicenter: EpicenterPoint | null = event
    ? {
        latSgc: event.epicenterLatSgc,
        lngSgc: event.epicenterLngSgc,
        latUsgs: event.epicenterLatUsgs,
        lngUsgs: event.epicenterLngUsgs,
      }
    : null;

  return (
    <PageShell
      width="wide"
      backHref="/"
      title={t("title")}
      lede={t("lede")}
    >
      <div className="mt-6">
        <MapaClient municipios={markers} epicenter={epicenter} />
      </div>

      {markers.length === 0 ? (
        <div className="mt-6">
          <EmptyState>{t("sinCoordenadas")}</EmptyState>
        </div>
      ) : (
        // Server-rendered, so it's there before the client map's JS loads (or
        // even if it never does). No-JS visitors and screen readers
        // previously got an empty box here (MapaClientLazy is ssr:false),
        // which is the worst outcome on a site whose audience skews rural
        // 2G/3G. Same data the map markers use, just as a real list.
        <>
          <SectionHeading>{t("listaCiudades")}</SectionHeading>
          <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {markers.map((m) => (
              <li key={m.divipolaCode}>
                <Link
                  href={`/ciudad/${m.divipolaCode}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="font-medium text-black dark:text-zinc-50">{m.name}</span>
                  <span className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {m.severityLabel && (
                      <Badge variant="severity" value={m.severityLabel}>
                        {severityLabelFor(m.severityLabel, locale)}
                      </Badge>
                    )}
                    {m.deathValue !== undefined &&
                      `${formatNumber(m.deathValue, locale)} ${m.deathIsForensic ? t("fallecidosConfirmados") : t("fallecidosReportados")}`}
                    <span>
                      {m.aidPointCount} {t("puntosAyudaRegistrados")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
