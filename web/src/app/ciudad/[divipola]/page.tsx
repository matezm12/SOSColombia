import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { TollCard } from "@/components/data/TollCard";
import { AidPointCard } from "@/components/data/AidPointCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { AID_KIND_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

// Toll figures and aid points update constantly — never freeze at build time.
// (Already rendered dynamically by default due to the [divipola] segment with no
// generateStaticParams, but stated explicitly rather than relying on that implicit
// behavior.)
export const dynamic = "force-dynamic";

export default async function CiudadPage(
  props: PageProps<"/ciudad/[divipola]">
) {
  const { divipola } = await props.params;

  const municipio = await prisma.municipio.findUnique({
    where: { divipolaCode: divipola },
    include: {
      department: true,
      tollRecords: {
        include: { source: true },
        orderBy: [{ metric: "asc" }, { asOf: "desc" }],
      },
      aidPoints: {
        include: { source: true },
        orderBy: { kind: "asc" },
      },
    },
  });

  if (!municipio) notFound();

  // Latest value per metric — full history stays visible below, never overwritten in the DB itself.
  const latestByMetric = new Map<string, (typeof municipio.tollRecords)[number]>();
  for (const record of municipio.tollRecords) {
    if (!latestByMetric.has(record.metric)) latestByMetric.set(record.metric, record);
  }

  const aidByKind = Object.groupBy(municipio.aidPoints, (a) => a.kind);

  return (
    <PageShell
      backHref="/"
      backLabel="Todas las ciudades"
      title={municipio.name}
    >
      <p className="-mt-2 text-zinc-500 dark:text-zinc-500">
        {municipio.department.name} · DIVIPOLA {municipio.divipolaCode}
        {municipio.populationDane &&
          ` · ${formatNumber(municipio.populationDane)} habitantes (DANE)`}
      </p>

      <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
        Cifras
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[...latestByMetric.values()].map((record) => (
          <TollCard key={record.id} record={record} />
        ))}
        {latestByMetric.size === 0 && (
          <EmptyState>Sin cifras publicadas todavía para esta ciudad.</EmptyState>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
        Puntos de ayuda
      </h2>
      <div className="mt-4 space-y-6">
        {Object.entries(aidByKind).map(([kind, points]) => (
          <div key={kind}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {AID_KIND_LABEL[kind] ?? kind}
            </h3>
            <ul className="mt-2 space-y-2">
              {points?.map((point) => (
                <li key={point.id}>
                  <AidPointCard point={point} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {municipio.aidPoints.length === 0 && (
          <EmptyState>Sin puntos de ayuda confirmados todavía para esta ciudad.</EmptyState>
        )}
      </div>
    </PageShell>
  );
}
