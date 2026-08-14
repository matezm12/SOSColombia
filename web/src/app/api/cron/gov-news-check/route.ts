import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import type { AidPointKind } from "@prisma/client";

// Prisma 7's driver adapter (@prisma/adapter-pg) needs the Node.js runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Tier 3a (automated half — wiki/10-app-architecture.md): "scheduled browser-automation
// sweeps of known official accounts, surfaced to a moderation queue." The doc's original
// framing assumed social media (Facebook/Instagram); a live probe (2026-08-14) found
// Facebook serves unauthenticated fetch() only page-level SEO metadata, zero real post
// content — not automatable without paid Meta/X API access. Downscoped instead to each
// municipio's OWN government press-release page, which — unlike social platforms — is
// plain server-rendered HTML for 5 of the 8 cities we track (confirmed by direct fetch,
// 2026-08-14):
//   Quibdó, Popayán, San José del Palmar — JS-loaded/empty article lists on a plain
//   fetch, genuinely not automatable this way. Left manual-only, not attempted here.
//
// Reuses the existing PendingAidPoint queue (/admin/moderacion) rather than new schema —
// a keyword hit is exactly the same "unverified, needs a human glance" shape as a
// community submission, just with AUTOMATION_SWEEP origin instead of COMMUNITY.
const GOV_NEWS_SOURCES: Array<{
  municipioName: string;
  url: string;
  needsBrowserUserAgent: boolean;
}> = [
  { municipioName: "Pereira", url: "https://www.pereira.gov.co/publicaciones/4474/boletin-de-noticias/", needsBrowserUserAgent: false },
  { municipioName: "Cali", url: "https://www.cali.gov.co/boletines/", needsBrowserUserAgent: false },
  { municipioName: "Manizales", url: "https://centrodeinformacion.manizales.gov.co/secciones/alcaldia/", needsBrowserUserAgent: false },
  // WAF returns 403 on a bare/default User-Agent — confirmed only a browser-like UA gets through.
  { municipioName: "Armenia", url: "https://www.armenia.gov.co/sala-de-prensa/noticias", needsBrowserUserAgent: true },
  { municipioName: "Dosquebradas", url: "https://www.dosquebradas.gov.co/web/index.php/dosquebradas/ciudad/sala-de-prensa/noticias", needsBrowserUserAgent: false },
];

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BOT_USER_AGENT = "Mozilla/5.0 (compatible; SOSColombiaBot/1.0)";

// Only these two kinds have a clean keyword signal on these pages — no reliable wording
// found for health/vet/blood-donation/monetary-donation points on either source.
const KIND_KEYWORDS: Partial<Record<AidPointKind, RegExp>> = {
  ALBERGUE: /albergue|refugio temporal/gi,
  ACOPIO: /punto de acopio|centro de acopio|punto de ayuda/gi,
};
const EARTHQUAKE_CONTEXT = /terremoto|sismo|damnificad/i;
const CONTEXT_WINDOW = 400; // chars either side of a kind-keyword hit, to require earthquake co-occurrence
const SNIPPET_WINDOW = 200; // chars either side, for the stored/emailed snippet

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é").replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

interface Finding {
  kind: AidPointKind;
  snippet: string;
}

function findCandidates(text: string): Finding[] {
  const found: Finding[] = [];
  const seenSnippets = new Set<string>();

  for (const [kind, pattern] of Object.entries(KIND_KEYWORDS) as Array<[AidPointKind, RegExp | undefined]>) {
    if (!pattern) continue;
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const idx = match.index ?? 0;
      const contextStart = Math.max(0, idx - CONTEXT_WINDOW);
      const contextEnd = Math.min(text.length, idx + CONTEXT_WINDOW);
      const context = text.slice(contextStart, contextEnd);
      if (!EARTHQUAKE_CONTEXT.test(context)) continue;

      const snippetStart = Math.max(0, idx - SNIPPET_WINDOW);
      const snippetEnd = Math.min(text.length, idx + SNIPPET_WINDOW);
      const snippet = text.slice(snippetStart, snippetEnd).trim();

      if (seenSnippets.has(snippet)) continue;
      seenSnippets.add(snippet);
      found.push({ kind, snippet });
    }
  }

  return found;
}

async function checkSource(source: (typeof GOV_NEWS_SOURCES)[number]) {
  const municipio = await prisma.municipio.findFirst({ where: { name: source.municipioName } });
  if (!municipio) {
    return { municipio: source.municipioName, url: source.url, ok: false, error: "Municipio not found in DB", staged: 0 };
  }

  let html: string;
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": source.needsBrowserUserAgent ? BROWSER_USER_AGENT : BOT_USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) {
      return { municipio: source.municipioName, url: source.url, ok: false, status: res.status, staged: 0 };
    }
    html = await res.text();
  } catch (err) {
    return {
      municipio: source.municipioName,
      url: source.url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      staged: 0,
    };
  }

  const candidates = findCandidates(stripHtml(html));
  let staged = 0;

  for (const candidate of candidates) {
    // Dedup against ANY prior status, not just PENDING — a moderator's rejection of a
    // false positive must not get re-staged the next time this cron runs.
    const existing = await prisma.pendingAidPoint.findFirst({
      where: { sourceUrl: source.url, submitterNote: candidate.snippet },
    });
    if (existing) continue;

    await prisma.pendingAidPoint.create({
      data: {
        municipioId: municipio.id,
        kind: candidate.kind,
        name: "Detección automática — revisar",
        sourceUrl: source.url,
        submitterNote: candidate.snippet,
        origin: "AUTOMATION_SWEEP",
      },
    });
    staged++;
  }

  return { municipio: source.municipioName, url: source.url, ok: true, candidatesFound: candidates.length, staged };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(GOV_NEWS_SOURCES.map(checkSource));
  const totalStaged = results.reduce((sum, r) => sum + (r.staged ?? 0), 0);

  if (totalStaged > 0) {
    const rows = results
      .filter((r) => (r.staged ?? 0) > 0)
      .map((r) => `<li><strong>${r.municipio}</strong>: ${r.staged} new finding(s) — <a href="${r.url}">${r.url}</a></li>`)
      .join("");
    await notifyOps(
      "SOSColombia: gov-site sweep found new aid-point mentions",
      `<p>The daily gov-news sweep found new albergue/acopio mentions on municipal press pages, staged at /admin/moderacion.</p>
       <ul>${rows}</ul>
       <p>These are raw text snippets, not verified aid-point details — review each one before approving.</p>`,
    );
  }

  return NextResponse.json({ checked: true, results });
}
