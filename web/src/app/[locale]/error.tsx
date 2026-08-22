"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    // eslint-disable-next-line no-console -- only surfacing for Vercel's function logs, no analytics wired up for client error events yet
    console.error(error);
  }, [error]);

  return (
    <PageShell title={t("errorTitle")} lede={t("errorBody")}>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button href="/" variant="secondary">
          {t("backHome")}
        </Button>
      </div>
    </PageShell>
  );
}
