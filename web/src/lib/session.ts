import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";

// Volunteer login sessions for /admin/*. Replaces the old single shared
// Basic-Auth password (src/proxy.ts) with per-person accounts.
//
// Sessions are a signed, stateless cookie (HMAC-SHA256 over a JSON payload,
// no session table) rather than a DB-backed session — proxy.ts verifies the
// signature on every /admin/* request with no database round trip, which
// matters given this project's Supabase pooler is capped at 15 connections
// (see the EMAXCONNSESSION history in wiki/10-app-architecture.md). The
// tradeoff: a revoked/rescoped volunteer's existing cookie stays valid until
// it expires (SESSION_MAX_AGE_SECONDS below). That's bounded and acceptable
// because every *mutating* action re-checks the volunteer live against the
// DB via getCurrentVolunteer() in src/lib/volunteer.ts — a stale cookie can
// at worst keep viewing a pending queue read-only, never approve/reject
// anything post-revocation.
//
// This module is intentionally free of `next/headers`/Prisma imports so
// proxy.ts (which runs on every /admin/* request) can import just the
// crypto it needs without pulling in the DB client — see
// src/lib/volunteer.ts for the DB-touching getCurrentVolunteer() helper.

export const SESSION_COOKIE = "sos_admin_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type VolunteerScope = {
  moderacion: boolean;
  comunidad: boolean;
  boletines: boolean;
  admin: boolean;
};

export type SessionPayload = {
  vid: string;
  exp: number; // unix seconds
  scope: VolunteerScope;
};

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set — cannot sign or verify admin sessions.",
    );
  }
  return secret;
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

/** Signs a session payload into a "<payload>.<signature>" token. Throws if SESSION_SECRET is unset. */
export function signSession(payload: SessionPayload): string {
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload)));
  const signature = createHmac("sha256", sessionSecret())
    .update(payloadB64)
    .digest();
  return `${payloadB64}.${base64url(signature)}`;
}

/**
 * Verifies a session token's signature and expiry. Returns the payload if
 * valid, or null otherwise — never throws, so a missing/unset SESSION_SECRET
 * or malformed cookie fails closed (treated as logged out) rather than
 * crashing the request.
 */
export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payloadB64 = token.slice(0, dotIndex);
  const signatureB64 = token.slice(dotIndex + 1);

  let secret: string;
  try {
    secret = sessionSecret();
  } catch {
    return null;
  }

  const expectedSignature = createHmac("sha256", secret).update(payloadB64).digest();
  let providedSignature: Buffer;
  try {
    providedSignature = Buffer.from(signatureB64, "base64url");
  } catch {
    return null;
  }

  if (providedSignature.length !== expectedSignature.length) {
    // Still run a same-length comparison so this branch isn't measurably faster.
    timingSafeEqual(expectedSignature, expectedSignature);
    return null;
  }
  if (!timingSafeEqual(providedSignature, expectedSignature)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return null;
  }

  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

/** scrypt password hash, stored as "saltHex:hashHex". */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const separatorIndex = stored.indexOf(":");
  if (separatorIndex === -1) return false;

  const salt = stored.slice(0, separatorIndex);
  const expectedHex = stored.slice(separatorIndex + 1);
  const expected = Buffer.from(expectedHex, "hex");
  const candidate = scryptSync(plain, salt, 64);

  if (candidate.length !== expected.length) {
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(candidate, expected);
}

export function scopeFor(volunteer: {
  canModeracion: boolean;
  canComunidad: boolean;
  canBoletines: boolean;
  isAdmin: boolean;
}): VolunteerScope {
  return {
    moderacion: volunteer.canModeracion,
    comunidad: volunteer.canComunidad,
    boletines: volunteer.canBoletines,
    admin: volunteer.isAdmin,
  };
}
