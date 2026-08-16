import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { AlliedResourceCard } from "@/components/data/AlliedResourceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ALLIED_CATEGORY_LABEL } from "@/lib/labels";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: resources get added/
// checked over time, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recursos" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/recursos", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/recursos", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

const CATEGORY_ORDER = [
  "MAP_TRACKER",
  "AID_DIRECTORY",
  "DONATION_PLATFORM",
  "VOLUNTEER_COORDINATION",
  "NEWS_AGGREGATOR",
  "OTHER",
] as const;

export default async function RecursosPage(props: PageProps<"/[locale]/recursos">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("recursos");
  const resources = await prisma.alliedResource.findMany({
    where: { status: { not: "DEAD" } },
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: [{ tier: "asc" }, { name: "asc" }],
  });

  const grouped = Object.groupBy(resources, (r) => r.category);

  return (
    <PageShell
      width="wide"
      backHref="/"
      title={t("title")}
      lede={t("lede")}
    >
      <div className="mt-6 space-y-10">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {ALLIED_CATEGORY_LABEL[cat]}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <AlliedResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </div>
          );
        })}
        {resources.length === 0 && <EmptyState>{t("vacio")}</EmptyState>}
      </div>
    </PageShell>
  );
}
