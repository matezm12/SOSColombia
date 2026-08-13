import Link from "next/link";
import { prisma } from "@/lib/prisma";

const SEVERITY_LABEL: Record<string, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MODERADA: "Moderada",
  LEVE: "Leve",
};

export default async function Home() {
  const [event, municipios] = await Promise.all([
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.municipio.findMany({
      include: {
        department: true,
        tollRecords: {
          where: { metric: "DEATHS_REPORTED_OFFICIAL" },
          orderBy: { asOf: "desc" },
          take: 1,
        },
      },
      orderBy: { populationDane: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-wide text-red-600 dark:text-red-500">
          SOSColombia
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Terremoto de Colombia — 10 de agosto de 2026
        </h1>

        {event && (
          <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Magnitud {event.magnitudeSgc?.toFixed(1)} (SGC), epicentro cerca de San
            José del Palmar, Chocó. Datos verificados de fuentes oficiales — cada
            cifra lleva su fuente y fecha, nunca un solo número &ldquo;definitivo&rdquo;.
          </p>
        )}

        <h2 className="mt-12 text-lg font-semibold text-black dark:text-zinc-50">
          Ciudades
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {municipios.map((m) => (
            <li key={m.id}>
              <Link
                href={`/ciudad/${m.divipolaCode}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black dark:text-zinc-50">
                    {m.name}
                  </span>
                  {m.severityLabel && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {SEVERITY_LABEL[m.severityLabel]}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                  {m.department.name}
                  {m.tollRecords[0] &&
                    ` · ${m.tollRecords[0].value} fallecidos reportados`}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/metodologia"
          className="mt-10 inline-block text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Metodología y discrepancias entre fuentes →
        </Link>
      </main>
    </div>
  );
}
