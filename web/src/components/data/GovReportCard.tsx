import type { GovReport } from "@prisma/client";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLink } from "../ui/ExternalLink";
import { ShareButton } from "../ui/ShareButton";
import { TIER_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export function GovReportCard({ report }: { report: GovReport }) {
  const keyFigures =
    report.keyFigures && typeof report.keyFigures === "object" && !Array.isArray(report.keyFigures)
      ? (report.keyFigures as Record<string, unknown>)
      : null;

  return (
    <Card id={report.id} className="relative">
      <ShareButton anchorId={report.id} label={report.title} />
      <div className="flex items-center justify-between gap-2 pr-8">
        <span className="font-medium text-black dark:text-zinc-50">{report.title}</span>
        <Badge variant="tier" value={report.sourceTier}>
          {TIER_LABEL[report.sourceTier] ?? `nivel ${report.sourceTier}`}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        {report.org} · {report.docType} · {formatDate(report.date)}
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{report.summary}</p>

      {keyFigures && Object.keys(keyFigures).length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-900">
          {Object.entries(keyFigures).map(([key, value]) => (
            <div key={key}>
              <dt className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
                {key}
              </dt>
              <dd className="text-sm text-zinc-700 dark:text-zinc-300">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      {report.url && (
        <p className="mt-3 text-sm">
          <ExternalLink href={report.url}>Ver documento</ExternalLink>
        </p>
      )}
    </Card>
  );
}
