"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { aidKindLabel } from "@/lib/labels";
import { AID_KIND_COLOR_VAR, AID_KIND_ICON_SVG } from "./aidKindMarkers";

export type AidPointMarker = {
  id: string;
  name: string;
  kind: string;
  status: string;
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

export default function CiudadMapaClient({
  points,
  divipolaCode,
}: {
  points: AidPointMarker[];
  divipolaCode: string;
}) {
  const t = useTranslations("ciudad");
  const locale = useLocale();
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
      el.setAttribute("aria-label", `${point.name} (${aidKindLabel(point.kind, locale)})`);
      el.style.position = "relative";
      el.style.width = "26px";
      el.style.height = "26px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.35)";
      el.style.cursor = "pointer";
      el.style.padding = "5px";
      el.style.background = markerColor(point.kind);
      el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%">${AID_KIND_ICON_SVG[point.kind] ?? ""}</svg>`;

      // A currently-active aid point gets a slow pulsing halo, the one
      // deliberate motion pattern this design pass adds, reserved for
      // exactly this "genuinely live right now" signal (see globals.css).
      if (point.status === "ACTIVE") {
        const pulse = document.createElement("span");
        pulse.className = "marker-pulse";
        pulse.style.position = "absolute";
        pulse.style.inset = "0";
        pulse.style.borderRadius = "9999px";
        pulse.style.background = markerColor(point.kind);
        pulse.style.pointerEvents = "none";
        el.prepend(pulse);
      }

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

    // Deliberately a plain timer poll rather than an event listener ('load'
    // or 'styledata'): both were tried for the comuna-layer callback below
    // and neither reliably fired a second listener registered in the same
    // tick as this fitBounds one -- 'load' never fired at all in testing,
    // and 'styledata' stopped firing before isStyleLoaded() actually flipped
    // true (MapLibre signals the final stretch of readiness through other
    // events, e.g. 'idle'). Polling isStyleLoaded() directly sidesteps
    // needing to know which exact event this basemap style ends up relying
    // on, and is used for both callbacks below for the same reason.
    const readyCheckIntervals: ReturnType<typeof setInterval>[] = [];
    function whenStyleReady(cb: () => void) {
      if (map.isStyleLoaded()) {
        cb();
        return;
      }
      const interval = setInterval(() => {
        if (map.isStyleLoaded()) {
          clearInterval(interval);
          cb();
        }
      }, 150);
      readyCheckIntervals.push(interval);
    }

    if (!bounds.isEmpty()) {
      whenStyleReady(() => {
        map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 });
      });
    }

    // Comuna/barrio boundaries -- only some cities have a source for this so
    // far (see prisma/convert-pereira-comunas.mjs); fetched client-side and
    // silently skipped if this city doesn't have a file yet, same "empty
    // means not published yet" pattern as everywhere else on the site.
    whenStyleReady(() => {
      fetch(`/data/comunas-${divipolaCode}.geojson`)
        .then((res) => (res.ok ? res.json() : null))
        .then((geojson) => {
          if (!geojson) return;
          map.addSource("comunas", {
            type: "geojson",
            data: geojson,
            attribution: "Comunas: Portal Geográfico de Pereira",
          });
          map.addLayer({
            id: "comunas-fill",
            type: "fill",
            source: "comunas",
            paint: { "fill-color": "#71717a", "fill-opacity": 0.06 },
          });
          map.addLayer({
            id: "comunas-line",
            type: "line",
            source: "comunas",
            paint: { "line-color": "#71717a", "line-width": 1, "line-opacity": 0.5 },
          });
          map.addLayer({
            id: "comunas-label",
            type: "symbol",
            source: "comunas",
            layout: {
              "text-field": ["get", "nombre"],
              "text-size": 11,
              "text-font": ["Noto Sans Regular"],
            },
            paint: {
              "text-color": "#52525b",
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.2,
            },
          });
        })
        .catch(() => {
          // No boundary file for this city yet -- not an error, just not built out.
        });
    });

    return () => {
      readyCheckIntervals.forEach(clearInterval);
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [points, divipolaCode, locale]);

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
              {aidKindLabel(kind, locale)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
