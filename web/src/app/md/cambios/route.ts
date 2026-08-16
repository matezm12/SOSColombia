import { getTranslations } from "next-intl/server";
import { recentActivity, describeEntry } from "@/lib/changelog";
import { formatDate } from "@/lib/format";

// Markdown mirror of the changelog page (src/app/[locale]/cambios/page.tsx):
// same merged, most-recent-first feed across every append-only table
// (toll records, contradictions, aid points, campaigns, allied resources).
// Bilingual via ?locale=en (default es) — see /md/donar/route.ts for the
// pattern this follows; describeEntry() itself is shared with the visible
// page (src/lib/changelog.ts).
//
// Short revalidation window instead of force-dynamic: this changes as often
// as the underlying tables do, not per-second.
export const revalidate = 60;

const SITE_URL = "https://www.soscolombia.xyz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const t = await getTranslations({ locale, namespace: "cambios" });
  const entries = await recentActivity();

  const lines = entries.map((entry) => {
    const d = describeEntry(entry, locale, t);
    return `- **${formatDate(entry.at)}** — ${d.action}: ${d.text} (${SITE_URL}${d.href})`;
  });

  const path = locale === "en" ? "/en/cambios" : "/cambios";

  const markdown = `---
title: "${t("title")} — SOSColombia"
description: "${t("lede")}"
url: "${SITE_URL}${path}"
last_updated: "${new Date().toISOString()}"
---

# ${t("title")}

${t("lede")}

${lines.length > 0 ? lines.join("\n") : t("empty")}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
