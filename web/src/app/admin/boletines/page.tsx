import { prisma } from "@/lib/prisma";
import { approveTollRecord, rejectTollRecord } from "./actions";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { METRIC_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

// Must always show the live pending queue, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function BoletinesPage() {
  const [pending, reviewed, municipios, departments] = await Promise.all([
    prisma.pendingTollRecord.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pendingTollRecord.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 20,
    }),
    prisma.municipio.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <PageShell title="Boletines">
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        Protegida por autenticación básica (src/proxy.ts). No enlazada desde
        la navegación pública a propósito. Cada fila la creó
        api/cron/bulletins al detectar un boletín numerado más reciente que
        el registrado — todavía no tiene cifras. Lee el boletín en el enlace,
        completa el formulario, y aprueba para crear el TollRecord real.
      </p>

      <SectionHeading>Pendientes ({pending.length})</SectionHeading>
      <div className="mt-4 space-y-4">
        {pending.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-black dark:text-zinc-50">
                {p.sourceOrg ?? "Fuente sin identificar"}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                {formatDateTime(p.createdAt)}
              </span>
            </div>
            {p.submitterNote && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {p.submitterNote}
              </p>
            )}
            {p.sourceUrl && (
              <p className="mt-1 text-sm">
                <ExternalLink href={p.sourceUrl}>Ver boletín</ExternalLink>
              </p>
            )}

            <form
              action={approveTollRecord}
              className="mt-4 grid grid-cols-1 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:grid-cols-2"
            >
              <input type="hidden" name="id" value={p.id} />

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Métrica *</span>
                <select
                  name="metric"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Selecciona una métrica</option>
                  {Object.entries(METRIC_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Valor *</span>
                <input
                  name="value"
                  type="number"
                  step="any"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Unidad</span>
                <input
                  name="unit"
                  placeholder="personas, familias..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Municipio</span>
                <select
                  name="municipioId"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">— nacional / departamental —</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">
                  Departamento (si no hay municipio)
                </span>
                <select
                  name="departmentId"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">— nacional —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Fecha del dato (asOf) *</span>
                <input
                  name="asOf"
                  type="date"
                  required
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Tier de fuente</span>
                <input
                  name="tier"
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={2}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Aprobar y crear TollRecord
                </button>
              </div>
            </form>

            <form action={rejectTollRecord} className="mt-2">
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Descartar (falso positivo)
              </button>
            </form>
          </Card>
        ))}
        {pending.length === 0 && <EmptyState>No hay detecciones pendientes.</EmptyState>}
      </div>

      {reviewed.length > 0 && (
        <>
          <SectionHeading>Revisadas recientemente</SectionHeading>
          <div className="mt-4 space-y-2">
            {reviewed.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {p.sourceOrg ?? "Fuente sin identificar"}
                </span>
                <span
                  className={
                    p.status === "APPROVED"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-400"
                  }
                >
                  {p.status === "APPROVED" ? "Aprobada" : "Rechazada"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
