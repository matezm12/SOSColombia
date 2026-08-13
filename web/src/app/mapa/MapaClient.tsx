"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type MunicipioMarker = {
  name: string;
  divipolaCode: string;
  lat: number;
  lng: number;
  severityLabel: string | null;
};

const SEVERITY_LABEL: Record<string, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MODERADA: "Moderada",
  LEVE: "Leve",
};

const SEVERITY_COLOR: Record<string, string> = {
  CRITICA: "#dc2626",
  ALTA: "#ea580c",
  MODERADA: "#ca8a04",
  LEVE: "#65a30d",
};

export default function MapaClient({
  municipios,
}: {
  municipios: MunicipioMarker[];
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<MunicipioMarker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      // MapLibre's own public demo style — free, no API key required, so this app never
      // risks a Mapbox-style billing surprise. It's intentionally bare; swap in a nicer
      // basemap (self-hosted style or a free-tier vector provider) later if desired.
      style: "https://demotiles.maplibre.org/style.json",
      center: [-76.2, 4.2],
      zoom: 5.6,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    const markers = municipios.map((m) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", m.name);
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.35)";
      el.style.cursor = "pointer";
      el.style.padding = "0";
      el.style.background = SEVERITY_COLOR[m.severityLabel ?? ""] ?? "#3f3f46";
      el.addEventListener("click", () => setSelected(m));

      return new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [municipios]);

  return (
    <div className="relative w-full">
      <div
        ref={mapContainer}
        className="h-[70vh] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
      />

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:right-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-black dark:text-zinc-50">
                {selected.name}
              </p>
              {selected.severityLabel && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Severidad: {SEVERITY_LABEL[selected.severityLabel] ?? selected.severityLabel}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Cerrar"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ×
            </button>
          </div>
          <Link
            href={`/ciudad/${selected.divipolaCode}`}
            className="mt-3 inline-block text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Ver ciudad →
          </Link>
        </div>
      )}
    </div>
  );
}
