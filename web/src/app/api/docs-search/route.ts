import { createFromSource } from "fumadocs-core/search/server";
import { docsSource } from "@/lib/source";

// Deliberately its own path, not /api/search — this project already has a
// site-wide search endpoint (src/app/api/search/route.ts) covering
// Municipio/Vereda/AidPoint/etc; Fumadocs' search UI is pointed here via
// RootProvider's `search.options.api` in app/docs/layout.tsx.
export const { GET } = createFromSource(docsSource);
