import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { recentActivity, describeEntry } from "@/lib/changelog";
import { formatDate } from "@/lib/format";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Short revalidation window instead of force-dynamic -- see donar/page.tsx
// for why `await props.params` before getTranslations matters here.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cambios" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/cambios", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/cambios", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

export default async function CambiosPage(props: PageProps<"/[locale]/cambios">) {
  await props.params;
  const t = await getTranslations("cambios");
  const entries = await recentActivity();

  return (
    <PageShell backHref="/" title={t("title")} lede={t("lede")}>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        {t("explainer")}{" "}
        <Link href="/datos" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("datosLink")}
        </Link>
      </p>

      {entries.length === 0 && (
        <div className="mt-10">
          <EmptyState>{t("empty")}</EmptyState>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="mt-8 divide-y divide-zinc-100 dark:divide-zinc-900">
          {entries.map((entry, i) => {
            const d = describeEntry(entry);
            return (
              <li
                key={`${entry.type}-${i}`}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="w-28 shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
                  {formatDate(entry.at)}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-medium uppercase tracking-wide text-brand">
                    {d.action}
                  </span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    <Link href={d.href} className="hover:underline">
                      {d.text}
                    </Link>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
