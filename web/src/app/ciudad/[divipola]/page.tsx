import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const METRIC_LABEL: Record<string, string> = {
  DEATHS_REPORTED_OFFICIAL: "Fallecidos (reporte oficial)",
  DEATHS_CONFIRMED_FORENSIC: "Fallecidos (confirmados, Medicina Legal)",
  INJURED: "Heridos",
  MISSING_OFFICIAL: "Desaparecidos (oficial)",
  MISSING_CROWDSOURCED: "Desaparecidos (reportes ciudadanos)",
  DAMNIFICADOS_PERSONAS: "Personas afectadas",
  DAMNIFICADOS_FAMILIAS: "Familias afectadas",
  VIVIENDAS_DESTRUIDAS: "Viviendas destruidas",
  VIVIENDAS_AVERIADAS: "Viviendas averiadas",
  EDIFICIOS_COLAPSADOS: "Edificios colapsados",
  CENTROS_EDUCATIVOS_AFECTADOS: "Centros educativos afectados",
  CENTROS_COMUNITARIOS_AFECTADOS: "Centros comunitarios afectados",
  CENTROS_SALUD_AFECTADOS: "Centros de salud afectados",
};

const AID_KIND_LABEL: Record<string, string> = {
  ALBERGUE: "Albergue",
  ACOPIO: "Centro de acopio",
  HEALTH: "Salud",
  VET: "Veterinaria",
  BLOOD_DONATION: "Donación de sangre",
  MONETARY_DONATION: "Donación monetaria",
};

const TIER_LABEL: Record<number, string> = {
  1: "Fuente primaria oficial",
  2: "Fuente secundaria confiable",
  3: "Declaración oficial vía prensa",
  4: "Fuente local/institucional",
  5: "Prensa no verificada",
  6: "Redes sociales — no verificado",
};

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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Todas las ciudades
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {municipio.name}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-500">
          {municipio.department.name} · DIVIPOLA {municipio.divipolaCode}
          {municipio.populationDane &&
            ` · ${municipio.populationDane.toLocaleString("es-CO")} habitantes (DANE)`}
        </p>

        <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
          Cifras
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...latestByMetric.values()].map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                {record.value.toLocaleString("es-CO")}
                {record.unit && (
                  <span className="ml-1 text-sm font-normal text-zinc-500">
                    {record.unit}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {METRIC_LABEL[record.metric] ?? record.metric}
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                {record.source.org} · {TIER_LABEL[record.tier] ?? `nivel ${record.tier}`}
                {" · "}
                {record.asOf.toLocaleDateString("es-CO")}
              </p>
            </div>
          ))}
          {latestByMetric.size === 0 && (
            <p className="text-sm text-zinc-500">Sin cifras cargadas todavía.</p>
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
                  <li
                    key={point.id}
                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-black dark:text-zinc-50">
                        {point.name}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {point.status}
                      </span>
                    </div>
                    {point.address && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {point.address}
                      </p>
                    )}
                    {point.accessRestriction && (
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                        Acceso restringido: {point.accessRestriction}
                      </p>
                    )}
                    {point.needsText && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Necesita: {point.needsText}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                      {point.source.org} · verificado{" "}
                      {point.lastVerifiedAt.toLocaleDateString("es-CO")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {municipio.aidPoints.length === 0 && (
            <p className="text-sm text-zinc-500">
              Sin puntos de ayuda confirmados todavía para esta ciudad.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
