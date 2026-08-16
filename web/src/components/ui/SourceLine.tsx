import { Badge } from "./Badge";
import { tierLabel } from "@/lib/labels";
import { formatDate } from "@/lib/format";

/** The "org · tier badge · date" line repeated on every toll/aid/report card. */
export function SourceLine({
  org,
  tier,
  date,
  locale,
}: {
  org: string;
  tier?: number;
  date?: Date;
  locale: string;
}) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600">
      <span>{org}</span>
      {tier !== undefined && (
        <>
          <span>·</span>
          <Badge variant="tier" value={tier}>
            {tierLabel(tier, locale)}
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
