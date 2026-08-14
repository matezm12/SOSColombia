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

  if (changed) {
    await notifyOps(
      "SOSColombia: USGS event facts changed",
      `<p>USGS revised the event facts for us6000tjl2. Stored value on file (Event row) does not match what USGS reports now.</p>
       <pre>${JSON.stringify({ stored, current }, null, 2)}</pre>
       <p>This route is read-only — nothing was written. Review and update the Event row manually if the new figures check out.</p>`,
    );
  }

  // Deliberately read-only for now — per wiki/10-app-architecture.md's tier-1 cadence
  // ("Event facts: once, static after confirmation"), auto-writing back to the Event
  // row is a future step once this comparison pattern has proven itself over a few
  // cycles. This route only reports a diff, it never calls prisma.event.update.
  return NextResponse.json({ checked: true, changed, stored, current });
}
