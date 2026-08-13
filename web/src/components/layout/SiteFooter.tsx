import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/informes", label: "Informes oficiales" },
  { href: "/fuentes", label: "Fuentes" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/sugerir", label: "Sugerir un punto" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Proyecto independiente de datos verificados sobre el terremoto de
          Colombia del 10 de agosto de 2026.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
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
