import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

/** Constant-time string comparison to avoid leaking length/content via timing (same
 *  approach as web/src/proxy.ts's admin Basic Auth gate). */
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

/**
 * Shared-secret check for the tier-1/tier-2 scheduled-job route handlers
 * (web/src/app/api/cron/*). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * automatically when the CRON_SECRET env var is configured on the project; a
 * `?secret=` query param is also accepted so the routes can be hit manually
 * (e.g. for verification) without crafting a header.
 *
 * Returns false (unauthorized) whenever CRON_SECRET itself isn't configured —
 * an unset secret must never be treated as "no auth required".
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && safeCompare(authHeader.slice("Bearer ".length), expected)) {
    return true;
  }

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret !== null && safeCompare(querySecret, expected);
}
