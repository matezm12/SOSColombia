import { Card } from "./Card";
import { Link } from "@/i18n/navigation";
import { formatNumber, formatDate } from "@/lib/format";

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export function Stat({
  value,
  unit,
  label,
  sourceOrg,
  asOf,
  href,
  locale = "es",
}: {
  value: number;
  unit?: string | null;
  label: string;
  sourceOrg?: string;
  asOf?: Date;
  href?: string;
  locale?: string;
}) {
  const inner = (
    <>
      <p className="text-2xl font-semibold text-black dark:text-zinc-50">
        {formatNumber(value, locale)}
        {unit && <span className="ml-1 text-sm font-normal text-zinc-500">{unit}</span>}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
      {(sourceOrg || asOf) && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
          {sourceOrg}
          {sourceOrg && asOf && " · "}
          {asOf && formatDate(asOf, locale)}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
        <Link href={href}>{inner}</Link>
      </Card>
    );
  }

  return <Card>{inner}</Card>;
}
