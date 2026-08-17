import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { AidPointCard } from "@/components/data/AidPointCard";
import { CampaignCard } from "@/components/data/CampaignCard";
import { CommunityPostCard } from "@/components/data/CommunityPostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { veredaKindLabel } from "@/lib/labels";
import { buildAlternates, absoluteUrl, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Same reasoning as the parent /ciudad/[divipola] page: a short revalidation
// window instead of force-dynamic, and generateStaticParams so this segment
// isn't fully dynamic despite `revalidate` above.
export const revalidate = 60;

export async function generateStaticParams() {
  const veredas = await prisma.vereda.findMany({
    select: { slug: true, municipio: { select: { divipolaCode: true } } },
  });
  return veredas.map((v) => ({ divipola: v.municipio.divipolaCode, vereda: v.slug }));
}

async function getVereda(divipola: string, veredaSlug: string) {
  const municipio = await prisma.municipio.findUnique({ where: { divipolaCode: divipola } });
  if (!municipio) return null;
  return prisma.vereda.findUnique({
    where: { municipioId_slug: { municipioId: municipio.id, slug: veredaSlug } },
    include: {
      municipio: { include: { department: true } },
      aidPoints: { include: { source: true, vereda: true }, orderBy: { kind: "asc" } },
      campaigns: {
        include: {
          municipios: { select: { name: true, divipolaCode: true } },
          stories: { where: { status: "PUBLISHED" }, select: { slug: true }, take: 1 },
        },
      },
      socialPosts: {
        include: { municipio: { select: { name: true, divipolaCode: true } } },
        orderBy: { capturedAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; divipola: string; vereda: string }>;
}): Promise<Metadata> {
  const { locale, divipola, vereda: veredaSlug } = await params;
  const vereda = await getVereda(divipola, veredaSlug);
  if (!vereda) return {};

  const t = await getTranslations({ locale, namespace: "ciudad" });
  const title = t("metaTitleVereda", { vereda: vereda.name, city: vereda.municipio.name });
  const description = t("metaDescriptionVereda", { vereda: vereda.name, city: vereda.municipio.name });
  const path = `/ciudad/${divipola}/${veredaSlug}`;
  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: buildOpenGraph({ title, description, path, locale }),
    twitter: buildTwitter({ title, description, locale }),
  };
}

export default async function VeredaPage(
  props: PageProps<"/[locale]/ciudad/[divipola]/[vereda]">
) {
  const { locale, divipola, vereda: veredaSlug } = await props.params;
  const t = await getTranslations("ciudad");

  const vereda = await getVereda(divipola, veredaSlug);
  if (!vereda) notFound();

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: vereda.name,
    url: absoluteUrl(`/ciudad/${divipola}/${veredaSlug}`, locale),
    containedInPlace: {
      "@type": "City",
      name: vereda.municipio.name,
      identifier: vereda.municipio.divipolaCode,
    },
    ...(vereda.lat != null && vereda.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: vereda.lat, longitude: vereda.lng } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <PageShell
        backHref={`/ciudad/${divipola}`}
        backLabel={t("volverCiudad", { city: vereda.municipio.name })}
        title={vereda.name}
        lede={`${veredaKindLabel(vereda.kind, locale)} · ${vereda.municipio.name}, ${vereda.municipio.department.name}`}
      >
        <SectionHeading first>{t("puntosDeAyuda")}</SectionHeading>
        <div className="mt-4 space-y-2">
          {vereda.aidPoints.map((point) => (
            <AidPointCard key={point.id} point={point} locale={locale} />
          ))}
          {vereda.aidPoints.length === 0 && (
            <EmptyState>{t("sinPuntosDeAyudaVereda")}</EmptyState>
          )}
        </div>

        {vereda.campaigns.length > 0 && (
          <>
            <SectionHeading>{t("comoDonar")}</SectionHeading>
            <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
              {vereda.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} locale={locale} />
              ))}
            </div>
          </>
        )}

        {vereda.socialPosts.length > 0 && (
          <>
            <SectionHeading>{t("comunidad")}</SectionHeading>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {vereda.socialPosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </>
        )}
      </PageShell>
    </>
  );
}
