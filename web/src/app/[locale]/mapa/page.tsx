import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { bestDeathMetric } from "@/lib/queries";
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
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
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

      {markers.length === 0 && (
        <div className="mt-6">
          <EmptyState>{t("sinCoordenadas")}</EmptyState>
        </div>
      )}
    </PageShell>
  );
}
