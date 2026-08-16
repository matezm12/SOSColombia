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

/** Locale-aware generic OG/twitter fallback image — see src/app/api/og/route.tsx. */
export function ogImageUrl(locale: string): string {
  return `${SITE_URL}/api/og?locale=${locale === "en" ? "en" : "es"}`;
}

/**
 * A page's own `openGraph` metadata. Needed on every page, not just ones
 * with a unique image: Next's metadata merging is shallow per top-level key
 * (see generate-metadata.md#merging), so any page that doesn't set its own
 * `openGraph` object inherits the root layout's whole-sale — including its
 * generic title/description — even though that page's own <title>/meta
 * description are already correct. `imageUrl`/`imageAlt` let a page (e.g. a
 * story) supply its own real photo; otherwise this falls back to the
 * locale-aware generic card.
 */
export function buildOpenGraph({
  title,
  description,
  path,
  locale,
  imageUrl,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return {
    title,
    description,
    url: absoluteUrl(path, locale),
    siteName: "SOSColombia",
    locale: locale === "en" ? "en_US" : "es_CO",
    type: "website" as const,
    images: [
      {
        url: imageUrl ?? ogImageUrl(locale),
        width: 1200,
        height: 630,
        alt: imageAlt ?? "SOSColombia",
      },
    ],
  };
}

export function buildTwitter({
  title,
  description,
  locale,
  imageUrl,
}: {
  title: string;
  description: string;
  locale: string;
  imageUrl?: string;
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [imageUrl ?? ogImageUrl(locale)],
  };
}
