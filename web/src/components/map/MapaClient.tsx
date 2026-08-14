"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SEVERITY_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";

export type MunicipioMarker = {
  name: string;
  divipolaCode: string;
  lat: number;
  lng: number;
  severityLabel: string | null;
  populationDane: number | null;
  aidPointCount: number;
  deathValue?: number;
};

export type EpicenterPoint = {
  latSgc: number | null;
  lngSgc: number | null;
  latUsgs: number | null;
  lngUsgs: number | null;
};

// CARTO's public "positron" basemap: real OSM-derived cartography (roads,
// borders, labels), no API key/account/billing surface — chosen for the same
// reason this project avoided Mapbox originally.
//
// Used unconditionally, light-only, regardless of site theme. A theme-matched
// dark variant was tried previously and appeared broken (style/sprite/
// TileJSON fetched fine but no tiles ever rendered) — that was misdiagnosed
// as a style problem; the real cause was the worker-URL bug fixed below via
// setWorkerUrl, which blocked tile loading for *every* style, light included
// (it just went unnoticed on light styles until now). A dark variant is
// likely viable now; not switched over here since that's a separate call.
const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// MapLibre derives its worker script URL from `import.meta.url` of its own
// bundled module. Under Next.js/Turbopack that resolves to a `/_next/static/
// chunks/...` path with no `maplibre-gl-worker.mjs` sitting next to it, so
// the worker request 404s (served the HTML fallback page instead of JS) and
// module-worker creation fails silently — no thrown error, just a console
// warning. Without a working worker, tiles can never be parsed: style,
// sprite, and tiles.json all fetch fine, but zero vector-tile requests are
// ever issued and the map sits permanently blank. Fix: serve the worker
// script (and its one relative import, maplibre-gl-shared.mjs) as static
// files from /public — copied from node_modules/maplibre-gl/dist — and point
// MapLibre at them directly instead of letting it guess a bundler-relative
// URL. Re-copy both files if maplibre-gl is upgraded.
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

// Reads the CSS custom property directly (rather than a Tailwind class on the
// marker element) since MapLibre markers are plain DOM nodes outside Tailwind's
// scanned tree — this still shares the same design-token source of truth as
// every badge elsewhere in the app (see globals.css's --color-severity-*).
function severityColor(label: string | null): string {
  if (typeof window === "undefined") return "#3f3f46";
  const token = label ? `--color-severity-${label.toLowerCase()}` : null;
  const value = token
    ? getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    : "";
  return value || "#3f3f46";
}

export default function MapaClient({
  municipios,
  epicenter,
}: {
  municipios: MunicipioMarker[];
  epicenter: EpicenterPoint | null;
}) {
  const t = useTranslations("mapa");
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<MunicipioMarker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLE_LIGHT,
      center: [-76.2, 4.2],
      zoom: 5.6,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    // Only city-level markers are plotted, not individual aid points — almost none
    // have lat/lng (the wiki research has street addresses, not coordinates), and
    // inventing coordinates would violate the project's own sourcing discipline.
    // Aid-point counts per city show in the popup instead; geocoding is separate
    // future work.
    const markers: maplibregl.Marker[] = [];
    const bounds = new maplibregl.LngLatBounds();

    for (const m of municipios) {
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
      el.style.background = severityColor(m.severityLabel);
      el.addEventListener("click", () => setSelected(m));

      markers.push(new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map));
      bounds.extend([m.lng, m.lat]);
    }

    // Plot both agencies' epicenter estimates distinctly — never collapse them
    // into one point, same discipline as everywhere else in this project.
    if (epicenter?.latSgc && epicenter?.lngSgc) {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.transform = "rotate(45deg)";
      el.style.background = "#facc15";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.35)";
      el.title = t("epicentroSgc");
      markers.push(
        new maplibregl.Marker({ element: el }).setLngLat([epicenter.lngSgc, epicenter.latSgc]).addTo(map),
      );
      bounds.extend([epicenter.lngSgc, epicenter.latSgc]);
    }
    if (epicenter?.latUsgs && epicenter?.lngUsgs) {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.transform = "rotate(45deg)";
      el.style.background = "#a78bfa";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.35)";
      el.title = t("epicentroUsgs");
      markers.push(
        new maplibregl.Marker({ element: el }).setLngLat([epicenter.lngUsgs, epicenter.latUsgs]).addTo(map),
      );
      bounds.extend([epicenter.lngUsgs, epicenter.latUsgs]);
    }

    if (!bounds.isEmpty()) {
      map.once("load", () => {
        map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 0 });
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [municipios, epicenter, t]);

  return (
    <div className="relative w-full">
      <div
        ref={mapContainer}
        className="h-[70vh] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
      />

      <div className="absolute left-4 top-4 z-10 rounded-lg border border-zinc-200 bg-white/95 p-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{t("severidad")}</p>
        <ul className="mt-1.5 space-y-1">
          {Object.entries(SEVERITY_LABEL).map(([key, label]) => (
            <li key={key} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-white"
                style={{ background: `var(--color-severity-${key.toLowerCase()})` }}
              />
              {label}
            </li>
          ))}
          <li className="mt-1 flex items-center gap-1.5 border-t border-zinc-100 pt-1 text-zinc-600 dark:border-zinc-900 dark:text-zinc-400">
            <span className="inline-block h-2.5 w-2.5 rotate-45 border border-white bg-[#facc15]" />
            {t("epicentroSgc")}
          </li>
          <li className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span className="inline-block h-2.5 w-2.5 rotate-45 border border-white bg-[#a78bfa]" />
            {t("epicentroUsgs")}
          </li>
        </ul>
      </div>

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:right-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-black dark:text-zinc-50">
                {selected.name}
              </p>
              {selected.severityLabel && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {t("severidad")}: {SEVERITY_LABEL[selected.severityLabel] ?? selected.severityLabel}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t("cerrar")}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ×
            </button>
          </div>
          <dl className="mt-2 space-y-0.5 text-xs text-zinc-500 dark:text-zinc-500">
            {selected.populationDane && (
              <div>{formatNumber(selected.populationDane)} {t("habitantesDane")}</div>
            )}
            {selected.deathValue !== undefined && (
              <div>{formatNumber(selected.deathValue)} {t("fallecidosReportados")}</div>
            )}
            <div>{selected.aidPointCount} {t("puntosAyudaRegistrados")}</div>
          </dl>
          <Link
            href={`/ciudad/${selected.divipolaCode}`}
            className="mt-3 inline-block text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t("verCiudad")}
          </Link>
        </div>
      )}
    </div>
  );
}
