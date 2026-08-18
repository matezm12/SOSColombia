import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";
import { upsertSource } from "@/lib/sources";

// Prisma 7's driver adapter (@prisma/adapter-pg) needs the Node.js runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tier 4 (wiki/10-app-architecture.md): mapadelterremoto.com is a third-party
// aggregator, "used to catch gaps in our own data (it caught Popayán acopio points
// our own search missed) — not a primary source, always re-verify before citing."
// No API/sitemap exists (confirmed in wiki/13-opensource-tools.md); this scrapes
// server-rendered HTML directly.
//
// Extraction method note: a live fetch of /municipio/pereira (2026-08-14) showed
// each reported point rendered as a card with a type label in a
// `text-[13px]" style="color:var(--s-ink-3)"` span. Of the ~15 distinct labels
// seen (damage types, security incidents, news), exactly two map to AidPoint
// kinds we track: "Punto de ayuda o acopio" → ACOPIO, "Albergue o punto de
// atención" → ALBERGUE. Naive keyword counts elsewhere on the page (e.g. raw
// "confirmado" occurrences) were wildly overcounted — hundreds of hits from CSS/
// framework boilerplate, not real points — so this route counts ONLY those two
// exact label strings, not general keywords. This is a rough proxy (a point could
// in principle render its label twice), not an authoritative count — hence
// alert-only below, same as tier-2: a human compares the page themselves rather
// than anything auto-writing into AidPoint. If mapadelterremoto's markup changes,
// counts silently drop to zero rather than erroring — worth an occasional manual
// spot-check that this route still finds anything at all.
const LABEL_TO_KIND: Record<string, "ACOPIO" | "ALBERGUE"> = {
  "Punto de ayuda o acopio": "ACOPIO",
  "Albergue o punto de atención": "ALBERGUE",
};

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "") // strip combining diacritics (Quibdó -> quibdo)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface MunicipioGapCheck {
  municipio: string;
  slug: string;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  gaps: Array<{ kind: "ACOPIO" | "ALBERGUE"; theirCount: number; ourCount: number }>;
  // Sum of BOTH labels' raw counts, independent of whether either produced a
  // gap -- "no gaps" and "the label string stopped matching anything because
  // mapadelterremoto's markup changed" both look identical as `gaps: []`.
  // Summed across every successfully-fetched municipio in GET() below: all
  // of them landing on exactly zero is a real markup-broke signal (a page
  // update genuinely showing zero across every single city we track,
  // simultaneously, is implausible) in a way one city legitimately having
  // zero acopio points isn't.
  theirTotal: number;
}

async function checkMunicipio(
  municipioId: string,
  name: string,
): Promise<MunicipioGapCheck> {
  const slug = slugify(name);
  const url = `https://www.mapadelterremoto.com/municipio/${slug}`;

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SOSColombiaBot/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) {
      await upsertSource({ url, org: `mapadelterremoto.com — ${name}`, tier: 4, status: "NEEDS_RECHECK" });
      return { municipio: name, slug, url, ok: false, status: res.status, gaps: [], theirTotal: 0 };
    }
    html = await res.text();
  } catch (err) {
    await upsertSource({ url, org: `mapadelterremoto.com — ${name}`, tier: 4, status: "NEEDS_RECHECK" });
    return {
      municipio: name,
      slug,
      url,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      gaps: [],
      theirTotal: 0,
    };
  }

  await upsertSource({ url, org: `mapadelterremoto.com — ${name}`, tier: 4, status: "LIVE" });

  const gaps: MunicipioGapCheck["gaps"] = [];
  let theirTotal = 0;

  for (const [label, kind] of Object.entries(LABEL_TO_KIND)) {
    const theirCount = html.split(label).length - 1;
    theirTotal += theirCount;
    const ourCount = await prisma.aidPoint.count({ where: { municipioId, kind } });
    if (theirCount > ourCount) {
      gaps.push({ kind, theirCount, ourCount });
    }
  }

  return { municipio: name, slug, url, ok: true, gaps, theirTotal };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const municipios = await prisma.municipio.findMany({ orderBy: { name: "asc" } });

  const results = await Promise.all(
    municipios.map((m) => checkMunicipio(m.id, m.name)),
  );

  const succeeded = results.filter((r) => r.ok);
  const extractionLikelyBroken = succeeded.length > 0 && succeeded.every((r) => r.theirTotal === 0);

  if (extractionLikelyBroken) {
    await notifyOps(
      "SOSColombia: aggregator-check found zero matches everywhere — likely broken",
      `<p>The mapadelterremoto.com label-count check found ${succeeded.length} page(s) fetched successfully,
       but every single one matched zero "Punto de ayuda o acopio" / "Albergue o punto de atención" labels.</p>
       <p>Every tracked city showing zero simultaneously is implausible for a live aggregator during an active
       emergency — this almost certainly means mapadelterremoto.com changed its markup and the exact label
       strings this route matches on no longer appear anywhere. Check a page manually and update
       LABEL_TO_KIND in api/cron/aggregator-check/route.ts if so.</p>`,
    );
  }

  const withGaps = results.filter((r) => r.gaps.length > 0);

  if (withGaps.length > 0) {
    const rows = withGaps
      .flatMap((r) =>
        r.gaps.map(
          (g) =>
            `<li><strong>${r.municipio}</strong> — ${g.kind}: mapadelterremoto shows ${g.theirCount}, we have ${g.ourCount}. <a href="${r.url}">${r.url}</a></li>`,
        ),
      )
      .join("");
    await notifyOps(
      "SOSColombia: possible aid-point gaps vs mapadelterremoto.com",
      `<p>Weekly cross-check found cities where mapadelterremoto.com shows more acopio/albergue points than we have on file.</p>
       <ul>${rows}</ul>
       <p>This is a rough label-count proxy against a third-party aggregator, not a primary source — visit each page and re-verify before adding anything. Nothing was written automatically.</p>`,
    );
  }

  return NextResponse.json({ checked: true, extractionLikelyBroken, results });
}
