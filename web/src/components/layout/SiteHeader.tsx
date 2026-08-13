import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cifras", label: "Cifras" },
  { href: "/mapa", label: "Mapa" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/donar", label: "Donar" },
  { href: "/informes", label: "Informes" },
  { href: "/fuentes", label: "Fuentes" },
  { href: "/metodologia", label: "Metodología" },
];

// Server component — no client JS needed for the mobile menu, a native
// <details>/<summary> disclosure handles it.
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
              className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
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
        </nav>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Menú
          </summary>
          <nav className="absolute right-0 z-20 mt-2 flex w-56 flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
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
    </header>
  );
}
