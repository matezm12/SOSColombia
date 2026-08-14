"use client";

import { usePathname } from "next/navigation";

// Deliberately uses plain next/navigation, not next-intl's navigation
// wrapper: this renders from the root layout (see SiteHeader), which sits
// outside the [locale] segment's NextIntlClientProvider, so no next-intl
// client hook (useLocale, useTranslations, next-intl's usePathname) has
// context to read from here. Plain usePathname() has no such dependency.
export function LanguageSwitcher() {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const bare = isEnglish ? pathname.slice(3) || "/" : pathname;

  const targets = [
    { code: "es" as const, flag: "🇨🇴", label: "Español", href: bare },
    {
      code: "en" as const,
      flag: "🇺🇸",
      label: "English",
      href: bare === "/" ? "/en" : `/en${bare}`,
    },
  ];
  const current = isEnglish ? "en" : "es";

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language / Idioma">
      {targets.map((target) => (
        <a
          key={target.code}
          href={target.href}
          aria-current={current === target.code ? "true" : undefined}
          title={target.label}
          className={`rounded px-1.5 py-1 text-base leading-none transition-opacity ${
            current === target.code ? "opacity-100" : "opacity-40 hover:opacity-80"
          }`}
        >
          {target.flag}
        </a>
      ))}
    </div>
  );
}
