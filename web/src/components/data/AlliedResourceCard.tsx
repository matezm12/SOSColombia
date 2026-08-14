import type { AlliedResource } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLink } from "../ui/ExternalLink";
import { ALLIED_CATEGORY_LABEL, SOURCE_STATUS_LABEL, TIER_LABEL } from "@/lib/labels";

type ResourceWithOptionalMunicipio = AlliedResource & {
  municipio?: { name: string; divipolaCode: string } | null;
};

export function AlliedResourceCard({ resource }: { resource: ResourceWithOptionalMunicipio }) {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {resource.ogImageUrl && (
        // Arbitrary third-party social-preview images — can't be routed through
        // next/image without allowlisting every allied site's domain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resource.ogImageUrl}
          alt={resource.name}
          className="aspect-[1200/630] w-full border-b border-zinc-200 object-cover dark:border-zinc-800"
          loading="lazy"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-black dark:text-zinc-50">{resource.name}</span>
          <Badge variant="tier" value={resource.tier}>
            {TIER_LABEL[resource.tier] ?? `nivel ${resource.tier}`}
          </Badge>
        </div>
        {resource.org && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{resource.org}</p>
        )}
        {resource.municipio && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Ciudad:{" "}
            <Link
              href={`/ciudad/${resource.municipio.divipolaCode}`}
              className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800 hover:decoration-zinc-500 dark:decoration-zinc-700 dark:hover:text-zinc-300"
            >
              {resource.municipio.name}
            </Link>
          </p>
        )}
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{resource.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">{ALLIED_CATEGORY_LABEL[resource.category] ?? resource.category}</Badge>
          {resource.hostingNoCustomDomain && (
            <Badge variant="neutral">Sin dominio propio</Badge>
          )}
          {resource.status !== "LIVE" && (
            <Badge variant="neutral">{SOURCE_STATUS_LABEL[resource.status] ?? resource.status}</Badge>
          )}
        </div>

        <p className="mt-3 text-sm">
          <ExternalLink href={resource.url}>Visitar sitio</ExternalLink>
        </p>
      </div>
    </Card>
  );
}
