import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  const FOOTER_LINKS = [
    { href: "/informes", label: t("informesOficiales") },
    { href: "/fuentes", label: t("fuentes") },
    { href: "/metodologia", label: t("metodologia") },
    { href: "/cambios", label: t("cambios") },
    { href: "/datos", label: t("datosAbiertos") },
    { href: "/sugerir", label: t("sugerirPunto") },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-zinc-500 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <p className="max-w-sm">{t("descripcion")}</p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-800 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:text-zinc-200 dark:hover:decoration-zinc-400"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.instagram.com/soscolombiaco/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("instagram")}
            title={t("instagram")}
            className="text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
              <circle cx="12" cy="12" r="4.5" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="https://github.com/matezm12/SOSColombia"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("github")}
            title={t("github")}
            className="text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
