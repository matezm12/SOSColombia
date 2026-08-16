import type { Prisma } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLink } from "../ui/ExternalLink";
import { ShareButton } from "../ui/ShareButton";
import { GoFundMeEmbed } from "./GoFundMeEmbed";
import { isGoFundMeUrl } from "@/lib/gofundme";
import {
  crowdfundingPlatformLabel,
  verificationLabel,
} from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}> & { stories?: { slug: string }[] };

export function CampaignCard({
  campaign,
  locale,
}: {
  campaign: CampaignWithMunicipios;
  locale: string;
}) {
  return (
    <Card id={campaign.id} className="relative">
      <ShareButton anchorId={campaign.id} label={campaign.title} />
      {/* Stacked, not side-by-side — same reasoning as AlliedResourceCard: a
          title+badges row with no flex-wrap risked the badges overflowing the
          card edge for a long title or several badges at once (e.g. "Riesgo
          de fraude" + "Internacional" + "Mensual" together). Badges wrap onto
          their own line(s) here regardless of how many or how long. */}
      <div className="pr-8">
        <span className="font-medium text-black dark:text-zinc-50">{campaign.title}</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {campaign.international && (
            <Badge variant="neutral">Internacional</Badge>
          )}
          {campaign.recurring && <Badge variant="neutral">Mensual</Badge>}
          <Badge variant="verification" value={campaign.verificationStatus}>
            {verificationLabel(campaign.verificationStatus, locale)}
          </Badge>
        </div>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{campaign.orgOrPerson}</p>

      {campaign.municipios.length > 0 && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Enfoque:{" "}
          {campaign.municipios.map((m, i) => (
            <span key={m.divipolaCode}>
              {i > 0 && ", "}
              <Link
                href={`/ciudad/${m.divipolaCode}`}
                className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:text-zinc-300"
              >
                {m.name}
              </Link>
            </span>
          ))}
        </p>
      )}

      {campaign.notes && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">{campaign.notes}</p>
      )}

      {campaign.stories && campaign.stories.length > 0 && (
        <p className="mt-2 text-sm">
          <Link
            href={`/historias/${campaign.stories[0].slug}`}
            className="font-medium underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:decoration-zinc-400"
          >
            Leer la historia completa →
          </Link>
        </p>
      )}

      {campaign.platform === "GOFUNDME" || isGoFundMeUrl(campaign.url) ? (
        // The widget itself shows title/progress/raised-goal/donate button —
        // no need to duplicate that as text here.
        <div className="mt-3">
          <GoFundMeEmbed url={campaign.url} />
        </div>
      ) : (
        <>
          {(campaign.goal !== null || campaign.raised !== null) && (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {campaign.raised !== null && (
                <>
                  Recaudado: <strong>{formatCurrency(campaign.raised, campaign.currency)}</strong>
                </>
              )}
              {campaign.goal !== null && (
                <> de meta {formatCurrency(campaign.goal, campaign.currency)}</>
              )}
              {campaign.donorCount !== null && <> · {formatNumber(campaign.donorCount)} donantes</>}
            </p>
          )}
          <p className="mt-2 text-sm">
            <ExternalLink href={campaign.url}>
              Ver en {crowdfundingPlatformLabel(campaign.platform, locale)}
            </ExternalLink>
          </p>
        </>
      )}

      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
        Última verificación: {formatDate(campaign.lastCheckedAt)}
      </p>
    </Card>
  );
}
