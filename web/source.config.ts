import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// Spanish-only for now (deliberate — see docs planning notes: bilingual
// docs need a real integration story with next-intl that doesn't exist
// yet, since this whole docs section sits outside the [locale] segment,
// same as /admin and /md). English is a planned follow-up once the
// Spanish content is actually finished, not blocking this pass.
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig();
