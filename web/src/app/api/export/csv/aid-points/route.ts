import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { AID_KIND_LABEL, AID_STATUS_LABEL } from "@/lib/labels";

// CSV export of the aid-points table. Same ISR window as the JSON export.
export const revalidate = 60;

const COLUMNS = [
  "kind",
  "kindLabel",
  "name",
  "status",
  "statusLabel",
  "municipio",
  "address",
  "phone",
  "needsText",
  "accessRestriction",
  "sourceOrg",
  "sourceUrl",
  "permalink",
  "lastVerifiedAt",
];

export async function GET() {
  const points = await prisma.aidPoint.findMany({
    include: {
      municipio: { select: { name: true } },
      source: { select: { org: true, url: true } },
    },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  const rows = points.map((p) => ({
    kind: p.kind,
    kindLabel: AID_KIND_LABEL[p.kind] ?? p.kind,
    name: p.name,
    status: p.status,
    statusLabel: AID_STATUS_LABEL[p.status] ?? p.status,
    municipio: p.municipio.name,
    address: p.address ?? "",
    phone: p.phone ?? "",
    needsText: p.needsText ?? "",
    accessRestriction: p.accessRestriction ?? "",
    sourceOrg: p.source.org,
    sourceUrl: p.source.url,
    permalink: p.permalink ?? "",
    lastVerifiedAt: p.lastVerifiedAt,
  }));

  return new Response(toCsv(rows, COLUMNS), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=soscolombia-puntos-de-ayuda.csv",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
