import { loader } from "fumadocs-core/source";
import { docs } from "../../.source/server";

// Loads content/docs/*.mdx (see ../../source.config.ts) into a page tree
// for the /docs section's layout + [[...slug]] page.
export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
