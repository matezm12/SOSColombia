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
  const t = await getTranslations({ locale, namespace: "privacidad" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildAlternates("/privacidad", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("metaDescription"), path: "/privacidad", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("metaDescription"), locale }),
  };
}

export default async function PrivacidadPage(props: PageProps<"/[locale]/privacidad">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("privacidad");

  return (
    <PageShell width="narrow" backHref="/" title={t("title")}>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">{t("lastUpdated")}</p>

      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>{t("intro1")}</p>
        <p>{t("intro2")}</p>
      </div>

      <SectionHeading>{t("recopilamosHeading")}</SectionHeading>
      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>{t("recopilamosIntro")}</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>{t("recopilamosItem1")}</li>
          <li>{t("recopilamosItem2")}</li>
          <li>{t("recopilamosItem3")}</li>
          <li>{t("recopilamosItem4")}</li>
        </ul>
      </div>

      <SectionHeading>{t("tercerosHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("tercerosTexto")}</p>

      <SectionHeading>{t("conservacionHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        {t("conservacionTexto")}{" "}
        <Link href="/eliminar-datos" className="text-blue-600 hover:underline dark:text-blue-400">
          {t("conservacionLink")}
        </Link>
        .
      </p>

      <SectionHeading>{t("contactoHeading")}</SectionHeading>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t("contactoTexto")}</p>
    </PageShell>
  );
}
