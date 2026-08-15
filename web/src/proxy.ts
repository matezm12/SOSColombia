import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Simple HTTP Basic Auth gate for /admin/*.
//
// There is no real user-auth system yet (see wiki/10-app-architecture.md), and
// /admin/moderacion lets anyone approve/reject public aid-point submissions, so
// this is a stopgap that must never fail open.
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (functionality is unchanged) — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// A proxy.ts file may export only a single proxy function, so locale
// detection (next-intl) and the admin auth gate both live in the one
// `proxy` export below, branching on path — admin/* never runs the intl
// middleware and public routes never run the auth check.

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const REALM_HEADERS = {
  "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"',
} as const;

function unauthorized(message: string) {
  return new NextResponse(message, { status: 401, headers: REALM_HEADERS });
}

/** Constant-time string comparison to avoid leaking length/content via timing. */
function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) {
    // Still perform a comparison of matching length so mismatched-length
    // inputs don't return measurably faster than matching-length ones.
    timingSafeEqual(aBuf, aBuf);
    return false;
  }

  return timingSafeEqual(aBuf, bBuf);
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return intlMiddleware(request);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Security default: if no password is configured, deny all access rather
  // than leaving /admin routes open to the public. Never fail open.
  if (!adminPassword) {
    return new NextResponse(
      "Admin access is not configured: the ADMIN_PASSWORD environment variable is not set. Access denied.",
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice("Basic ".length);

    let decoded: string;
    try {
      decoded = Buffer.from(encoded, "base64").toString("utf-8");
    } catch {
      return unauthorized("Invalid credentials.");
    }

    const separatorIndex = decoded.indexOf(":");
    const username = separatorIndex === -1 ? decoded : decoded.slice(0, separatorIndex);
    const password = separatorIndex === -1 ? "" : decoded.slice(separatorIndex + 1);

    // Compute both comparisons unconditionally (not `&&`-short-circuited) so a
    // correct-username/wrong-password request doesn't take measurably longer
    // than a wrong-username request — that timing gap would partly defeat the
    // point of using timingSafeEqual in the first place.
    const usernameOk = safeCompare(username, ADMIN_USERNAME);
    const passwordOk = safeCompare(password, adminPassword);
    if (usernameOk && passwordOk) {
      return NextResponse.next();
    }
  }

  return unauthorized("Authentication required.");
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
    // Same bug, same fix, for Next's dynamically-generated metadata image
    // routes (opengraph-image, twitter-image, icon, apple-icon): they live
    // at app/opengraph-image.tsx etc. (root level, not under [locale]) and
    // Next serves them at extension-less URLs like /opengraph-image — no
    // dot, so the file-extension exclusion below doesn't catch them either.
    // Without excluding them explicitly here too, every social-media/link
    // unfurl fetch 404s instead of getting the actual share image.
    "/((?!api|md|opengraph-image|twitter-image|icon|apple-icon|_next|_vercel|.*\\..*).*)",
  ],
};
