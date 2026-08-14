import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  const FOOTER_LINKS = [
    { href: "/informes", label: t("informesOficiales") },
    { href: "/fuentes", label: t("fuentes") },
    { href: "/metodologia", label: t("metodologia") },
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
        </nav>
      </div>
    </footer>
  );
}
