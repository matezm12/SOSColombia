import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

export const dynamic = "force-dynamic";

// Tier 2 sources (wiki/10-app-architecture.md): structured bulletins with no API,
// checked for newer numbered releases than what's already on file.
//
// Scope note (deliberate, not an oversight): this route DETECTS and REPORTS a newer
// bulletin, it does not yet INSERT a new TollRecord row. The architecture doc's tier-2
// design calls for inserting into a staging/review path (the same pattern PendingAidPoint
// already uses for aid points — see web/src/app/admin/moderacion) once a newer bulletin
// is confirmed. That staging step is real follow-up work, not built here: wiring it up
// blind, with no bulletin ever having been auto-parsed and reviewed yet, risked shipping
// an unreviewed number straight into the append-only toll history. Detect-and-report first,
// then build the staging insert once this route's detection has proven reliable over a
// few real cycles — tracked in wiki/16-deferred-queue.md.
const INMLCF_NEWS_URL = "https://www.medicinalegal.gov.co/web/guest/noticias";
const RELIEFWEB_005_URL =
  "https://reliefweb.int/report/colombia/colombia-flash-update-005-actualizacion-afectaciones-por-terremoto-en-colombia";

// Last known numbered bulletins on file as of this route's writing — see
// wiki/03-death-toll.md (INMLCF Comunicado Oficial No. 06, 2026-08-12) and
// wiki/05-gov-reports.md (OCHA Flash Update 004). Bump these once a real
// human-reviewed cycle confirms a newer bulletin, per the architecture doc's
// tier-2 "needs a human glance before publish early on" note.
const LAST_KNOWN_INMLCF_COMUNICADO = 6;

// wiki/06-sources.md documents that medicinalegal.gov.co and reliefweb.int both reject
// plain server-side fetch()/curl-style requests here (the project previously saw a TLS
// failure on medicinalegal.gov.co and an HTTP 403 on reliefweb.int) and only loaded
// cleanly via a real logged-in browser (claude-in-chrome browser automation). That's a
// known, expected limitation of a serverless cron route — not a bug to fix — so both
// checks below are wrapped in try/catch and simply report whatever outcome (403, TLS
// error, network failure, or a clean 200) they got rather than throwing.

interface InmlcfCheckResult {
  ok: boolean;
  status?: number;
  error?: string;
  note?: string;
  lastKnown?: number;
  highestFound?: number | null;
  hasNewerBulletin?: boolean;
}

async function checkInmlcf(): Promise<InmlcfCheckResult> {
  try {
    const res = await fetch(INMLCF_NEWS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SOSColombiaBot/1.0)" },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        note: "Non-200 response — expected from this domain via plain server-side fetch, see wiki/06-sources.md.",
      };
    }

    const html = await res.text();
    // Matches "Comunicado Oficial No. 07", "Comunicado Oficial 7", etc.
    const matches = [...html.matchAll(/Comunicado\s+Oficial\s+(?:No\.?\s*)?0*(\d{1,2})\b/gi)];
    const numbers = matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
    const highestFound = numbers.length > 0 ? Math.max(...numbers) : null;

    return {
      ok: true,
      status: res.status,
      lastKnown: LAST_KNOWN_INMLCF_COMUNICADO,
      highestFound,
      hasNewerBulletin: highestFound != null && highestFound > LAST_KNOWN_INMLCF_COMUNICADO,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      note: "Fetch failed outright — expected from this domain via plain server-side fetch (historically a TLS error here), see wiki/06-sources.md.",
    };
  }
}

interface ReliefWebCheckResult {
  ok: boolean;
  url: string;
  status?: number;
  found?: boolean;
  error?: string;
  note?: string;
}

async function checkReliefWebFlashUpdate005(): Promise<ReliefWebCheckResult> {
  try {
    const res = await fetch(RELIEFWEB_005_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SOSColombiaBot/1.0)" },
      cache: "no-store",
      redirect: "follow",
    });

    return {
      ok: res.ok,
      url: RELIEFWEB_005_URL,
      status: res.status,
      found: res.status === 200,
      note: res.ok
        ? undefined
        : "Non-200 response — expected from this domain via plain server-side fetch, see wiki/06-sources.md.",
    };
  } catch (err) {
    return {
      ok: false,
      url: RELIEFWEB_005_URL,
      error: err instanceof Error ? err.message : String(err),
      note: "Fetch failed outright — expected from this domain via plain server-side fetch (historically an HTTP 403 here), see wiki/06-sources.md.",
    };
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [inmlcf, ochaFlashUpdate005] = await Promise.all([
    checkInmlcf(),
    checkReliefWebFlashUpdate005(),
  ]);

  return NextResponse.json({ checked: true, inmlcf, ochaFlashUpdate005 });
}
