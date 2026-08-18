import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE, verifySession, type VolunteerScope } from "@/lib/session";

// Per-volunteer session gate for /admin/*, replacing the old single shared
// Basic-Auth password. See wiki/10-app-architecture.md and src/lib/session.ts's
// module comment for the full design (signed stateless cookie, no DB call
// here — that's what keeps this cheap on every /admin/* request given the
// Supabase pooler's 15-connection cap).
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (functionality is unchanged, and as of v16 it defaults to the Node.js
// runtime rather than Edge — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
// A proxy.ts file may export only a single proxy function, so locale
// detection (next-intl) and the admin session gate both live in the one
// `proxy` export below, branching on path — admin/* never runs the intl
// middleware and public routes never run the session check.

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Which scope flag a given /admin path requires. `null` = public (the login
 * page itself). `"any"` = any logged-in volunteer, regardless of scope (the
 * landing page and logout).
 */
function requiredScope(pathname: string): keyof VolunteerScope | "any" | null {
  if (pathname === "/admin/login") return null;
  if (pathname.startsWith("/admin/moderacion")) return "moderacion";
  if (pathname.startsWith("/admin/comunidad")) return "comunidad";
  if (pathname.startsWith("/admin/boletines")) return "boletines";
  if (pathname.startsWith("/admin/volunteers")) return "admin";
  if (pathname.startsWith("/admin/historias")) return "admin";
  return "any";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route matching is case-sensitive, but crawlers/copy-pasted links/manual
  // typing aren't -- confirmed live that /MAPA, /HISTORIAS/<slug>,
  // /Ciudad/76001 etc. all resolved directly with 200 instead of 404ing or
  // redirecting, a duplicate-content surface alongside the real lowercase
  // URL. Every real route on this site is lowercase-only, so any uppercase-
  // containing pathname is unambiguously a duplicate. Runs before both the
  // admin gate and the intl middleware so it applies uniformly.
  const lowerPathname = pathname.toLowerCase();
  if (pathname !== lowerPathname) {
    const url = request.nextUrl.clone();
    url.pathname = lowerPathname;
    return NextResponse.redirect(url, 308);
  }

  if (!pathname.startsWith("/admin")) {
    return intlMiddleware(request);
  }

  const required = requiredScope(pathname);
  if (required === null) {
    return NextResponse.next();
  }

  const payload = verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!payload) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (required !== "any" && !payload.scope[required] && !payload.scope.admin) {
    // Logged in, but not scoped for this section — send them to the landing
    // page, which only shows the sections they actually have access to.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // next-intl's recommended pattern: run on every path except API routes,
    // Next internals, and any request for a file with an extension
    // (favicon.ico, sitemap.xml, robots.txt, llms.txt, images, etc.).
    //
    // "md" is excluded too: src/app/md/** hosts plain-markdown mirror routes
    // for AI crawlers, built as a sibling tree of [locale] (not nested under
    // it, and using route.ts not page.tsx — see src/app/md/route.ts). Without
    // this exclusion the intl middleware rewrites e.g. /md -> /es/md before
    // Next's router sees it, and since /es/md doesn't exist as a route, every
    // /md/* request 404s. This is the same reason "api" is excluded.
    //
    // "docs" is the same bug, same fix, for the Fumadocs-powered docs section
    // (src/app/docs/**, Spanish-only): it's also a sibling root layout
    // outside [locale] (see docs/layout.tsx's comment), so /docs would 308 to
    // /es/docs and 404 without this exclusion.
    //
    // Same bug, same fix, for Next's dynamically-generated metadata image
    // routes (opengraph-image, twitter-image, icon, apple-icon): they live
    // at app/opengraph-image.tsx etc. (root level, not under [locale]) and
    // Next serves them at extension-less URLs like /opengraph-image — no
    // dot, so the file-extension exclusion below doesn't catch them either.
    // Without excluding them explicitly here too, every social-media/link
    // unfurl fetch 404s instead of getting the actual share image.
    "/((?!api|md|docs|opengraph-image|twitter-image|icon|apple-icon|_next|_vercel|.*\\..*).*)",
  ],
};
