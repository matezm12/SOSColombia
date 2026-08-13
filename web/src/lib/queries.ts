import { prisma } from "./prisma";
import type { TollRecord } from "@prisma/client";

/**
 * Picks the best available death-toll record for a municipio, preferring the
 * official administrative count but falling back to the forensic-confirmed
 * count when that's all that's on file (e.g. Pereira, which only has INMLCF's
 * identified-victim count seeded). The two metrics are never silently merged
 * — the caller gets back which one it received via `metric`, and should label
 * it accordingly (see METRIC_LABEL in src/lib/labels.ts).
 */
export function bestDeathMetric(
  records: Pick<TollRecord, "metric" | "value" | "asOf">[],
): { metric: "DEATHS_REPORTED_OFFICIAL" | "DEATHS_CONFIRMED_FORENSIC"; value: number; asOf: Date } | null {
  const official = records
    .filter((r) => r.metric === "DEATHS_REPORTED_OFFICIAL")
    .sort((a, b) => b.asOf.getTime() - a.asOf.getTime())[0];
  if (official) return { metric: "DEATHS_REPORTED_OFFICIAL", value: official.value, asOf: official.asOf };

  const forensic = records
    .filter((r) => r.metric === "DEATHS_CONFIRMED_FORENSIC")
    .sort((a, b) => b.asOf.getTime() - a.asOf.getTime())[0];
  if (forensic) return { metric: "DEATHS_CONFIRMED_FORENSIC", value: forensic.value, asOf: forensic.asOf };

  return null;
}

/** National-level toll records — municipioId AND departmentId both null. */
export async function nationalTollRecords() {
  return prisma.tollRecord.findMany({
    where: { municipioId: null, departmentId: null },
    include: { source: true },
    orderBy: [{ metric: "asc" }, { asOf: "desc" }],
  });
}

/** Department-level toll records — departmentId set, municipioId null. */
export async function departmentTollRecords() {
  return prisma.tollRecord.findMany({
    where: { municipioId: null, departmentId: { not: null } },
    include: { source: true, department: true },
    orderBy: [{ department: { name: "asc" } }, { metric: "asc" }, { asOf: "desc" }],
  });
}

/** Latest value per metric from a list of records (append-only history stays
 *  intact in the DB — this just picks what to show by default). */
export function latestByMetric<T extends { metric: string; asOf: Date }>(records: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const r of [...records].sort((a, b) => b.asOf.getTime() - a.asOf.getTime())) {
    if (seen.has(r.metric)) continue;
    seen.add(r.metric);
    result.push(r);
  }
  return result;
}
