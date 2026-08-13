import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { CityCard } from "@/components/data/CityCard";

// This data changes constantly (new toll records, new aid points) — never let
// Next.js freeze it as static HTML at build time.
export const dynamic = "force-dynamic";

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
    <PageShell
      eyebrow="SOSColombia"
      title="Terremoto de Colombia — 10 de agosto de 2026"
      lede={
        event
          ? `Magnitud ${event.magnitudeSgc?.toFixed(1)} (SGC), epicentro cerca de San José del Palmar, Chocó. Datos verificados de fuentes oficiales — cada cifra lleva su fuente y fecha, nunca un solo número "definitivo".`
          : undefined
      }
    >
      <h2 className="mt-12 text-lg font-semibold text-black dark:text-zinc-50">
        Ciudades
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {municipios.map((m) => (
          <li key={m.id}>
            <CityCard
              name={m.name}
              divipolaCode={m.divipolaCode}
              departmentName={m.department.name}
              severityLabel={m.severityLabel}
              deathValue={m.tollRecords[0]?.value}
            />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
