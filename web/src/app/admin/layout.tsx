import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getCurrentVolunteer } from "@/lib/volunteer";
import { logoutVolunteer } from "./actions";
import "../globals.css";

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
  title: "Admin — SOSColombia",
  robots: { index: false, follow: false },
};

// Independent root layout (own <html>/<body>) — see the note in
// app/[locale]/layout.tsx. /admin never runs the intl proxy middleware
// (it's volunteer-session-gated instead, see src/proxy.ts and
// src/lib/session.ts), always renders in Spanish, and is deliberately
// excluded from the public [locale] tree.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const volunteer = await getCurrentVolunteer();

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
          {volunteer && (
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-zinc-600 dark:text-zinc-400">Sesión: {volunteer.name}</span>
              <form action={logoutVolunteer}>
                <button type="submit" className="text-zinc-500 hover:underline dark:text-zinc-400">
                  Cerrar sesión
                </button>
              </form>
            </div>
          )}
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
