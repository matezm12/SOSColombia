import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/layout/PageShell";

export default async function GraciasPage() {
  const t = await getTranslations("comunidadSugerirGracias");

  return (
    <PageShell width="narrow">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("titulo")}
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          {t("cuerpo")}
        </p>
        <Link
          href="/comunidad"
          className="mt-8 inline-block text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          {t("volver")}
        </Link>
      </div>
    </PageShell>
  );
}
