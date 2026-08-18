import { loader } from "fumadocs-core/source";
import { defineI18n } from "fumadocs-core/i18n";
import { docs } from "../../.source/server";

// es is unprefixed, en lives at /en/docs/** -- same "as-needed" convention as
// the rest of the site's next-intl routing (src/i18n/routing.ts), just
// implemented by hand: /docs sits outside next-intl's [locale] segment on
// purpose (see docs/[[...slug]]/layout.tsx's comment), so this mirrors the
// URL shape without actually depending on next-intl. Default file naming
// (parser: "dot") is `page.mdx` for es, `page.en.mdx` for en -- matches the
// content/docs/*.mdx files already in place before English was added.
export const docsI18n = defineI18n({
  languages: ["es", "en"],
  defaultLanguage: "es",
  hideLocale: "default-locale",
});

// Loads content/docs/**/*.mdx (see ../../source.config.ts) into a page tree
// for the /docs section's layout + [[...slug]] page.
export const docsSource = loader({
  baseUrl: "/docs",
  i18n: docsI18n,
  source: docs.toFumadocsSource(),
});
