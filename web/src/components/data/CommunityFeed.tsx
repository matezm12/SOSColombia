"use client";

import { useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { CommunityPostCard } from "./CommunityPostCard";
import { EmptyState } from "../ui/EmptyState";

type PostWithMunicipio = Prisma.SocialPostGetPayload<{
  include: { municipio: { select: { name: true; divipolaCode: true } } };
}>;

export function CommunityFeed({
  posts,
  allLabel,
  emptyFilteredLabel,
  locale,
}: {
  posts: PostWithMunicipio[];
  allLabel: string;
  emptyFilteredLabel: string;
  locale: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const cities = useMemo(() => {
    const byCode = new Map<string, { name: string; count: number }>();
    for (const p of posts) {
      if (!p.municipio) continue;
      const entry = byCode.get(p.municipio.divipolaCode);
      if (entry) {
        entry.count += 1;
      } else {
        byCode.set(p.municipio.divipolaCode, { name: p.municipio.name, count: 1 });
      }
    }
    return Array.from(byCode.entries())
      .map(([divipolaCode, v]) => ({ divipolaCode, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [posts]);

  const filtered = selected
    ? posts.filter((p) => p.municipio?.divipolaCode === selected)
    : posts;

  if (cities.length === 0) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((p) => (
          <CommunityPostCard key={p.id} post={p} locale={locale} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={
            selected === null
              ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
              : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }
        >
          {allLabel} ({posts.length})
        </button>
        {cities.map((c) => (
          <button
            key={c.divipolaCode}
            type="button"
            onClick={() => setSelected(c.divipolaCode)}
            className={
              selected === c.divipolaCode
                ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
                : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <CommunityPostCard key={p.id} post={p} locale={locale} />
        ))}
        {filtered.length === 0 && <EmptyState>{emptyFilteredLabel}</EmptyState>}
      </div>
    </>
  );
}
