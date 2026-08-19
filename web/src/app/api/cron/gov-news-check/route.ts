import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import { upsertSource } from "@/lib/sources";
import { decodeEntities, parseRssItems } from "@/lib/rss";
import { EARTHQUAKE_CONTEXT, findCandidates } from "@/lib/aidPointDetection";

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
// Also runs a second, independent pass over the same fetched page/items looking for
// death-toll mentions (see DEATH_TOLL_CONTEXT below) — these press pages are exactly the
// per-city update source the national bulletins cron (tier 2) can't cover, since INMLCF/
// OCHA only publish national/department figures. Stages into PendingTollRecord, reviewed
// at /admin/boletines, same as any other tier-2 detection — no number ever auto-writes.
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

// Kind-keyword matching + earthquake-context gating now live in
// @/lib/aidPointDetection (shared with api/cron/discovery).

// Same city press pages, second signal: a death-toll mention. This never auto-writes a
// number — same tier-2 discipline as the national bulletins cron (web/src/app/api/cron/
// bulletins) — it stages a PendingTollRecord stub with metric/value left null, and a
// moderator fills in the real figure at /admin/boletines after reading the source. Kept
// deliberately narrow (fallecid*/muert*) rather than matching every number on the page,
// which would mostly hit unrelated figures (dates, addresses, phone numbers).
const DEATH_TOLL_CONTEXT = /fallecid|muert[eo]s?\b|víctimas? mortales/i;

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

// Deliberately tighter than aidPointDetection's context/snippet windows, and requires a nearby
// digit — confirmed necessary by testing, not just theoretical: the wider window (plus
// no digit requirement) matched "muerte" in a totally unrelated 2022 childhood-cancer
// article on Pereira's unpaginated multi-year archive page, since earthquake coverage
// sits close enough in that one big concatenated document for a 400-char window to
// bleed across article boundaries. A real toll mention keeps its number right next to
// the keyword ("6 fallecidos"); generic uses of "muerte" almost never do.
const DEATH_TOLL_WINDOW = 120;
const NUMBER_NEARBY = /\d+/;

function findDeathTollSnippets(text: string): string[] {
  const snippets: string[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(new RegExp(DEATH_TOLL_CONTEXT.source, "gi"))) {
    const idx = match.index ?? 0;
    const windowStart = Math.max(0, idx - DEATH_TOLL_WINDOW);
    const windowEnd = Math.min(text.length, idx + DEATH_TOLL_WINDOW);
    const window = text.slice(windowStart, windowEnd);

    if (!NUMBER_NEARBY.test(window) || !EARTHQUAKE_CONTEXT.test(window)) continue;

    const snippet = window.trim();
    if (seen.has(snippet)) continue;
    seen.add(snippet);
    snippets.push(snippet);
  }

  return snippets;
}

async function stageDeathTollMentions(
  municipioId: string,
  orgLabel: string,
  sourceUrl: string,
  snippets: string[],
): Promise<number> {
  let staged = 0;
  for (const snippet of snippets) {
    const existing = await prisma.pendingTollRecord.findFirst({
      where: { sourceUrl, submitterNote: snippet },
    });
    if (existing) continue;

    await prisma.pendingTollRecord.create({
      data: {
        municipioId,
        sourceUrl,
        sourceOrg: orgLabel,
        submitterNote: snippet,
        origin: "AUTOMATION_SWEEP",
      },
    });
    staged++;
  }
  return staged;
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

  const text = stripHtml(html);
  const candidates = findCandidates(text);
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

  const tollStaged = await stageDeathTollMentions(municipio.id, orgLabel, source.url, findDeathTollSnippets(text));

  return { municipio: source.municipioName, url: source.url, ok: true, candidatesFound: candidates.length, staged, tollStaged };
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
  let tollStaged = 0;

  for (const item of items) {
    const itemText = `${item.title} ${item.description}`;
    const candidates = findCandidates(itemText);
    candidatesFound += candidates.length;

    if (candidates.length > 0) {
      const existing = await prisma.pendingAidPoint.findFirst({ where: { sourceUrl: item.link } });
      if (!existing) {
        // An article can match more than one kind (e.g. mentions both an albergue and
        // an acopio) — stage one row per distinct kind found, all pointing at the article.
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
    }

    tollStaged += await stageDeathTollMentions(municipio.id, orgLabel, item.link, findDeathTollSnippets(itemText));
  }

  return { municipio: source.municipioName, url: source.url, ok: true, itemsChecked: items.length, candidatesFound, staged, tollStaged };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(
    GOV_NEWS_SOURCES.map((source) => (source.kind === "rss" ? checkRssSource(source) : checkHtmlSource(source))),
  );
  const totalStaged = results.reduce((sum, r) => sum + (r.staged ?? 0), 0);
  const totalTollStaged = results.reduce((sum, r) => sum + (r.tollStaged ?? 0), 0);

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

  if (totalTollStaged > 0) {
    const rows = results
      .filter((r) => (r.tollStaged ?? 0) > 0)
      .map((r) => `<li><strong>${r.municipio}</strong>: ${r.tollStaged} death-toll mention(s) — <a href="${r.url}">${r.url}</a></li>`)
      .join("");
    await notifyOps(
      "SOSColombia: gov-site sweep found death-toll mentions",
      `<p>The daily gov-news sweep found death-toll mentions on municipal press pages, staged at /admin/boletines.</p>
       <ul>${rows}</ul>
       <p>No figures were written automatically — read the source and fill in the real number.</p>`,
    );
  }

  return NextResponse.json({ checked: true, results });
}
