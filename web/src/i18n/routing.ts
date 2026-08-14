import { defineRouting } from "next-intl/routing";

// Spanish is the original, already-indexed default — kept prefix-free
// ("as-needed") so every existing /mapa, /cifras, /ciudad/... URL keeps
// working exactly as before. English lives under an /en prefix.
//
// localeDetection is deliberately off: next-intl defaults to redirecting
// bare, unprefixed URLs (e.g. "/") based on the request's Accept-Language
// header on the first hit (before any locale cookie exists). That broke
// the language switcher outright — clicking back to Spanish links to "/",
// which immediately got redirected back to "/en" for any browser sending
// English in Accept-Language, silently undoing the click. It's also bad
// for SEO here: the canonical bare URL should deterministically serve
// Spanish for every visitor and crawler, not vary by request header — the
// whole sitemap/hreflang setup assumes "/" is stably Spanish.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
