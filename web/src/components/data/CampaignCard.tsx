import type { CrowdfundingCampaign } from "@prisma/client";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLink } from "../ui/ExternalLink";
import { GoFundMeEmbed } from "./GoFundMeEmbed";
import {
  CROWDFUNDING_PLATFORM_LABEL,
  VERIFICATION_LABEL,
} from "@/lib/labels";
import { formatCurrency, formatNumber, formatDate } from "@/lib/format";

export function CampaignCard({ campaign }: { campaign: CrowdfundingCampaign }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-black dark:text-zinc-50">{campaign.title}</span>
        <Badge variant="verification" value={campaign.verificationStatus}>
          {VERIFICATION_LABEL[campaign.verificationStatus] ?? campaign.verificationStatus}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{campaign.orgOrPerson}</p>

      {campaign.notes && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">{campaign.notes}</p>
      )}

      {campaign.platform === "GOFUNDME" ? (
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
              Ver en {CROWDFUNDING_PLATFORM_LABEL[campaign.platform] ?? campaign.platform}
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
