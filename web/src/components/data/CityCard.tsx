import Link from "next/link";
import { Badge } from "../ui/Badge";
import { SEVERITY_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

export function CityCard({
  name,
  divipolaCode,
  departmentName,
  severityLabel,
  deathValue,
  deathLabel,
}: {
  name: string;
  divipolaCode: string;
  departmentName: string;
  severityLabel: string | null;
  deathValue?: number;
  deathLabel?: string;
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
            {SEVERITY_LABEL[severityLabel] ?? severityLabel}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        {departmentName}
        {deathValue !== undefined &&
          ` · ${formatNumber(deathValue)} ${deathLabel ?? "fallecidos reportados"}`}
      </p>
    </Link>
  );
}
