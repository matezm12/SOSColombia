import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terminos" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/terminos", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/terminos", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function TerminosPage(props: PageProps<"/[locale]/terminos">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("terminos");

  return (
    <PageShell width="narrow" backHref="/" title={t("title")}>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">{t("lastUpdated")}</p>

      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>
          {t("intro1")}{" "}
          <Link href="/metodologia" className="text-blue-600 hover:underline dark:text-blue-400">
            {t("introLink")}
          </Link>
          .
        </p>
        <p>{t("intro2")}</p>
      </div>

      <SectionHeading>{t("precisionHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("precisionTexto")}</p>

      <SectionHeading>{t("contribucionesHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("contribucionesTexto")}</p>

      <SectionHeading>{t("datosHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        {t("datosTexto")}{" "}
        <Link href="/datos" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("datosLink")}
        </Link>{" "}
        {t("datosTexto2")}
      </p>

      <SectionHeading>{t("tercerosHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("tercerosTexto")}</p>

      <SectionHeading>{t("responsabilidadHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("responsabilidadTexto")}</p>

      <SectionHeading>{t("cambiosHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("cambiosTexto")}</p>

      <SectionHeading>{t("contactoHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("contactoTexto")}</p>
    </PageShell>
  );
}
