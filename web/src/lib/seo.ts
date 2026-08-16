import { routing } from "@/i18n/routing";

// Same custom domain as every other SITE_URL constant in this codebase (see
// [locale]/layout.tsx's fuller comment on why it's the www host, not the
// bare apex or a *.vercel.app URL) — duplicated here rather than imported so
// this stays a standalone helper any page.tsx can pull in on its own.
const SITE_URL = "https://www.soscolombia.xyz";

/** Locale-aware absolute URL for a locale-agnostic path (e.g. "/mapa", "" for home). */
export function absoluteUrl(path: string, locale: string): string {
  return `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`;
}

/**
 * A page's own `alternates` metadata (canonical + es/en/x-default hreflang),
 * built from its locale-agnostic path. Every generateMetadata that doesn't
 * call this inherits the root layout's locale-only default instead, which
 * always points at the locale homepage — that's the bug this exists to keep
 * from recurring page by page. See historias/[slug]/page.tsx for the
 * pattern this generalizes.
 */
export function buildAlternates(path: string, locale: string) {
  return {
    canonical: absoluteUrl(path, locale),
    languages: {
      es: `${SITE_URL}${path}`,
      en: `${SITE_URL}/en${path}`,
      "x-default": `${SITE_URL}${path}`,
    },
  };
}
