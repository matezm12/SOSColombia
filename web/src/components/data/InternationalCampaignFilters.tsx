"use client";

import { useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { CampaignCard } from "./CampaignCard";
import { SectionHeading } from "../ui/SectionHeading";
import { EmptyState } from "../ui/EmptyState";
import { CROWDFUNDING_PLATFORM_LABEL } from "@/lib/labels";

type CampaignWithMunicipios = Prisma.CrowdfundingCampaignGetPayload<{
  include: { municipios: { select: { name: true; divipolaCode: true } } };
}>;

const NATIONAL_KEY = "__national__";

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
          : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }
    >
      {children}
    </button>
  );
}

export function InternationalCampaignFilters({
  campaigns,
  labels,
}: {
  campaigns: CampaignWithMunicipios[];
  labels: {
    typeLabel: string;
    cityLabel: string;
    allTypes: string;
    allCities: string;
    national: string;
    sectionVerified: string;
    sectionIndividual: string;
    individualSubtext: string;
    sectionFlagged: string;
    emptyVerified: string;
    emptyFiltered: string;
  };
}) {
  const [platform, setPlatform] = useState<string | null>(null);
  const [cityKey, setCityKey] = useState<string | null>(null);

  const platforms = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of campaigns) counts.set(c.platform, (counts.get(c.platform) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [campaigns]);

  const cities = useMemo(() => {
    const byCode = new Map<string, { name: string; count: number }>();
    let nationalCount = 0;
    for (const c of campaigns) {
      if (c.municipios.length === 0) {
        nationalCount++;
        continue;
      }
      for (const m of c.municipios) {
        const entry = byCode.get(m.divipolaCode);
        if (entry) entry.count += 1;
        else byCode.set(m.divipolaCode, { name: m.name, count: 1 });
      }
    }
    const sorted = Array.from(byCode.entries())
      .map(([divipolaCode, v]) => ({ key: divipolaCode, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (nationalCount > 0) sorted.push({ key: NATIONAL_KEY, name: labels.national, count: nationalCount });
    return sorted;
  }, [campaigns, labels.national]);

  const filtered = campaigns.filter((c) => {
    if (platform && c.platform !== platform) return false;
    if (cityKey === NATIONAL_KEY && c.municipios.length > 0) return false;
    if (cityKey && cityKey !== NATIONAL_KEY && !c.municipios.some((m) => m.divipolaCode === cityKey)) return false;
    return true;
  });

  const verified = filtered.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = filtered.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = filtered.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  return (
    <>
      {platforms.length > 1 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            {labels.typeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={platform === null} onClick={() => setPlatform(null)}>
              {labels.allTypes} ({campaigns.length})
            </FilterPill>
            {platforms.map(([p, count]) => (
              <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                {CROWDFUNDING_PLATFORM_LABEL[p] ?? p} ({count})
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {cities.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            {labels.cityLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={cityKey === null} onClick={() => setCityKey(null)}>
              {labels.allCities} ({campaigns.length})
            </FilterPill>
            {cities.map((c) => (
              <FilterPill key={c.key} active={cityKey === c.key} onClick={() => setCityKey(c.key)}>
                {c.name} ({c.count})
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      <SectionHeading first>{labels.sectionVerified}</SectionHeading>
      <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        {verified.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
        {verified.length === 0 && <EmptyState>{filtered.length === 0 && campaigns.length > 0 ? labels.emptyFiltered : labels.emptyVerified}</EmptyState>}
      </div>

      {individual.length > 0 && (
        <>
          <SectionHeading>{labels.sectionIndividual}</SectionHeading>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">{labels.individualSubtext}</p>
          <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
            {individual.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}

      {flagged.length > 0 && (
        <>
          <SectionHeading>{labels.sectionFlagged}</SectionHeading>
          <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
            {flagged.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
