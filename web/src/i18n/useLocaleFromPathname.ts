"use client";

import { usePathname } from "next/navigation";
import { routing } from "./routing";

// For client components that render outside the [locale] segment's
// NextIntlClientProvider (SiteHeader and anything it mounts, e.g.
// LanguageSwitcher, Search) -- no next-intl client hook (useLocale,
// useTranslations) has context to read from there, so locale has to come
// from the URL directly instead. Strips ANY known locale prefix, not just
// "/en" -- "as-needed" means "/es" is never required, but next-intl still
// accepts it as a valid alias (e.g. a bookmarked /es/... URL).
const localePrefixPattern = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export function useLocaleFromPathname(): "es" | "en" {
  const pathname = usePathname();
  return pathname.match(localePrefixPattern)?.[1] === "en" ? "en" : "es";
}
