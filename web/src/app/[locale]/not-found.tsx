import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <PageShell title={t("notFoundTitle")} lede={t("notFoundBody")}>
      <Button href="/" className="mt-6">
        {t("notFoundCta")}
      </Button>
    </PageShell>
  );
}
