import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { ContradictionCard } from "@/components/data/ContradictionCard";
import { EmptyState } from "@/components/ui/EmptyState";

// Contradictions get resolved/added over time — never freeze at build time.
export const dynamic = "force-dynamic";

export default async function MetodologiaPage() {
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((c) => c.status === "OPEN");
  const resolved = contradictions.filter((c) => c.status === "RESOLVED");

  return (
    <PageShell width="narrow" backHref="/" title="Metodología">
      <div className="mt-4 space-y-3 text-zinc-600 dark:text-zinc-400">
        <p>
          Las cifras de un desastre cambian de fuente a fuente y de día a
          día — eso no siempre significa un error. Este sitio nunca
          sobrescribe un número con otro más nuevo: cada cifra queda
          registrada con su fuente, su fecha y su nivel de confiabilidad, y
          se muestra la más reciente sin borrar el historial.
        </p>
        <p>
          Cuando dos fuentes confiables no coinciden en un mismo dato, lo
          registramos como una <strong>discrepancia</strong> en lugar de
          elegir una de las dos en silencio. Algunas se resuelven con más
          información; otras quedan abiertas hasta que exista un dato
          definitivo.
        </p>
      </div>

      {open.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Discrepancias abiertas
          </h2>
          <div className="mt-4 space-y-4">
            {open.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Discrepancias resueltas
          </h2>
          <div className="mt-4 space-y-4">
            {resolved.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}

      {contradictions.length === 0 && (
        <div className="mt-10">
          <EmptyState>Sin discrepancias registradas todavía.</EmptyState>
        </div>
      )}
    </PageShell>
  );
}
