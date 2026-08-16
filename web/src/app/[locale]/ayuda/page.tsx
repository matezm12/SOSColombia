import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { AidPointCard } from "@/components/data/AidPointCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { AID_KIND_LABEL } from "@/lib/labels";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Deliberately NOT converted to ISR like its sibling pages: the `?tipo=`
// filter reads searchParams, which forces real per-request dynamic rendering
// regardless of any `revalidate` export -- Next can't statically cache a
// route whose output depends on the query string. The unfiltered /md/ayuda
// mirror (bot/LLM traffic) is still ISR-cached; this only affects human
// visitors picking a filter tab.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ayuda" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/ayuda", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/ayuda", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

const KINDS = ["ALBERGUE", "ACOPIO", "HEALTH", "VET", "BLOOD_DONATION", "MONETARY_DONATION"] as const;

export default async function AyudaPage(props: PageProps<"/[locale]/ayuda">) {
  const searchParams = await props.searchParams;
  const kindFilter = typeof searchParams.tipo === "string" ? searchParams.tipo : null;
  const t = await getTranslations("ayuda");

  const points = await prisma.aidPoint.findMany({
    where: kindFilter ? { kind: kindFilter as never } : undefined,
    include: { source: true, municipio: true },
    orderBy: [{ kind: "asc" }, { municipio: { name: "asc" } }],
  });

  const grouped = Object.groupBy(points, (p) => p.kind);

  return (
    <PageShell
      width="wide"
      backHref="/"
      title={t("title")}
      lede={t("lede")}
    >
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/ayuda"
          className={`rounded-full px-3 py-1 text-sm ${!kindFilter ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
        >
          {t("todos")}
        </Link>
        {KINDS.map((k) => (
          <Link
            key={k}
            href={`/ayuda?tipo=${k}`}
            className={`rounded-full px-3 py-1 text-sm ${kindFilter === k ? "bg-black text-white dark:bg-white dark:text-black" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            {AID_KIND_LABEL[k]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-8">
        {Object.entries(grouped).map(([kind, kindPoints]) => (
          <div key={kind}>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              {AID_KIND_LABEL[kind] ?? kind}
            </h2>
            <div className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
              {kindPoints?.map((p) => (
                <div key={p.id}>
                  <Link
                    href={`/ciudad/${p.municipio.divipolaCode}`}
                    className="mb-1 inline-block text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
                  >
                    {p.municipio.name}
                  </Link>
                  <AidPointCard point={p} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {points.length === 0 && <EmptyState>{t("vacio")}</EmptyState>}
      </div>
    </PageShell>
  );
}
