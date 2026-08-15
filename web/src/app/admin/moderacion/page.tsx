import { prisma } from "@/lib/prisma";
import { approveSubmission, rejectSubmission } from "./actions";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AID_KIND_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

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
      include: { municipio: true, reviewedByVolunteer: { select: { name: true } } },
      orderBy: { reviewedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <PageShell title="Moderación">
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
        Protegida por autenticación básica (src/proxy.ts). No enlazada desde
        la navegación pública a propósito.
      </p>

      <SectionHeading first>Pendientes ({pending.length})</SectionHeading>
      <div className="mt-4 space-y-4">
        {pending.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-black dark:text-zinc-50">
                {p.name}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {AID_KIND_LABEL[p.kind] ?? p.kind} · {p.municipio.name}
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
                <ExternalLink href={p.sourceUrl}>Fuente</ExternalLink>
              </p>
            )}
            {p.submitterNote && (
              <p className="mt-1 text-sm italic text-zinc-500">
                &ldquo;{p.submitterNote}&rdquo;
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
              Enviado {formatDateTime(p.createdAt)}
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
          </Card>
        ))}
        {pending.length === 0 && <EmptyState>No hay sugerencias pendientes.</EmptyState>}
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
                  {p.name} · {p.municipio.name}
                  {p.reviewedByVolunteer && (
                    <span className="text-zinc-400 dark:text-zinc-600">
                      {" "}
                      · revisado por {p.reviewedByVolunteer.name}
                    </span>
                  )}
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
