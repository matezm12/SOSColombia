import { prisma } from "@/lib/prisma";

// Public data export: the full published dataset as JSON, one request.
// Deliberately excludes Pending* tables (moderation queue) -- only
// approved/published records belong in a public export. Everything here
// carries the same source/tier/date discipline as the site itself; nothing
// is summarized or reshaped beyond attaching human-readable municipio/
// department/source names alongside their IDs.
//
// Same reasoning as every other read-heavy route this pass: short ISR
// window instead of force-dynamic, so a spike in export downloads doesn't
// turn into a spike in database load.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET() {
  const [event, tollRecords, aidPoints, campaigns, govReports, contradictions, alliedResources] =
    await Promise.all([
      prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.tollRecord.findMany({
        include: {
          municipio: { select: { name: true, divipolaCode: true } },
          department: { select: { name: true, divipolaCode: true } },
          source: { select: { org: true, tier: true, url: true, status: true } },
        },
        orderBy: [{ metric: "asc" }, { asOf: "desc" }],
      }),
      prisma.aidPoint.findMany({
        include: {
          municipio: { select: { name: true, divipolaCode: true } },
          source: { select: { org: true, tier: true, url: true, status: true } },
        },
        orderBy: [{ kind: "asc" }, { name: "asc" }],
      }),
      prisma.crowdfundingCampaign.findMany({
        include: { municipios: { select: { name: true, divipolaCode: true } } },
        orderBy: { verificationStatus: "asc" },
      }),
      prisma.govReport.findMany({ orderBy: { date: "desc" } }),
      prisma.contradiction.findMany({ orderBy: [{ status: "asc" }, { loggedAt: "desc" }] }),
      prisma.alliedResource.findMany({
        where: { status: { not: "DEAD" } },
        include: { municipio: { select: { name: true, divipolaCode: true } } },
        orderBy: [{ tier: "asc" }, { name: "asc" }],
      }),
    ]);

  const body = {
    generatedAt: new Date().toISOString(),
    source: SITE_URL,
    license: "MIT (code) -- data is a compilation of publicly cited sources, each record carries its own attribution",
    methodology: `${SITE_URL}/metodologia`,
    event,
    tollRecords,
    aidPoints,
    crowdfundingCampaigns: campaigns,
    govReports,
    contradictions,
    alliedResources,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "inline; filename=soscolombia-dataset.json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
