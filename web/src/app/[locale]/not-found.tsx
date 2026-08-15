import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <PageShell title={t("notFoundTitle")} lede={t("notFoundBody")}>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {t("notFoundCta")}
      </Link>
    </PageShell>
  );
}
