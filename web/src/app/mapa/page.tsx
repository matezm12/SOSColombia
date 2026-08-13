import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import MapaClient, {
  type MunicipioMarker,
  type EpicenterPoint,
} from "@/components/map/MapaClient";

// Coordinates can be backfilled/updated between deploys — never freeze at build time.
export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const [municipios, event] = await Promise.all([
    prisma.municipio.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      orderBy: { populationDane: "desc" },
      include: {
        _count: { select: { aidPoints: true } },
        tollRecords: {
          where: { metric: "DEATHS_REPORTED_OFFICIAL" },
          orderBy: { asOf: "desc" },
          take: 1,
        },
      },
    }),
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
  ]);

  // Prisma can't be called from a Client Component, so the fetch happens here and only
  // the plain data each marker needs gets passed down.
  const markers: MunicipioMarker[] = municipios.map((m) => ({
    name: m.name,
    divipolaCode: m.divipolaCode,
    lat: m.lat as number,
    lng: m.lng as number,
    severityLabel: m.severityLabel,
    populationDane: m.populationDane,
    aidPointCount: m._count.aidPoints,
    deathValue: m.tollRecords[0]?.value,
  }));

  const epicenter: EpicenterPoint | null = event
    ? {
        latSgc: event.epicenterLatSgc,
        lngSgc: event.epicenterLngSgc,
        latUsgs: event.epicenterLatUsgs,
        lngUsgs: event.epicenterLngUsgs,
      }
    : null;

  return (
    <PageShell
      width="wide"
      backHref="/"
      title="Mapa"
      lede="Ubicación de las ciudades con datos verificados y el epicentro del sismo (SGC y USGS difieren ligeramente, se muestran ambos). Toca un marcador para ver detalles."
    >
      <div className="mt-6">
        <MapaClient municipios={markers} epicenter={epicenter} />
      </div>

      {markers.length === 0 && (
        <div className="mt-6">
          <EmptyState>Sin coordenadas cargadas todavía.</EmptyState>
        </div>
      )}
    </PageShell>
  );
}
