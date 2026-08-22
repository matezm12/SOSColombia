import { Fragment } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Search } from "@/components/layout/Search";

// Server component; mobile menu uses a native <details>/<summary>
// disclosure. ThemeToggle and LanguageSwitcher are the client islands.
export async function SiteHeader() {
  const t = await getTranslations("nav");

  // Ayuda/Donar first — the two links someone arriving right after the
  // earthquake actually needs — the rest follow in a secondary group. Same
  // order feeds both the desktop bar and the mobile disclosure below; on
  // mobile PRIMARY_COUNT draws a divider so the priority is visible even
  // one tap deep, not just in list order.
  const NAV_LINKS = [
    { href: "/", label: t("inicio") },
    { href: "/ayuda", label: t("ayuda") },
    { href: "/donar", label: t("donar") },
    { href: "/cifras", label: t("cifras") },
    { href: "/mapa", label: t("mapa") },
    { href: "/donar/internacional", label: t("internacional") },
    { href: "/recursos", label: t("recursos") },
    { href: "/comunidad", label: t("comunidad") },
    { href: "/historias", label: t("historias") },
    { href: "/informes", label: t("informes") },
    { href: "/fuentes", label: t("fuentes") },
    { href: "/metodologia", label: t("metodologia") },
  ];
  const PRIMARY_COUNT = 3; // Inicio, Ayuda, Donar

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
        <Link href="/" className="shrink-0" aria-label="SOSColombia">
          {/* Same-origin static asset (unlike StoryCard/AlliedResourceCard's
              arbitrary externally-hosted images, which can't go through
              next/image without allowlisting every source domain) — and
              above-the-fold on every page, so worth the automatic
              optimization + priority hint. */}
          <Image
            src="/brand/soscolombia-logo.png"
            alt="SOSColombia"
            width={964}
            height={200}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-black hover:decoration-zinc-500 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-zinc-50 dark:hover:decoration-zinc-400"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-3 border-l border-zinc-200 pl-5 dark:border-zinc-800">
            <Button href="/sugerir" size="sm">
              {t("sugerirPunto")}
            </Button>
            <Search />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          <Search />
          <LanguageSwitcher />
          <ThemeToggle />
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {t("menu")}
            </summary>
            <nav className="absolute right-0 z-20 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              {NAV_LINKS.map((link, i) => (
                <Fragment key={link.href}>
                  {i === PRIMARY_COUNT && (
                    <hr className="my-1 border-zinc-100 dark:border-zinc-900" />
                  )}
                  <Link
                    href={link.href}
                    className={
                      i < PRIMARY_COUNT
                        ? "rounded px-2 py-1.5 text-sm font-medium text-black underline decoration-zinc-300 underline-offset-4 hover:bg-zinc-50 hover:decoration-zinc-500 dark:text-zinc-50 dark:decoration-zinc-700 dark:hover:bg-zinc-900 dark:hover:decoration-zinc-400"
                        : "rounded px-2 py-1.5 text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:bg-zinc-50 hover:decoration-zinc-500 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:bg-zinc-900 dark:hover:decoration-zinc-400"
                    }
                  >
                    {link.label}
                  </Link>
                </Fragment>
              ))}
              <Link
                href="/sugerir"
                className="rounded px-2 py-1.5 text-sm font-medium text-black dark:text-zinc-50"
              >
                {t("sugerirPuntoCorto")}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
