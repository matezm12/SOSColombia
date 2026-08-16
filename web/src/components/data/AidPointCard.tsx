import type { Prisma } from "@prisma/client";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLink } from "../ui/ExternalLink";
import { SourceLine } from "../ui/SourceLine";
import { ShareButton } from "../ui/ShareButton";
import { GoFundMeEmbed } from "./GoFundMeEmbed";
import { isGoFundMeUrl } from "@/lib/gofundme";
import { aidStatusLabel } from "@/lib/labels";

type AidPointWithSource = Prisma.AidPointGetPayload<{ include: { source: true } }>;

export function AidPointCard({ point, locale }: { point: AidPointWithSource; locale: string }) {
  const link = point.permalink ?? point.source.url;

  return (
    <Card id={point.id} className="relative">
      <ShareButton anchorId={point.id} label={point.name} />
      <div className="flex items-center justify-between gap-2 pr-8">
        <span className="font-medium text-black dark:text-zinc-50">{point.name}</span>
        <Badge variant="status" value={point.status}>
          {aidStatusLabel(point.status, locale)}
        </Badge>
      </div>

      {point.address && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{point.address}</p>
      )}

      {point.phone && (
        <p className="mt-1 text-sm">
          <a
            href={`tel:${point.phone.replace(/\s+/g, "")}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {point.phone}
          </a>
        </p>
      )}

      {point.accessRestriction && (
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
          Acceso restringido: {point.accessRestriction}
        </p>
      )}

      {point.needsText && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Necesita: {point.needsText}
        </p>
      )}

      {isGoFundMeUrl(link) ? (
        // The widget itself shows title/progress/raised-goal/donate button —
        // no need to duplicate that as a plain link (see CampaignCard).
        <div className="mt-2">
          <GoFundMeEmbed url={link} />
        </div>
      ) : (
        link && (
          <p className="mt-2 text-sm">
            <ExternalLink href={link}>
              {point.permalink ? "Ver publicación original" : "Ver fuente"}
            </ExternalLink>
          </p>
        )
      )}

      <SourceLine
        org={point.source.org}
        tier={point.source.tier}
        date={point.lastVerifiedAt}
        locale={locale}
      />
    </Card>
  );
}
