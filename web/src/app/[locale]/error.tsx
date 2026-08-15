"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { PageShell } from "@/components/layout/PageShell";
import { Link } from "@/i18n/navigation";

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
        <button
          onClick={reset}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {t("backHome")}
        </Link>
      </div>
    </PageShell>
  );
}
