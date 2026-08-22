import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { publicSans } from "@/app/fonts";
import "../globals.css";

// Custom domain (www is canonical — the apex soscolombia.xyz redirects to
// it, per Vercel's domain settings). NOT the *.vercel.app URL: the
// per-deployment hash variant freezes at whatever commit was live when that
// preview was built, and even the stable *-projects.vercel.app alias is
// just a fallback now that a real domain is attached.
const SITE_URL = "https://www.soscolombia.xyz";

// Runs before paint (blocking inline script, no async/defer) so the correct
// theme class is set before the first frame — otherwise a dark-mode user
// would see a flash of the light theme while React hydrates. Kept in the
// stored preference if the user has toggled before; falls back to the OS
// preference otherwise.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s — SOSColombia",
    },
    description: t("description"),
    alternates: buildAlternates("", locale),
    // Explicit, not relying on Next's opengraph-image.tsx file-convention
    // auto-wiring: that file lives at app/opengraph-image.tsx, one level
    // above this independent [locale] root layout (see the multi-root-
    // layout note above), and auto-detection doesn't cross that boundary —
    // the live page shipped with zero og:image/twitter:image meta tags
    // until this was added explicitly. Also this is the layout-level
    // *default* — every page.tsx under [locale] sets its own openGraph via
    // the same buildOpenGraph()/buildTwitter() helpers (Next's metadata
    // merging replaces `openGraph` wholesale per segment, not per field), so
    // this only actually surfaces on routes that don't override it.
    openGraph: buildOpenGraph({ title: t("title"), description: t("description"), path: "", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("description"), locale }),
  };
}

// This is a root layout (declares <html>/<body>) even though it lives one
// level below app/ — see the "multiple root layouts" pattern. app/admin
// has its own separate root layout for the same reason: next-intl's
// server APIs (getTranslations, getLocale, setRequestLocale) turned out to
// be unreliable when called from a layout that sits *above* the [locale]
// segment — the request-scoped locale isn't consistently resolvable there
// yet ("No intl context found", intermittently). Keeping every next-intl
// call inside (or below) this layout avoids that entirely.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale's pages instead of forcing
  // everything dynamic just because the locale is a route param.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${publicSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
