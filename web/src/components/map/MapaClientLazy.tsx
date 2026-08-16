"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside a Client Component (a Server Component
// using it is a build error) — this thin wrapper exists purely to hold that
// call, so MapaPage (a Server Component) can still import a plain default
// export. Splits the 940KB+ maplibre-gl chunk out of the initial page bundle
// instead of loading it unconditionally on every /mapa visit (confirmed via
// Lighthouse: this chunk alone drove /mapa's TBT to 510ms, TTI to 4.6s).
const MapaClient = dynamic(() => import("./MapaClient"), { ssr: false });

export default MapaClient;
