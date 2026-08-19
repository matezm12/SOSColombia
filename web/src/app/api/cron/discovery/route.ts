import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import { parseRssItems } from "@/lib/rss";
import { findCandidates } from "@/lib/aidPointDetection";
import { extractEmbeddedSocialPermalinks } from "@/lib/embeds";

// Prisma 7's driver adapter (@prisma/adapter-pg) needs the Node.js runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Real ceiling on gov-news-check: it only ever looks at a hand-maintained list of
// 5 city press pages. This job removes that ceiling for aid-point discovery
// specifically by sweeping Google News' free, keyless RSS search
// (news.google.com/rss/search) per tracked municipio x keyword instead — a
// self-scaling source (every municipio the DB already knows about, not a
// hardcoded 5) that needs no browser, no scraping fragility, just plain fetch()
// + XML parsing (same @/lib/rss helpers gov-news-check already uses for its
// Manizales feed).
//
// Deliberately does NOT write anything into the Source table for discovered
// article URLs (unlike gov-news-check's per-outlet upsertSource calls) --
// confirmed live that /fuentes (src/app/[locale]/fuentes/page.tsx) renders
// every Source row publicly with no status filter, so an unreviewed
// NEEDS_RECHECK row would leak straight onto the public transparency page.
// A Google News search result isn't a stable "outlet" the way a city press
// page is anyway (it aggregates many). Findings go straight into the same
// gated PendingAidPoint moderation queue gov-news-check already uses --
// reusing @/lib/aidPointDetection's exact keyword + earthquake-context
// matching -- and nothing ever surfaces publicly before a human approves it.
const NEWS_SEARCH_KEYWORDS = ["albergue terremoto", "centro de acopio terremoto", "punto de ayuda terremoto"];

// Verified live (first real run): without this, @/lib/aidPointDetection's
// earthquake-context gate barely filters anything here, unlike on
// gov-news-check's big single-city press pages -- a short Google News
// result already got returned FOR the query "albergue terremoto <city>",
// so it almost always contains "terremoto" somewhere in its own title/
// snippet regardless of whether the article is actually specific to that
// city (national coverage matches too). Requiring the municipio's own name
// to literally appear cut a first real run from 151 staged findings across
// 13 cities down to a reviewable number.
//
// Also a hard per-municipio cap regardless of match quality -- a backstop,
// not the primary filter, since a single very active city could still
// legitimately produce more real matches than one run should dump into the
// queue at once (see admin/comunidad's unbounded pending query for what
// happens without one: genuine other submissions get buried).
const MAX_STAGED_PER_MUNICIPIO = 5;

// Separate, tighter cap for embedded social permalinks found by fetching an
// already-relevant article's full page (see extractEmbeddedSocialPermalinks
// in @/lib/embeds) -- a brand-new, first-run-untested discovery vector, kept
// conservative on purpose. Same "cap what's expensive, never let one signal
// crowd out another" discipline as MAX_STAGED_PER_MUNICIPIO above.
const MAX_EMBEDS_PER_MUNICIPIO = 3;

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(text: string): string {
  return text.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase();
}

const BOT_USER_AGENT = "Mozilla/5.0 (compatible; SOSColombiaBot/1.0)";

