import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ContradictionCard } from "@/components/data/ContradictionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Short revalidation window instead of force-dynamic: contradictions get
// resolved/added over time, not per-second.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metodologia" });
  return { title: t("title"), description: t("intro1") };
}

export default async function MetodologiaPage(props: PageProps<"/[locale]/metodologia">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("metodologia");
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((c) => c.status === "OPEN");
  const resolved = contradictions.filter((c) => c.status === "RESOLVED");

  return (
    <PageShell width="narrow" backHref="/" title={t("title")}>
      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>{t("intro1")}</p>
        <p>{t("intro2")}</p>
      </div>

      {open.length > 0 && (
        <>
          <SectionHeading first>{t("discrepanciasAbiertas")}</SectionHeading>
          <div className="mt-4 space-y-4">
            {open.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <SectionHeading first={open.length === 0}>{t("discrepanciasResueltas")}</SectionHeading>
          <div className="mt-4 space-y-4">
            {resolved.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {contradictions.length === 0 && (
        <div className="mt-10">
          <EmptyState>{t("sinDiscrepancias")}</EmptyState>
        </div>
      )}
    </PageShell>
  );
}
