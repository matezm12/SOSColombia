import { prisma } from "@/lib/prisma";
import { approveSubmission, rejectSubmission } from "./actions";

// Must always show the live pending queue, never a build-time snapshot — a
// moderator approving/rejecting a stale, cached list would be actively harmful.
export const dynamic = "force-dynamic";

export default async function ModeracionPage() {
  const [pending, reviewed] = await Promise.all([
    prisma.pendingAidPoint.findMany({
      where: { status: "PENDING" },
      include: { municipio: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pendingAidPoint.findMany({
      where: { status: { not: "PENDING" } },
      include: { municipio: true },
      orderBy: { reviewedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Moderación
        </h1>
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-500">
          Sin autenticación todavía — no desplegar públicamente hasta añadir
          control de acceso (ver wiki/10-app-architecture.md).
        </p>

        <h2 className="mt-8 text-lg font-semibold text-black dark:text-zinc-50">
          Pendientes ({pending.length})
        </h2>
        <div className="mt-4 space-y-4">
          {pending.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-black dark:text-zinc-50">
                  {p.name}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {p.kind} · {p.municipio.name}
                </span>
              </div>
              {p.address && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.address}
                </p>
              )}
              {p.phone && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Tel: {p.phone}
                </p>
              )}
              {p.needsText && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Necesita: {p.needsText}
                </p>
              )}
              {p.sourceUrl && (
                <p className="mt-1 text-sm">
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline dark:text-blue-400"
                  >
                    Fuente
                  </a>
                </p>
              )}
              {p.submitterNote && (
                <p className="mt-1 text-sm italic text-zinc-500">
                  &ldquo;{p.submitterNote}&rdquo;
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                Enviado {p.createdAt.toLocaleString("es-CO")}
              </p>
              <div className="mt-3 flex gap-2">
                <form action={approveSubmission}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Aprobar
                  </button>
                </form>
                <form action={rejectSubmission}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-sm text-zinc-500">No hay sugerencias pendientes.</p>
          )}
        </div>

        {reviewed.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
              Revisadas recientemente
            </h2>
            <div className="mt-4 space-y-2">
              {reviewed.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {p.name} · {p.municipio.name}
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
      </main>
    </div>
  );
}
