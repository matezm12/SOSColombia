import { getTranslations } from "next-intl/server";
import { datasetCounts } from "@/lib/queries";

// Markdown mirror of the open-data page (src/app/[locale]/datos/page.tsx).
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const t = await getTranslations({ locale, namespace: "datos" });

  const { tollRecords, aidPoints, campaigns, reports, contradictions, resources } =
    await datasetCounts();

  const path = locale === "en" ? "/en/datos" : "/datos";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${t("resumen", { tollRecords, aidPoints, campaigns, reports, contradictions, resources })}

## ${t("downloadsHeading")}

- ${t("distJson")}: ${SITE_URL}/api/export
- ${t("distCifrasCsv")}: ${SITE_URL}/api/export/csv/toll-records
- ${t("distAyudaCsv")}: ${SITE_URL}/api/export/csv/aid-points

${t("license")} ${locale === "en" ? "See" : "Ver"} [${t("methodologyLink").replace(" →", "")}](${SITE_URL}${locale === "en" ? "/en" : ""}/metodologia).
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
