import { Public_Sans, Newsreader } from "next/font/google";

// Shared across all four root layouts ([locale], admin, docs, en/docs) so
// there's one place to keep them in sync. Missing one previously would be
// invisible at build time and just render that route tree in the browser's
// default serif fallback.
export const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

// Not applied to <html> in any layout. It's scoped to editorial content
// only (see historias/[slug]/page.tsx) via a wrapper div carrying this
// variable, so pages that never render a serif don't preload one.
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});
