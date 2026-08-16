"use client";

import dynamic from "next/dynamic";

// See MapaClientLazy.tsx for why this wrapper exists — `ssr: false` only
// works inside a Client Component, and CiudadPage (a Server Component) needs
// a plain default export. Keeps maplibre-gl out of every /ciudad/[divipola]
// page's initial bundle (11 pages) unless the map is actually rendered.
const CiudadMapaClient = dynamic(() => import("./CiudadMapaClient"), { ssr: false });

export default CiudadMapaClient;
