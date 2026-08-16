"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AID_KIND_LABEL } from "@/lib/labels";
import { AID_KIND_COLOR_VAR, AID_KIND_ICON_SVG } from "./aidKindMarkers";

export type AidPointMarker = {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
};

// Same CARTO basemap and worker-URL fix as the national map -- see
// MapaClient.tsx's comments for why both are set up this way.
const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Haversine distance in km -- same formula as the geocoding scripts use to
// reject bad matches, reused here to decide which points count toward the
// initial camera bounds.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// A real aid point can legitimately sit far outside a city's dense urban
// core (e.g. a shelter in a rural corregimiento) -- true and worth having on
// the map, but letting fitBounds include it zooms the whole view out so far
// that every tightly-clustered urban marker collapses into a single dot.
// Every point still gets its own marker regardless; only the *initial
// camera framing* excludes outliers, computed from the median point rather
// than the city centroid so it self-adjusts to wherever the actual cluster is.
const CLUSTER_RADIUS_KM = 8;

function markerColor(kind: string): string {
  if (typeof window === "undefined") return "#3f3f46";
  const token = AID_KIND_COLOR_VAR[kind];
  const value = token
    ? getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    : "";
  return value || "#3f3f46";
}

export default function CiudadMapaClient({ points }: { points: AidPointMarker[] }) {
  const t = useTranslations("ciudad");
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current || points.length === 0) return;

    const medianLat = median(points.map((p) => p.lat));
    const medianLng = median(points.map((p) => p.lng));

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: STYLE_LIGHT,
      center: [medianLng, medianLat],
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const markers: maplibregl.Marker[] = [];
    const bounds = new maplibregl.LngLatBounds();

    const clusterPoints = points.filter(
      (p) => haversineKm(medianLat, medianLng, p.lat, p.lng) <= CLUSTER_RADIUS_KM,
    );
    // Fall back to every point only if the radius somehow excluded all of
    // them (shouldn't happen -- the median point always qualifies itself).
    const boundsPoints = clusterPoints.length > 0 ? clusterPoints : points;

    for (const point of points) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${point.name} (${AID_KIND_LABEL[point.kind] ?? point.kind})`);
      el.style.width = "26px";
      el.style.height = "26px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.35)";
      el.style.cursor = "pointer";
      el.style.padding = "5px";
      el.style.background = markerColor(point.kind);
      el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%">${AID_KIND_ICON_SVG[point.kind] ?? ""}</svg>`;

      // Clicking scrolls to the matching card in the list below instead of
      // opening a popup that would just repeat the same address/phone/needs/
      // source data the card already shows (and already carries a
      // ShareButton + anchor id for deep-linking).
      el.addEventListener("click", () => {
        const card = document.getElementById(point.id);
        if (!card) return;
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("ring-2", "ring-brand");
        setTimeout(() => card.classList.remove("ring-2", "ring-brand"), 1500);
      });

      markers.push(new maplibregl.Marker({ element: el }).setLngLat([point.lng, point.lat]).addTo(map));
    }
    for (const point of boundsPoints) {
      bounds.extend([point.lng, point.lat]);
    }

    if (!bounds.isEmpty()) {
      map.once("load", () => {
        map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 });
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [points]);

  if (points.length === 0) return null;

  const kindsPresent = [...new Set(points.map((p) => p.kind))];

  return (
    <div className="relative w-full">
      <div
        ref={mapContainer}
        className="h-[45vh] w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 dark:shadow-lg dark:ring-1 dark:ring-white/10"
      />
      <div className="absolute left-4 top-4 z-10 rounded-lg border border-zinc-200 bg-white/95 p-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{t("tipoDeAyuda")}</p>
        <ul className="mt-1.5 space-y-1">
          {kindsPresent.map((kind) => (
            <li key={kind} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-white"
                style={{ background: `var(${AID_KIND_COLOR_VAR[kind]})` }}
              />
              {AID_KIND_LABEL[kind] ?? kind}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
