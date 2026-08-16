import { Link } from "@/i18n/navigation";
import { Badge } from "../ui/Badge";
import { severityLabel as severityLabelFor } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

export function CityCard({
  name,
  divipolaCode,
  departmentName,
  severityLabel,
  deathValue,
  deathLabel,
  alertNote,
  locale,
}: {
  name: string;
  divipolaCode: string;
  departmentName: string;
  severityLabel: string | null;
  deathValue?: number;
  deathLabel?: string;
  alertNote?: string | null;
  locale: string;
}) {
  return (
    <Link
      href={`/ciudad/${divipolaCode}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-black dark:text-zinc-50">{name}</span>
        {severityLabel && (
          <Badge variant="severity" value={severityLabel}>
            {severityLabelFor(severityLabel, locale)}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        {departmentName}
        {deathValue !== undefined &&
          ` · ${formatNumber(deathValue)} ${deathLabel ?? "fallecidos reportados"}`}
      </p>
      {alertNote && (
        <p className="mt-1 text-sm font-medium text-severity-critica">{alertNote}</p>
      )}
    </Link>
  );
}
