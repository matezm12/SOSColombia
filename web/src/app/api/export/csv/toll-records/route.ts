import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";
import { METRIC_LABEL } from "@/lib/labels";

// CSV export of the toll-records table -- the most naturally tabular of the
// datasets, and the one most likely to actually get opened in a spreadsheet.
// Same ISR window as the JSON export.
export const revalidate = 60;

const COLUMNS = [
  "metric",
  "metricLabel",
  "value",
  "unit",
  "tier",
  "asOf",
  "retrievedAt",
  "municipio",
  "department",
  "sourceOrg",
  "sourceUrl",
  "notes",
];

export async function GET() {
  const records = await prisma.tollRecord.findMany({
    include: {
      municipio: { select: { name: true } },
      department: { select: { name: true } },
      source: { select: { org: true, url: true } },
    },
    orderBy: [{ metric: "asc" }, { asOf: "desc" }],
  });

  const rows = records.map((r) => ({
    metric: r.metric,
    metricLabel: METRIC_LABEL[r.metric] ?? r.metric,
    value: r.value,
    unit: r.unit ?? "",
    tier: r.tier,
    asOf: r.asOf,
    retrievedAt: r.retrievedAt,
    municipio: r.municipio?.name ?? "",
    department: r.department?.name ?? "",
    sourceOrg: r.source.org,
    sourceUrl: r.source.url,
    notes: r.notes ?? "",
  }));

  return new Response(toCsv(rows, COLUMNS), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=soscolombia-cifras.csv",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
