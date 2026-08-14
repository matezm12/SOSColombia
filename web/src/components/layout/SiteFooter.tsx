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
        <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-800 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:text-zinc-200 dark:hover:decoration-zinc-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
