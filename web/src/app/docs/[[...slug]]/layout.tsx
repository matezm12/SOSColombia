import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DocsShell } from "@/components/docs/DocsShell";
import { docsSource } from "@/lib/source";
import "../../globals.css";
import "fumadocs-ui/style.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: { default: "Documentación", template: "%s — Documentación SOSColombia" },
};

// Independent root layout (own <html>/<body>), same pattern as app/admin and
// app/[locale] -- see their fuller comments. Lives at [[...slug]] (not a
// plain docs/layout.tsx) specifically so it receives params.slug, needed to
// tell DocsShell which page tree/locale to render -- see the layout-params
// note in DocsShell's sibling app/en/docs/[[...slug]]/layout.tsx.
//
// /docs (this tree) is Spanish; English lives at the literal sibling route
// app/en/docs/[[...slug]] instead of a [lang] dynamic segment, so /docs
// never runs next-intl's locale routing (see src/proxy.ts's matcher) --
// same reason /admin and /md sit outside [locale] too.
//
// theme.enabled: false (in DocsShell) stops Fumadocs from mounting its own
// next-themes provider -- this site already toggles a `.dark` class on
// <html> via a pre-hydration inline script (see ThemeToggle.tsx), and
// Fumadocs' own CSS keys off that same class. themeSwitch.enabled: false
// hides Fumadocs' built-in toggle button so there's only ever one (the one
// in SiteHeader).
export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
  // SiteHeader/SiteFooter call next-intl's server getTranslations(), which
  // reads the request-scoped locale next-intl's middleware would normally
  // set -- but /docs never runs that middleware (see src/proxy.ts). Pinning
  // it explicitly here is what makes SiteHeader render Spanish nav on this
  // tree (and "en" on the sibling app/en/docs layout) instead of silently
  // depending on routing.defaultLocale's fallback.
  setRequestLocale("es");

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>
          <SiteHeader />
          <DocsShell lang="es" tree={docsSource.getPageTree("es")}>
            {children}
          </DocsShell>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
