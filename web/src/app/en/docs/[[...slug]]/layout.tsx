import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DocsShell } from "@/components/docs/DocsShell";
import { docsSource } from "@/lib/source";
import "../../../globals.css";
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
  title: { default: "Documentation", template: "%s — SOSColombia Docs" },
};

// English sibling of app/docs/[[...slug]]/layout.tsx -- see that file's
// comment for why this is a literal /en/docs route tree instead of a
// dynamic [lang] segment, and why setRequestLocale is required here (SiteHeader
// calls next-intl's server getTranslations(), which needs the request-scoped
// locale pinned explicitly since /en/docs never runs next-intl's middleware).
export default function DocsRootLayoutEn({ children }: { children: React.ReactNode }) {
  setRequestLocale("en");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>
          <SiteHeader />
          <DocsShell lang="en" tree={docsSource.getPageTree("en")}>
            {children}
          </DocsShell>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
