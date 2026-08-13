import type { Contradiction } from "@prisma/client";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { CONTRADICTION_STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export function ContradictionCard({ contradiction: c }: { contradiction: Contradiction }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-medium text-black dark:text-zinc-50">{c.topic}</span>
        <Badge variant="contradiction" value={c.status}>
          {CONTRADICTION_STATUS_LABEL[c.status] ?? c.status}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="rounded border border-zinc-100 p-2 dark:border-zinc-900">
          <p className="text-black dark:text-zinc-50">{c.valueA}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{c.sourceA}</p>
        </div>
        <div className="rounded border border-zinc-100 p-2 dark:border-zinc-900">
          <p className="text-black dark:text-zinc-50">{c.valueB}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{c.sourceB}</p>
        </div>
      </div>
      {c.resolutionText && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{c.resolutionText}</p>
      )}
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
        Registrada {formatDate(c.loggedAt)}
        {c.resolvedAt && ` · resuelta ${formatDate(c.resolvedAt)}`}
      </p>
    </Card>
  );
}
