import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cifras", label: "Cifras" },
  { href: "/mapa", label: "Mapa" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/donar", label: "Donar" },
  { href: "/donar/internacional", label: "Internacional" },
  { href: "/informes", label: "Informes" },
  { href: "/fuentes", label: "Fuentes" },
  { href: "/metodologia", label: "Metodología" },
];

// Server component; mobile menu uses a native <details>/<summary>
// disclosure. ThemeToggle is the one client island.
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-wide text-brand"
        >
          SOSColombia
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-black hover:decoration-zinc-500 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-zinc-50 dark:hover:decoration-zinc-400"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sugerir"
            className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Sugerir un punto
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              Menú
            </summary>
            <nav className="absolute right-0 z-20 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded px-2 py-1.5 text-sm text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:bg-zinc-50 hover:decoration-zinc-500 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:bg-zinc-900 dark:hover:decoration-zinc-400"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sugerir"
                className="rounded px-2 py-1.5 text-sm font-medium text-black dark:text-zinc-50"
              >
                Sugerir un punto →
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
