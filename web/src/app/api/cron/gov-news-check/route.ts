import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import { upsertSource } from "@/lib/sources";
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
//
// Manizales runs its press page on WordPress, which exposes a real RSS feed
// (confirmed live, 2026-08-14: centrodeinformacion.manizales.gov.co/feed/) — used
// instead of HTML scraping since it's structured, per-article, and far less likely
// to silently break if the site's markup changes. Pereira and Cali were checked for
// an equivalent feed and confirmed to have none (no <link rel="alternate"> tag, no
// working /feed path) — they stay on the HTML-scrape path below.
type HtmlSource = { kind: "html"; municipioName: string; url: string; needsBrowserUserAgent: boolean };
type RssSource = { kind: "rss"; municipioName: string; url: string };

const GOV_NEWS_SOURCES: Array<HtmlSource | RssSource> = [
  { kind: "html", municipioName: "Pereira", url: "https://www.pereira.gov.co/publicaciones/4474/boletin-de-noticias/", needsBrowserUserAgent: false },
  { kind: "html", municipioName: "Cali", url: "https://www.cali.gov.co/boletines/", needsBrowserUserAgent: false },
  { kind: "rss", municipioName: "Manizales", url: "https://centrodeinformacion.manizales.gov.co/feed/" },
  // WAF returns 403 on a bare/default User-Agent — confirmed only a browser-like UA gets through.
  { kind: "html", municipioName: "Armenia", url: "https://www.armenia.gov.co/sala-de-prensa/noticias", needsBrowserUserAgent: true },
  { kind: "html", municipioName: "Dosquebradas", url: "https://www.dosquebradas.gov.co/web/index.php/dosquebradas/ciudad/sala-de-prensa/noticias", needsBrowserUserAgent: false },
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
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é").replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú").replace(/&ntilde;/gi, "ñ")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í")
    .replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ntilde;/g, "Ñ")
    .replace(/&#8230;/g, "…").replace(/&amp;/gi, "&");
}

interface RssItem {
  title: string;
  link: string;
  description: string;
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!match) return null;
  return decodeEntities(
    match[1].replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").replace(/<[^>]+>/g, " ").trim(),
  );
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const description = extractTag(block, "description") ?? "";
    if (title && link) items.push({ title, link, description });
  }
  return items;
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

async function checkHtmlSource(source: HtmlSource) {
  const orgLabel = `Alcaldía de ${source.municipioName}`;

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
      await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "NEEDS_RECHECK" });
      return { municipio: source.municipioName, url: source.url, ok: false, status: res.status, staged: 0 };
    }
    html = await res.text();
  } catch (err) {
    await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "NEEDS_RECHECK" });
    return {
      municipio: source.municipioName,
      url: source.url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      staged: 0,
    };
  }

  await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "LIVE" });

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
        sourceOrg: orgLabel,
        submitterNote: candidate.snippet,
        origin: "AUTOMATION_SWEEP",
      },
    });
    staged++;
  }

  return { municipio: source.municipioName, url: source.url, ok: true, candidatesFound: candidates.length, staged };
}

// RSS gives us per-article links and clean titles, so — unlike the HTML path, which
// stages a raw text window from a single big page — each staged finding here points
// at its own article URL and dedups on that URL alone rather than a text fingerprint.
async function checkRssSource(source: RssSource) {
  const orgLabel = `Alcaldía de ${source.municipioName}`;

  const municipio = await prisma.municipio.findFirst({ where: { name: source.municipioName } });
  if (!municipio) {
    return { municipio: source.municipioName, url: source.url, ok: false, error: "Municipio not found in DB", staged: 0 };
  }

  let xml: string;
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": BOT_USER_AGENT },
      cache: "no-store",
    });
    if (!res.ok) {
      await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "NEEDS_RECHECK" });
      return { municipio: source.municipioName, url: source.url, ok: false, status: res.status, staged: 0 };
    }
    xml = await res.text();
  } catch (err) {
    await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "NEEDS_RECHECK" });
    return {
      municipio: source.municipioName,
      url: source.url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      staged: 0,
    };
  }

  await upsertSource({ url: source.url, org: orgLabel, tier: 1, status: "LIVE" });

  const items = parseRssItems(xml);
  let staged = 0;
  let candidatesFound = 0;

  for (const item of items) {
    const candidates = findCandidates(`${item.title} ${item.description}`);
    if (candidates.length === 0) continue;
    candidatesFound += candidates.length;

    const existing = await prisma.pendingAidPoint.findFirst({ where: { sourceUrl: item.link } });
    if (existing) continue;

    // An article can match more than one kind (e.g. mentions both an albergue and an
    // acopio) — stage one row per distinct kind found, all pointing at the same article.
    const kinds = new Set(candidates.map((c) => c.kind));
    for (const kind of kinds) {
      await prisma.pendingAidPoint.create({
        data: {
          municipioId: municipio.id,
          kind,
          name: item.title.slice(0, 200),
          sourceUrl: item.link,
          sourceOrg: orgLabel,
          submitterNote: item.description.slice(0, 400) || item.title,
          origin: "AUTOMATION_SWEEP",
        },
      });
      staged++;
    }
  }

  return { municipio: source.municipioName, url: source.url, ok: true, itemsChecked: items.length, candidatesFound, staged };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(
    GOV_NEWS_SOURCES.map((source) => (source.kind === "rss" ? checkRssSource(source) : checkHtmlSource(source))),
  );
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
