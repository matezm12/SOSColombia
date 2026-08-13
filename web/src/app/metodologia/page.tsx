import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Contradictions get resolved/added over time — never freeze at build time.
export const dynamic = "force-dynamic";

export default async function MetodologiaPage() {
  const contradictions = await prisma.contradiction.findMany({
    orderBy: [{ status: "asc" }, { loggedAt: "desc" }],
  });

  const open = contradictions.filter((c) => c.status === "OPEN");
  const resolved = contradictions.filter((c) => c.status === "RESOLVED");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Todas las ciudades
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Metodología
        </h1>

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
          <p className="mt-10 text-sm text-zinc-500">
            Sin discrepancias registradas todavía.
          </p>
        )}
      </main>
    </div>
  );
}

function ContradictionCard({
  contradiction,
}: {
  contradiction: Awaited<
    ReturnType<typeof prisma.contradiction.findMany>
  >[number];
}) {
  const c = contradiction;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="font-medium text-black dark:text-zinc-50">
          {c.topic}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            c.status === "OPEN"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
          }`}
        >
          {c.status === "OPEN" ? "Abierta" : "Resuelta"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="rounded border border-zinc-100 p-2 dark:border-zinc-900">
          <p className="text-black dark:text-zinc-50">{c.valueA}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{c.sourceA}</p>
        </div>
        <div className="rounded border border-zinc-100 p-2 dark:border-zinc-900">
          <p className="text-black dark:text-zinc-50">{c.valueB}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{c.sourceB}</p>
        </div>
      </div>
      {c.resolutionText && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {c.resolutionText}
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
        Registrada {c.loggedAt.toLocaleDateString("es-CO")}
        {c.resolvedAt &&
          ` · resuelta ${c.resolvedAt.toLocaleDateString("es-CO")}`}
      </p>
    </div>
  );
}
