import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple HTTP Basic Auth gate for /admin/*.
//
// There is no real user-auth system yet (see wiki/10-app-architecture.md), and
// /admin/moderacion lets anyone approve/reject public aid-point submissions, so
// this is a stopgap that must never fail open.
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (functionality is unchanged) — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.

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
  matcher: "/admin/:path*",
};
