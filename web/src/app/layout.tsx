import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The stable production alias, which auto-updates on every push to main —
// NOT the per-deployment hash URL (e.g. ...-ri329kr9p-...), which freezes at
// whatever commit was live when that specific preview was built.
const SITE_URL = "https://sos-colombia-matezm12s-projects.vercel.app";
const SITE_TITLE = "SOSColombia — Terremoto 2026";
const SITE_DESCRIPTION =
  "Datos verificados sobre el terremoto de Colombia del 10 de agosto de 2026: cifras oficiales, puntos de ayuda y cómo donar, por ciudad.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — SOSColombia",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "SOSColombia",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
