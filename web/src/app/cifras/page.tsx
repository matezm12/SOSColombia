import Link from "next/link";
import { nationalTollRecords, departmentTollRecords, latestByMetric } from "@/lib/queries";
import { PageShell } from "@/components/layout/PageShell";
import { TollCard } from "@/components/data/TollCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { METRIC_LABEL } from "@/lib/labels";
import { formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CifrasPage() {
  const [national, byDepartment] = await Promise.all([
    nationalTollRecords(),
    departmentTollRecords(),
  ]);

  const latestNational = latestByMetric(national);

  // Full append-only history per metric, most recent first — this is the
  // project's core discipline made visible: numbers are never overwritten,
  // every prior report stays on the record.
  const historyByMetric = new Map<string, typeof national>();
  for (const r of national) {
    const list = historyByMetric.get(r.metric) ?? [];
    list.push(r);
    historyByMetric.set(r.metric, list);
  }

  const departmentsByMetric = new Map<string, typeof byDepartment>();
  for (const r of byDepartment) {
    const list = departmentsByMetric.get(r.metric) ?? [];
    list.push(r);
    departmentsByMetric.set(r.metric, list);
  }

  return (
    <PageShell
      width="wide"
      backHref="/"
      title="Cifras nacionales"
      lede="Cada cifra queda registrada con su fuente y fecha — nunca se sobrescribe. Abajo se muestra el valor más reciente de cada indicador, seguido del historial completo."
    >
      <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
        Últimos valores
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {latestNational.map((r) => (
          <TollCard key={r.id} record={r} />
        ))}
        {latestNational.length === 0 && (
          <EmptyState>Sin cifras nacionales publicadas todavía.</EmptyState>
        )}
      </div>

      {departmentsByMetric.size > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Por departamento
          </h2>
          {[...departmentsByMetric.entries()].map(([metric, records]) => (
            <div key={metric} className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {METRIC_LABEL[metric] ?? metric}
              </h3>
              <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <tbody>
                    {records
                      .sort((a, b) => b.value - a.value)
                      .map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                        >
                          <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                            {r.department?.name}
                          </td>
                          <td className="px-4 py-2 text-right font-medium text-black dark:text-zinc-50">
                            {formatNumber(r.value)}
                          </td>
                          <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                            {r.source.org} · {formatDate(r.asOf)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
        Historial completo
      </h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
        Los números de un desastre cambian de reporte a reporte — eso no
        siempre es un error. Aquí está cada valor publicado, no solo el más
        reciente.
      </p>
      <div className="mt-4 space-y-6">
        {[...historyByMetric.entries()].map(([metric, records]) => (
          <div key={metric}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {METRIC_LABEL[metric] ?? metric}
            </h3>
            <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <tbody>
                  {records
                    .sort((a, b) => b.asOf.getTime() - a.asOf.getTime())
                    .map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                      >
                        <td className="px-4 py-2 font-medium text-black dark:text-zinc-50">
                          {formatNumber(r.value)}
                          {r.unit && <span className="ml-1 font-normal text-zinc-500">{r.unit}</span>}
                        </td>
                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-500">
                          {formatDate(r.asOf)}
                        </td>
                        <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                          {r.source.org}
                        </td>
                        <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                          {r.notes}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-500">
        Para cifras por ciudad, ve a la <Link href="/" className="underline">página de cada ciudad</Link>.
      </p>
    </PageShell>
  );
}
