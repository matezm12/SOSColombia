import { cache } from "react";
import { cookies } from "next/headers";
import type { Volunteer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  scopeFor,
} from "@/lib/session";

// Node-only helpers (next/headers + Prisma) kept out of src/lib/session.ts
// so proxy.ts's per-request hot path never pulls in the DB client — see the
// comment at the top of session.ts.

/**
 * Authoritative check for use in pages/server actions: reads the session
 * cookie, verifies it, then does a live Prisma lookup so a just-revoked
 * volunteer is rejected immediately rather than waiting for their cookie
 * to expire (proxy.ts, by contrast, only checks the cookie's signature —
 * see session.ts's module comment for why).
 *
 * Wrapped in React's cache() so admin/layout.tsx's session bar and a page's
 * own auth check (e.g. /admin/volunteers) share one Prisma lookup per
 * request instead of two — matters given the 15-connection pool cap.
 */
export const getCurrentVolunteer = cache(async () => {
  const cookieStore = await cookies();
  const payload = verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const volunteer = await prisma.volunteer.findUnique({ where: { id: payload.vid } });
  if (!volunteer || !volunteer.active) return null;

  return volunteer;
});

/** Mints and sets the session cookie for a freshly-authenticated volunteer. */
export async function createSession(volunteer: Volunteer) {
  const token = signSession({
    vid: volunteer.id,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    scope: scopeFor(volunteer),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: "/admin" });
}

/**
 * Live-checked authorization for a moderation action — used by the
 * approve/reject server actions in admin/{moderacion,comunidad,boletines}.
 * Returns the volunteer if they're active and scoped for this section
 * (or isAdmin), otherwise null. This is the actual gate: proxy.ts's
 * token-based check only gates page navigation, not mutations.
 */
export async function requireScope(section: "moderacion" | "comunidad" | "boletines") {
  const volunteer = await getCurrentVolunteer();
  if (!volunteer) return null;

  const flag =
    section === "moderacion"
      ? volunteer.canModeracion
      : section === "comunidad"
        ? volunteer.canComunidad
        : volunteer.canBoletines;

  if (!volunteer.isAdmin && !flag) return null;
  return volunteer;
}
