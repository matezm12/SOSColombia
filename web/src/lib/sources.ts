import { prisma } from "./prisma";
import type { Source, SourceStatus } from "@prisma/client";

/**
 * Find-or-update a Source by URL rather than always inserting a new row —
 * previously every approved PendingTollRecord/PendingAidPoint created a fresh
 * Source, so re-approving updates from the same outlet (e.g. a second INMLCF
 * Comunicado) piled up duplicate rows on /fuentes, each with its own stale
 * lastFetchedAt, instead of one row that stays current.
 *
 * No @unique constraint on Source.url in the schema — several seeded rows
 * intentionally share the placeholder "not directly located" URL — so this
 * does the find-then-write in application code rather than a DB-level upsert.
 */
export async function upsertSource(params: {
  url: string;
  org: string;
  tier: number;
  status?: SourceStatus;
}): Promise<Source> {
  const { url, org, tier, status = "LIVE" } = params;
  const existing = await prisma.source.findFirst({ where: { url } });

  if (existing) {
    return prisma.source.update({
      where: { id: existing.id },
      data: { org, tier, status, lastFetchedAt: new Date() },
    });
  }

  return prisma.source.create({
    data: { url, org, tier, status, lastFetchedAt: new Date() },
  });
}
