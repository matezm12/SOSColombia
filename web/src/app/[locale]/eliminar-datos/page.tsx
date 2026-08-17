import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "eliminarDatos" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/eliminar-datos", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/eliminar-datos", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function EliminarDatosPage(props: PageProps<"/[locale]/eliminar-datos">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("eliminarDatos");

  return (
    <PageShell width="narrow" backHref="/" title={t("title")}>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("intro")}</p>

      <SectionHeading>{t("queHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("queTexto")}</p>

      <SectionHeading>{t("comoHeading")}</SectionHeading>
      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>{t("comoTexto")}</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("comoItem1")}</li>
          <li>{t("comoItem2")}</li>
          <li>{t("comoItem3")}</li>
        </ul>
      </div>

      <SectionHeading>{t("tiempoHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("tiempoTexto")}</p>

      <p className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-400 dark:border-zinc-900 dark:text-zinc-600">
        {t("legalTexto")}
      </p>
    </PageShell>
  );
}
