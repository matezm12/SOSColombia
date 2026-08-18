import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { docsSource } from "@/lib/source";
import "../globals.css";
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
// app/[locale] — see their fuller comments. /docs is Spanish-only (see
// source.config.ts) so it never needs next-intl's locale routing, and it's
// excluded from the intl proxy matcher (src/proxy.ts) for the same reason
// "md" is excluded.
//
// theme.enabled: false stops Fumadocs from mounting its own next-themes
// provider — this site already toggles a `.dark` class on <html> via a
// pre-hydration inline script (see ThemeToggle.tsx), and Fumadocs' own CSS
// keys off that same `.dark` class, so no second theme system is needed.
// themeSwitch.enabled: false hides Fumadocs' built-in toggle button so
// there's only ever one (the one in SiteHeader).
export default function DocsRootLayout({ children }: { children: React.ReactNode }) {
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
        <NextIntlClientProvider locale="es">
          <SiteHeader />
          <RootProvider theme={{ enabled: false }} search={{ options: { api: "/api/docs-search" } }}>
            <DocsLayout
              tree={docsSource.pageTree}
              nav={{ title: "Documentación", url: "/docs" }}
              themeSwitch={{ enabled: false }}
              containerProps={{ className: "flex-1" }}
            >
              {children}
            </DocsLayout>
          </RootProvider>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
