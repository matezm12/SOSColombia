import type { Prisma } from "@prisma/client";
import { Card } from "../ui/Card";
import { SourceLine } from "../ui/SourceLine";
import { METRIC_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

type TollRecordWithSource = Prisma.TollRecordGetPayload<{ include: { source: true } }>;

export function TollCard({ record }: { record: TollRecordWithSource }) {
  return (
    <Card>
      <p className="text-2xl font-semibold text-black dark:text-zinc-50">
        {formatNumber(record.value)}
        {record.unit && (
          <span className="ml-1 text-sm font-normal text-zinc-500">{record.unit}</span>
        )}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {METRIC_LABEL[record.metric] ?? record.metric}
      </p>
      <SourceLine org={record.source.org} tier={record.tier} date={record.asOf} />
      {record.notes && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{record.notes}</p>
      )}
    </Card>
  );
}
