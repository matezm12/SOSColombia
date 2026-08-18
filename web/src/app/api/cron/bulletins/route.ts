import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import { upsertSource } from "@/lib/sources";

// Prisma 7's driver adapter (@prisma/adapter-pg) needs the Node.js runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tier 2 sources (wiki/10-app-architecture.md): structured bulletins with no API,
// checked for newer numbered releases than what's already on file.
//
// Scope note: this route DETECTS a newer bulletin, it doesn't parse figures out of
// it — bulletin formats aren't consistent enough yet to trust unattended. What it
// does do is stage a PendingTollRecord stub (metric/value/asOf left null) so a
// moderator sees it at /admin/boletines, reads the actual bulletin, and fills in
// the real numbers on approval. `dedupeAndStage` guards against re-staging the same
// still-unreviewed detection every single day the cron runs.
const INMLCF_NEWS_URL = "https://www.medicinalegal.gov.co/web/guest/noticias";
const RELIEFWEB_005_URL =
  "https://reliefweb.int/report/colombia/colombia-flash-update-005-actualizacion-afectaciones-por-terremoto-en-colombia";

// Last known numbered bulletin on file — see wiki/03-death-toll.md (INMLCF
// Comunicado Oficial No. 08, 2026-08-13 19:00, reviewed 2026-08-14). Bump
// this once a real human-reviewed cycle confirms a newer bulletin, per the
// architecture doc's tier-2 "needs a human glance before publish early on"
// note. This was stale at 6 for several days while 07 and 08 were already
// reviewed and on file — if this route ever gets a clean fetch from
// medicinalegal.gov.co (currently blocked from Vercel, see checkInmlcf's
// try/catch), a stale value here re-stages an already-handled bulletin
// every single day instead of a genuinely new one.
const LAST_KNOWN_INMLCF_COMUNICADO = 8;

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

// Dedups on {sourceUrl, submitterNote} together, not sourceUrl + PENDING status
// alone — matches gov-news-check.ts's already-established reasoning: checking
// only PENDING meant a moderator's rejection of a false positive (e.g. "No. 7
// detected" turning out to be already reflected) got silently re-staged the
// very next day, since the rejected row's status was no longer PENDING. Content
// is still distinct per genuinely new finding (the message embeds the detected
// bulletin number), so a real newer bulletin after an old one was resolved
// still stages correctly — this only blocks re-staging the *exact same* claim.
async function dedupeAndStage(sourceUrl: string, sourceOrg: string, submitterNote: string) {
  const existing = await prisma.pendingTollRecord.findFirst({
    where: { sourceUrl, submitterNote },
  });
  if (existing) return existing;

  return prisma.pendingTollRecord.create({
    data: { sourceUrl, sourceOrg, submitterNote, origin: "AUTOMATION_SWEEP" },
  });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [inmlcf, ochaFlashUpdate005] = await Promise.all([
    checkInmlcf(),
    checkReliefWebFlashUpdate005(),
  ]);

  // Keep /fuentes honest about whether these two are actually reachable right
  // now, independent of whether a newer bulletin happened to show up today.
  await Promise.all([
    upsertSource({
      url: INMLCF_NEWS_URL,
      org: "INMLCF (Medicina Legal)",
      tier: 1,
      status: inmlcf.ok ? "LIVE" : "NEEDS_RECHECK",
    }),
    upsertSource({
      url: RELIEFWEB_005_URL,
      org: "OCHA / Equipo Humanitario País Colombia",
      tier: 1,
      status: ochaFlashUpdate005.ok ? "LIVE" : "NEEDS_RECHECK",
    }),
  ]);

  const staged: string[] = [];

  if (inmlcf.hasNewerBulletin) {
    await dedupeAndStage(
      INMLCF_NEWS_URL,
      "INMLCF (Medicina Legal)",
      `Comunicado Oficial No. ${inmlcf.highestFound} detected — No. ${LAST_KNOWN_INMLCF_COMUNICADO} on file.`,
    );
    staged.push("inmlcf");
  }

  if (ochaFlashUpdate005.found) {
    await dedupeAndStage(
      RELIEFWEB_005_URL,
      "OCHA / Equipo Humanitario País Colombia",
      "OCHA Flash Update 005 page found (previously unpublished) — No. 004 on file.",
    );
    staged.push("ochaFlashUpdate005");
  }

  if (staged.length > 0) {
    await notifyOps(
      "SOSColombia: newer bulletin detected",
      `<p>A scheduled check found a newer numbered bulletin than what's on file, and staged it at /admin/boletines for review.</p>
       <pre>${JSON.stringify({ inmlcf, ochaFlashUpdate005 }, null, 2)}</pre>
       <p>Nothing was written to TollRecord yet — review the source and fill in the real figures at /admin/boletines.</p>`,
    );
  }

  return NextResponse.json({ checked: true, inmlcf, ochaFlashUpdate005, staged });
}
