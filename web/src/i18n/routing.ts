import { defineRouting } from "next-intl/routing";

// Spanish is the original, already-indexed default — kept prefix-free
// ("as-needed") so every existing /mapa, /cifras, /ciudad/... URL keeps
// working exactly as before. English lives under an /en prefix.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
