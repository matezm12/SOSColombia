"use client";

import { useMemo, useState } from "react";
import type { Prisma } from "@prisma/client";
import { setSocialPostFeatured } from "./actions";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SOCIAL_CATEGORY_LABEL, SOCIAL_PLATFORM_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

type LivePost = Prisma.SocialPostGetPayload<{
  include: { municipio: { select: { name: true } }; vereda: { select: { name: true } } };
}> & { municipioId: string | null };

// Same client-side filter-chip pattern as CommunityFeed.tsx (the public
// /comunidad feed) — 578+ live posts across 13 cities made a flat list
// unusable for finding anything outside the most recent handful.
export function LivePostsList({ posts }: { posts: LivePost[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const cities = useMemo(() => {
    const byId = new Map<string, { name: string; count: number }>();
    for (const p of posts) {
      if (!p.municipio || !p.municipioId) continue;
      const entry = byId.get(p.municipioId);
      if (entry) {
        entry.count += 1;
      } else {
        byId.set(p.municipioId, { name: p.municipio.name, count: 1 });
      }
    }
    return Array.from(byId.entries())
      .map(([municipioId, v]) => ({ municipioId, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [posts]);

  const filtered = selected ? posts.filter((p) => p.municipioId === selected) : posts;

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={
            selected === null
              ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
              : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }
        >
          Todas ({posts.length})
        </button>
        {cities.map((c) => (
          <button
            key={c.municipioId}
            type="button"
            onClick={() => setSelected(c.municipioId)}
            className={
              selected === c.municipioId
                ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black"
                : "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg border px-4 py-2.5 text-sm ${
              p.featured
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-zinc-700 dark:text-zinc-300">
                <ExternalLink href={p.permalink}>{p.permalink}</ExternalLink>
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {SOCIAL_PLATFORM_LABEL[p.platform] ?? p.platform} · {SOCIAL_CATEGORY_LABEL[p.category] ?? p.category}
                {p.municipio && ` · ${p.municipio.name}`}
                {p.vereda && ` · ${p.vereda.name}`}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
              Capturado {formatDateTime(p.capturedAt)}
              {p.featured && (
                <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                  Destacada
                </span>
              )}
            </p>
            <form action={setSocialPostFeatured} className="mt-2 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="featured" value={String(!p.featured)} />
              <input
                type="text"
                name="featuredNote"
                defaultValue={p.featuredNote ?? ""}
                maxLength={160}
                placeholder="Cita corta (opcional)"
                className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className={
                  p.featured
                    ? "shrink-0 rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    : "shrink-0 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                }
              >
                {p.featured ? "Quitar de destacados" : "Destacar"}
              </button>
            </form>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState>Ninguna publicación para este filtro.</EmptyState>}
      </div>
    </>
  );
}
