import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MapaClient, { type MunicipioMarker } from "./MapaClient";

// Coordinates can be backfilled/updated between deploys — never freeze at build time.
export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const municipios = await prisma.municipio.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    orderBy: { populationDane: "desc" },
  });

  // Prisma can't be called from a Client Component, so the fetch happens here and only
  // the plain data each marker needs gets passed down.
  const markers: MunicipioMarker[] = municipios.map((m) => ({
    name: m.name,
    divipolaCode: m.divipolaCode,
    lat: m.lat as number,
    lng: m.lng as number,
    severityLabel: m.severityLabel,
  }));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Todas las ciudades
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Mapa
        </h1>
        <p className="mt-1 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Ubicación de las ciudades con datos verificados. Toca un marcador
          para ver el nombre de la ciudad y entrar a su página.
        </p>

        <div className="mt-6">
          <MapaClient municipios={markers} />
        </div>

        {markers.length === 0 && (
          <p className="mt-6 text-sm text-zinc-500">
            Sin coordenadas cargadas todavía.
          </p>
        )}
      </main>
    </div>
  );
}
