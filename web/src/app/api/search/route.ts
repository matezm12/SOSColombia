import { prisma } from "@/lib/prisma";

// Public, unauthenticated (same posture as /api/export) — grouped search
// across the site's own published data. Deliberately curated to what's
// actually useful to find: excludes TollRecord (numeric stats, better
// discovered via a Municipio result), Contradiction (methodology-page
// audience), and SocialPost (ephemeral/unverified community content).
//
// Prisma's `contains`/`insensitive` filters are parameterized automatically
// -- never build this with $queryRaw string interpolation.
//
// Same PUBLISHED/non-DEAD filtering as /api/export, for the same reason:
// Story has draft admin-authored content that isn't public yet, and
// AlliedResource tracks dead/blocked links that shouldn't surface as a
// live result.

const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 2;
const PER_CATEGORY_LIMIT = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";

  if (rawQuery.length < MIN_QUERY_LENGTH) {
    return Response.json({
      municipios: [],
      veredas: [],
      aidPoints: [],
      stories: [],
      campaigns: [],
      resources: [],
      reports: [],
    });
  }

  const q = rawQuery;
  const contains = { contains: q, mode: "insensitive" as const };

  const [municipios, veredas, aidPoints, stories, campaigns, resources, reports] =
    await Promise.all([
      prisma.municipio.findMany({
        where: { name: contains },
        select: { id: true, name: true, divipolaCode: true },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.vereda.findMany({
        where: { name: contains },
        select: {
          id: true,
          name: true,
          slug: true,
          municipio: { select: { divipolaCode: true, name: true } },
        },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.aidPoint.findMany({
        where: { OR: [{ name: contains }, { needsText: contains }, { address: contains }] },
        select: {
          id: true,
          name: true,
          needsText: true,
          municipio: { select: { divipolaCode: true, name: true } },
        },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.story.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { titleEs: contains },
            { titleEn: contains },
            { ledeEs: contains },
            { ledeEn: contains },
          ],
        },
        select: { id: true, slug: true, titleEs: true, titleEn: true, ledeEs: true, ledeEn: true },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.crowdfundingCampaign.findMany({
        where: { OR: [{ title: contains }, { orgOrPerson: contains }] },
        select: {
          id: true,
          title: true,
          orgOrPerson: true,
          municipios: { select: { divipolaCode: true, name: true }, take: 1 },
        },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.alliedResource.findMany({
        where: { status: { not: "DEAD" }, OR: [{ name: contains }, { description: contains }] },
        select: { id: true, name: true, description: true },
        take: PER_CATEGORY_LIMIT,
      }),
      prisma.govReport.findMany({
        where: { OR: [{ title: contains }, { summary: contains }] },
        select: { id: true, title: true, org: true },
        take: PER_CATEGORY_LIMIT,
      }),
    ]);

  return Response.json({
    municipios,
    veredas: veredas.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      municipioDivipolaCode: v.municipio.divipolaCode,
      municipioName: v.municipio.name,
    })),
    aidPoints: aidPoints.map((p) => ({
      id: p.id,
      name: p.name,
      needsText: p.needsText,
      municipioDivipolaCode: p.municipio.divipolaCode,
      municipioName: p.municipio.name,
    })),
    stories: stories.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: locale === "en" ? s.titleEn : s.titleEs,
      lede: locale === "en" ? s.ledeEn : s.ledeEs,
    })),
    campaigns: campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      orgOrPerson: c.orgOrPerson,
      municipioDivipolaCode: c.municipios[0]?.divipolaCode ?? null,
      municipioName: c.municipios[0]?.name ?? null,
    })),
    resources,
    reports,
  });
}
