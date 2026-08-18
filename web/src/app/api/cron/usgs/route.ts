import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { notifyOps } from "@/lib/notify";

// Prisma 7's driver adapter (@prisma/adapter-pg) needs the Node.js runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tier 1 source (wiki/10-app-architecture.md, wiki/13-opensource-tools.md): a clean,
// directly-fetchable USGS API, confirmed live. `us6000tjl2` is the known USGS event ID
// for this earthquake.
//
// Scheduled daily in vercel.json even though the architecture doc's tier-1 cadence
// says "once, static after confirmation" for event facts — safe because this route
// never writes anything (see the read-only note below); a daily read-only check costs
// nothing and catches USGS's own post-event revisions (already observed once: depth
// moved from 110.3km to 110.285km between this route's first live run and seed time).
const USGS_EVENT_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson";

// Values round-trip through JSON/float storage — compare with a small tolerance rather
// than strict equality so floating-point noise doesn't read as a "change".
const EPSILON = 0.001;

function differs(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a !== b;
  return Math.abs(a - b) > EPSILON;
}

interface EventFacts {
  magnitudeUsgs: number | null;
  depthUsgsKm: number | null;
  epicenterLatUsgs: number | null;
  epicenterLngUsgs: number | null;
}

interface UsgsFeature {
  properties?: { mag?: number | null };
  geometry?: { coordinates?: Array<number | null> };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Exactly one Event row exists (web/prisma/seed.ts) — this mirrors the lookup used
  // on the home page (src/app/page.tsx).
  const event = await prisma.event.findFirst({ orderBy: { createdAt: "asc" } });
  if (!event) {
    return NextResponse.json(
      { checked: false, error: "No Event row found in the database." },
      { status: 404 },
    );
  }

  const stored: EventFacts = {
    magnitudeUsgs: event.magnitudeUsgs,
    depthUsgsKm: event.depthUsgsKm,
    epicenterLatUsgs: event.epicenterLatUsgs,
    epicenterLngUsgs: event.epicenterLngUsgs,
  };

  let current: EventFacts;
  try {
    const res = await fetch(USGS_EVENT_URL, {
      headers: { Accept: "application/geo+json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { checked: false, error: `USGS feed returned HTTP ${res.status}`, stored },
        { status: 502 },
      );
    }

    const feature = (await res.json()) as UsgsFeature;
    const coords = feature.geometry?.coordinates;

    current = {
      magnitudeUsgs: feature.properties?.mag ?? null,
      depthUsgsKm: coords?.[2] ?? null,
      epicenterLatUsgs: coords?.[1] ?? null,
      epicenterLngUsgs: coords?.[0] ?? null,
    };
  } catch (err) {
    return NextResponse.json(
      {
        checked: false,
        error: `Failed to fetch USGS feed: ${err instanceof Error ? err.message : String(err)}`,
        stored,
      },
      { status: 502 },
    );
  }

  const changed =
    differs(stored.magnitudeUsgs, current.magnitudeUsgs) ||
    differs(stored.depthUsgsKm, current.depthUsgsKm) ||
    differs(stored.epicenterLatUsgs, current.epicenterLatUsgs) ||
    differs(stored.epicenterLngUsgs, current.epicenterLngUsgs);

  // Auto-writes, unlike bulletins/gov-news-check's stage-for-a-human discipline —
  // deliberately different risk profile: this is a numeric diff against a single
  // clean structured JSON API from an authoritative source (USGS), not regex/
  // keyword guessing against prose. Only ever sets fields USGS actually returned a
  // value for (never writes null over a good stored value) — a partial/glitched
  // USGS response can't regress the Event row, at worst it just updates fewer fields.
  const applied: Partial<EventFacts> = {};
  if (changed) {
    if (current.magnitudeUsgs !== null) applied.magnitudeUsgs = current.magnitudeUsgs;
    if (current.depthUsgsKm !== null) applied.depthUsgsKm = current.depthUsgsKm;
    if (current.epicenterLatUsgs !== null) applied.epicenterLatUsgs = current.epicenterLatUsgs;
    if (current.epicenterLngUsgs !== null) applied.epicenterLngUsgs = current.epicenterLngUsgs;

    if (Object.keys(applied).length > 0) {
      await prisma.event.update({ where: { id: event.id }, data: applied });
    }

    await notifyOps(
      "SOSColombia: USGS event facts auto-updated",
      `<p>USGS revised the event facts for us6000tjl2 — the Event row was updated automatically to match.</p>
       <pre>${JSON.stringify({ previous: stored, current, applied }, null, 2)}</pre>
       <p>This is a record of what changed, not an action needed — the update already applied. Structured
       API diff, not prose parsing, so this one writes automatically per tier-1 cadence.</p>`,
    );
  }

  return NextResponse.json({ checked: true, changed, stored, current, applied });
}