function newsSearchUrl(query: string): string {
  // hl/gl/ceid pin the result language/region to Spanish-Colombia -- without
  // them Google News defaults to whatever locale the request looks like it's
  // coming from (a US-based fetch), which returned mostly English/US results
  // when tested without these params.
  const params = new URLSearchParams({ q: query, hl: "es-419", gl: "CO", ceid: "CO:es" });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

interface MunicipioCheck {
  municipio: string;
  ok: boolean;
  itemsChecked: number;
  candidatesFound: number;
  staged: number;
  embedsStaged: number;
  errors: string[];
}

async function stageEmbeddedPermalinks(
  municipioId: string,
  articleUrl: string,
  articleTitle: string,
  cap: number,
): Promise<number> {
  let html: string;
  try {
    const res = await fetch(articleUrl, { headers: { "User-Agent": BOT_USER_AGENT }, cache: "no-store" });
    if (!res.ok) return 0;
    html = await res.text();
  } catch {
    return 0;
  }

  const embeds = extractEmbeddedSocialPermalinks(html);
  let staged = 0;

  for (const embed of embeds) {
    if (staged >= cap) break;

    // Same dedup discipline as everywhere else -- check both the live table
    // and the pending queue, across any status, before staging.
    const [existingLive, existingPending] = await Promise.all([
      prisma.socialPost.findFirst({ where: { permalink: embed.permalink } }),
      prisma.pendingSocialPost.findFirst({ where: { permalink: embed.permalink } }),
    ]);
    if (existingLive || existingPending) continue;

    // Bare placeholder, same shape as scripts/social-discovery/discover.py's
    // stage_bare_social_post -- we found a real permalink embedded in a real
    // article, but have no caption/stats without a second platform-specific
    // fetch, which this route (plain fetch(), no browser/API access) can't
    // do. A moderator reviewing the real post directly is strictly better
    // than not finding it at all.
    await prisma.pendingSocialPost.create({
      data: {
        platform: embed.platform,
        permalink: embed.permalink,
        category: "HUMAN_INTEREST",
        municipioId,
        submitterNote: `[found embedded in article — review manually] ${articleTitle.slice(0, 200)} — ${articleUrl}`,
        origin: "AUTOMATION_SWEEP",
      },
    });
    staged++;
  }

  return staged;
}

async function checkMunicipio(municipioId: string, name: string): Promise<MunicipioCheck> {
  const orgLabel = `Google News — ${name}`;
  const errors: string[] = [];
  const normalizedName = normalize(name);
  let itemsChecked = 0;
  let candidatesFound = 0;
  let staged = 0;
  let embedsStaged = 0;

  for (const keyword of NEWS_SEARCH_KEYWORDS) {
    if (staged >= MAX_STAGED_PER_MUNICIPIO) break;

    const url = newsSearchUrl(`${keyword} ${name}`);
    let xml: string;
    try {
      const res = await fetch(url, { headers: { "User-Agent": BOT_USER_AGENT }, cache: "no-store" });
      if (!res.ok) {
        errors.push(`"${keyword}": HTTP ${res.status}`);
        continue;
      }
      xml = await res.text();
    } catch (err) {
      errors.push(`"${keyword}": ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const items = parseRssItems(xml);
    itemsChecked += items.length;

    for (const item of items) {
      if (staged >= MAX_STAGED_PER_MUNICIPIO) break;

      const itemText = `${item.title} ${item.description}`;
      // The search query already includes "terremoto", so a returned result
      // almost always satisfies @/lib/aidPointDetection's earthquake-context
      // gate regardless of whether it's actually about THIS city (national
      // coverage matches too) -- requiring the municipio's own name here is
      // what actually narrows it, confirmed necessary by a real first run.
      if (!normalize(itemText).includes(normalizedName)) continue;

      const candidates = findCandidates(itemText);
      candidatesFound += candidates.length;
      if (candidates.length === 0) continue;

      // Article already proven relevant (matched a kind keyword + this
      // city's name) -- worth the extra fetch to check its full page for
      // embedded social posts (see @/lib/embeds), a discovery angle that
      // finds real accounts/posts a hashtag or profile sweep never would:
      // whatever a journalist or aid org already chose to embed.
      if (embedsStaged < MAX_EMBEDS_PER_MUNICIPIO) {
        embedsStaged += await stageEmbeddedPermalinks(
          municipioId,
          item.link,
          item.title,
          MAX_EMBEDS_PER_MUNICIPIO - embedsStaged,
        );
      }

      // Same dedup discipline as gov-news-check's own RSS path: on the
      // article URL alone, across ANY prior status -- a moderator's
      // rejection must never get re-staged the next run.
      const existing = await prisma.pendingAidPoint.findFirst({ where: { sourceUrl: item.link } });
      if (existing) continue;

      const kinds = new Set(candidates.map((c) => c.kind));
      for (const kind of kinds) {
        await prisma.pendingAidPoint.create({
          data: {
            municipioId,
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

  return { municipio: name, ok: errors.length === 0, itemsChecked, candidatesFound, staged, embedsStaged, errors };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const municipios = await prisma.municipio.findMany({ orderBy: { name: "asc" } });
  const results = await Promise.all(municipios.map((m) => checkMunicipio(m.id, m.name)));

  const totalStaged = results.reduce((sum, r) => sum + r.staged, 0);
  const totalEmbedsStaged = results.reduce((sum, r) => sum + r.embedsStaged, 0);

  if (totalStaged > 0) {
    const rows = results
      .filter((r) => r.staged > 0)
      .map((r) => `<li><strong>${r.municipio}</strong>: ${r.staged} new finding(s)</li>`)
      .join("");
    await notifyOps(
      "SOSColombia: Google News sweep found new aid-point mentions",
      `<p>The Google News discovery sweep found new albergue/acopio mentions, staged at /admin/moderacion.</p>
       <ul>${rows}</ul>
       <p>These are raw article snippets, not verified aid-point details — review each one before approving.</p>`,
    );
  }

  if (totalEmbedsStaged > 0) {
    const embedRows = results
      .filter((r) => r.embedsStaged > 0)
      .map((r) => `<li><strong>${r.municipio}</strong>: ${r.embedsStaged} social post(s) found embedded in news articles</li>`)
      .join("");
    await notifyOps(
      "SOSColombia: found social posts embedded in news coverage",
      `<p>The Google News discovery sweep found real Instagram/TikTok/X posts embedded in article coverage, staged at /admin/comunidad.</p>
       <ul>${embedRows}</ul>
       <p>Found via the article's own oEmbed markup, not fetched/enriched further — review each real post directly before approving.</p>`,
    );
  }

  return NextResponse.json({ checked: true, results });
}
