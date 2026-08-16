import { prisma } from "./prisma";
import { formatDate, formatNumber } from "./format";
import { metricLabel, aidKindLabel, aidStatusLabel, verificationLabel } from "./labels";

// Public audit trail: a merged, timestamp-sorted view across every table that
// carries its own "when did this change" field. There's no dedicated Change
// log table -- this reads the same append-only discipline the rest of the
// site already relies on (TollRecord never overwrites, Contradiction logs
// both sides, etc.) and just exposes it as a feed instead of leaving it
// implicit. Pending* moderation-queue tables are excluded, same as /api/export.
const LIMIT_PER_TABLE = 40;
const TOTAL_LIMIT = 80;

type TollRecordEntry = Awaited<ReturnType<typeof fetchTollRecords>>[number];
type ContradictionEntry = Awaited<ReturnType<typeof fetchContradictions>>[number];
type AidPointEntry = Awaited<ReturnType<typeof fetchAidPoints>>[number];
type CampaignEntry = Awaited<ReturnType<typeof fetchCampaigns>>[number];
type AlliedResourceEntry = Awaited<ReturnType<typeof fetchAlliedResources>>[number];

export type ActivityEntry =
  | { type: "TOLL_RECORD"; at: Date; record: TollRecordEntry }
  | { type: "CONTRADICTION"; at: Date; record: ContradictionEntry }
  | { type: "AID_POINT"; at: Date; record: AidPointEntry }
  | { type: "CAMPAIGN"; at: Date; record: CampaignEntry }
  | { type: "ALLIED_RESOURCE"; at: Date; record: AlliedResourceEntry };

function fetchTollRecords() {
  return prisma.tollRecord.findMany({
    include: {
      municipio: { select: { name: true, divipolaCode: true } },
      department: { select: { name: true } },
      source: { select: { org: true } },
    },
    orderBy: { retrievedAt: "desc" },
    take: LIMIT_PER_TABLE,
  });
}

function fetchContradictions() {
  return prisma.contradiction.findMany({
    orderBy: { loggedAt: "desc" },
    take: LIMIT_PER_TABLE,
  });
}

function fetchAidPoints() {
  return prisma.aidPoint.findMany({
    include: { municipio: { select: { name: true, divipolaCode: true } } },
    orderBy: { lastVerifiedAt: "desc" },
    take: LIMIT_PER_TABLE,
  });
}

function fetchCampaigns() {
  return prisma.crowdfundingCampaign.findMany({
    orderBy: { lastCheckedAt: "desc" },
    take: LIMIT_PER_TABLE,
  });
}

function fetchAlliedResources() {
  return prisma.alliedResource.findMany({
    where: { status: { not: "DEAD" } },
    orderBy: { addedAt: "desc" },
    take: LIMIT_PER_TABLE,
  });
}

/** Merged, most-recent-first activity feed across every append-only table. */
export async function recentActivity(): Promise<ActivityEntry[]> {
  const [tollRecords, contradictions, aidPoints, campaigns, resources] = await Promise.all([
    fetchTollRecords(),
    fetchContradictions(),
    fetchAidPoints(),
    fetchCampaigns(),
    fetchAlliedResources(),
  ]);

  const entries: ActivityEntry[] = [
    ...tollRecords.map((record) => ({ type: "TOLL_RECORD" as const, at: record.retrievedAt, record })),
    ...contradictions.map((record) => ({ type: "CONTRADICTION" as const, at: record.loggedAt, record })),
    ...aidPoints.map((record) => ({ type: "AID_POINT" as const, at: record.lastVerifiedAt, record })),
    ...campaigns.map((record) => ({ type: "CAMPAIGN" as const, at: record.lastCheckedAt, record })),
    ...resources.map((record) => ({ type: "ALLIED_RESOURCE" as const, at: record.addedAt, record })),
  ];

  entries.sort((a, b) => b.at.getTime() - a.at.getTime());
  return entries.slice(0, TOTAL_LIMIT);
}

/**
 * Plain-text description of one entry -- shared by the page and its
 * markdown mirror. `t` is a resolved getTranslations({namespace: "cambios"})
 * for the caller's locale, passed in rather than fetched here so this stays
 * synchronous and doesn't re-resolve translations once per entry.
 */
export function describeEntry(
  entry: ActivityEntry,
  locale: string,
  t: (key: string) => string,
): { action: string; text: string; href: string } {
  switch (entry.type) {
    case "TOLL_RECORD": {
      const r = entry.record;
      const place = r.municipio?.name ?? r.department?.name ?? t("nacional");
      const label = metricLabel(r.metric, locale);
      return {
        action: t("actionNuevaCifra"),
        text: `${label} — ${formatNumber(r.value)}${r.unit ? ` ${r.unit}` : ""} (${place}), ${t("fuenteLabel")} ${r.source.org}, ${t("datoAl")} ${formatDate(r.asOf)}`,
        href: r.municipio ? `/ciudad/${r.municipio.divipolaCode}` : "/cifras",
      };
    }
    case "CONTRADICTION": {
      const c = entry.record;
      return {
        action: c.status === "OPEN" ? t("actionDiscrepanciaRegistrada") : t("actionDiscrepanciaResuelta"),
        text: c.topic,
        href: "/metodologia",
      };
    }
    case "AID_POINT": {
      const a = entry.record;
      return {
        action: t("actionPuntoVerificado"),
        text: `${a.name} (${aidKindLabel(a.kind, locale)}), ${a.municipio.name} — ${aidStatusLabel(a.status, locale)}`,
        href: `/ciudad/${a.municipio.divipolaCode}`,
      };
    }
    case "CAMPAIGN": {
      const c = entry.record;
      return {
        action: t("actionCampanaRevisada"),
        text: `${c.title} (${c.orgOrPerson}) — ${verificationLabel(c.verificationStatus, locale)}`,
        href: "/donar",
      };
    }
    case "ALLIED_RESOURCE": {
      const r = entry.record;
      return {
        action: t("actionRecursoAgregado"),
        text: `${r.name} — ${r.description}`,
        href: "/recursos",
      };
    }
  }
}
