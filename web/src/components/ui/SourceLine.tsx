import { Badge } from "./Badge";
import { TIER_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

/** The "org · tier badge · date" line repeated on every toll/aid/report card. */
export function SourceLine({
  org,
  tier,
  date,
}: {
  org: string;
  tier?: number;
  date?: Date;
}) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600">
      <span>{org}</span>
      {tier !== undefined && (
        <>
          <span>·</span>
          <Badge variant="tier" value={tier}>
            {TIER_LABEL[tier] ?? `nivel ${tier}`}
          </Badge>
        </>
      )}
      {date && (
        <>
          <span>·</span>
          <span>{formatDate(date)}</span>
        </>
      )}
    </p>
  );
}
