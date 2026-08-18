"use client";

import { usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

// Deliberately uses plain next/navigation, not next-intl's navigation
// wrapper: this renders from the root layout (see SiteHeader), which sits
// outside the [locale] segment's NextIntlClientProvider, so no next-intl
// client hook (useLocale, useTranslations, next-intl's usePathname) has
// context to read from here. Plain usePathname() has no such dependency.
// (Search.tsx has the same constraint but only needs the locale flag, not
// the stripped path this needs too -- see i18n/useLocaleFromPathname.ts.)
//
// Flags are inline SVGs, not Unicode flag emoji (🇨🇴/🇺🇸): Windows has no
// system font that renders the regional-indicator-pair emoji as an actual
// flag glyph, so on Windows Chrome/Edge those sequences fall back to
// showing the raw two-letter code as plain text ("CO"/"US") — small,
// easy to misread as UI chrome, and easy to miss-click since the text
// glyphs render narrower than the emoji they're standing in for. SVGs
// render identically everywhere.
function FlagCO({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="3" height="2" fill="#FCD116" />
      <rect width="3" height="1" y="1" fill="#003893" />
      <rect width="3" height="0.5" y="1.5" fill="#CE1126" />
    </svg>
  );
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19 10" className={className} aria-hidden="true">
      <rect width="19" height="10" fill="#B22234" />
      {[1, 3, 5, 7, 9].map((y) => (
        <rect key={y} width="19" height="0.77" y={y - 0.77} fill="#fff" />
      ))}
      <rect width="7.6" height="5.38" fill="#3C3B6E" />
    </svg>
  );
}

// Strips ANY known locale prefix, not just "/en" — "as-needed" means "/es"
// is never required, but next-intl still accepts it as a valid alias (e.g.
// a bookmarked or manually-typed /es/... URL). Stripping only "/en" left
// a literal "/es" prefix in `bare`, so switching to English from an /es/...
// URL built "/en/es/..." — a route that doesn't exist.
const localePrefixPattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export function LanguageSwitcher() {
  const pathname = usePathname();
  const localeMatch = pathname.match(localePrefixPattern);
  const isEnglish = localeMatch?.[1] === "en";
  const bare = localeMatch ? pathname.slice(localeMatch[0].length) || "/" : pathname;

  const targets = [
    { code: "es" as const, Flag: FlagCO, label: "Español", href: bare },
    {
      code: "en" as const,
      Flag: FlagUS,
      label: "English",
      href: bare === "/" ? "/en" : `/en${bare}`,
    },
  ];
  const current = isEnglish ? "en" : "es";

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Language / Idioma">
      {targets.map(({ code, Flag, label, href }) => (
        <a
          key={code}
          href={href}
          aria-current={current === code ? "true" : undefined}
          title={label}
          className={`flex h-8 w-8 items-center justify-center rounded-md border transition-opacity ${
            current === code
              ? "border-zinc-300 opacity-100 dark:border-zinc-700"
              : "border-transparent opacity-45 hover:opacity-90"
          }`}
        >
          <Flag className="h-4 w-4 rounded-[2px] object-cover ring-1 ring-black/10 dark:ring-white/10" />
        </a>
      ))}
    </div>
  );
}
