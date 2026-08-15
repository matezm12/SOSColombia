import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { TIER_LABEL, SOURCE_STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fuentes" });
  return { title: t("title"), description: t("lede") };
}

export default async function FuentesPage() {
  const t = await getTranslations("fuentes");
  const sources = await prisma.source.findMany({
    include: { _count: { select: { tollRecords: true, aidPoints: true } } },
    orderBy: [{ tier: "asc" }, { org: "asc" }],
  });

  return (
    <PageShell
      width="wide"
      backHref="/"
      title={t("title")}
      lede={t("lede")}
    >
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2 font-medium">{t("table.organizacion")}</th>
              <th className="px-4 py-2 font-medium">{t("table.nivel")}</th>
              <th className="px-4 py-2 font-medium">{t("table.estado")}</th>
              <th className="px-4 py-2 font-medium">{t("table.datosDerivados")}</th>
              <th className="px-4 py-2 font-medium">{t("table.verificada")}</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                  {s.url?.startsWith("http") ? (
                    <ExternalLink href={s.url}>{s.org}</ExternalLink>
                  ) : (
                    s.org
                  )}
                </td>
                <td className="px-4 py-2">
                  <Badge variant="tier" value={s.tier}>{TIER_LABEL[s.tier] ?? `nivel ${s.tier}`}</Badge>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  {SOURCE_STATUS_LABEL[s.status] ?? s.status}
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-500">
                  {s._count.tollRecords + s._count.aidPoints} {t("registros")}
                </td>
                <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                  {s.lastFetchedAt ? formatDate(s.lastFetchedAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
