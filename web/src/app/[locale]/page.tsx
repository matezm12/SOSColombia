import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { CityCard } from "@/components/data/CityCard";
import { bestDeathMetric } from "@/lib/queries";

// This data changes constantly (new toll records, new aid points) — never let
// Next.js freeze it as static HTML at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const t = await getTranslations("home");
  const [event, municipios] = await Promise.all([
    prisma.event.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.municipio.findMany({
      include: {
        department: true,
        tollRecords: {
          where: { metric: { in: ["DEATHS_REPORTED_OFFICIAL", "DEATHS_CONFIRMED_FORENSIC"] } },
        },
      },
      orderBy: { populationDane: "desc" },
    }),
  ]);

  return (
    <PageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      lede={
        event?.magnitudeSgc != null
          ? t("lede", { magnitude: event.magnitudeSgc.toFixed(1) })
          : undefined
      }
    >
      <h2 className="mt-12 text-lg font-semibold text-black dark:text-zinc-50">
        {t("ciudades")}
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {municipios.map((m) => {
          // Prefer the official reported death count; fall back to INMLCF's
          // forensic-confirmed count (e.g. Pereira, which only has the latter
          // seeded) rather than showing nothing — the two are never merged,
          // the card just labels whichever one it's showing.
          const death = bestDeathMetric(m.tollRecords);
          return (
            <li key={m.id}>
              <CityCard
                name={m.name}
                divipolaCode={m.divipolaCode}
                departmentName={m.department.name}
                severityLabel={m.severityLabel}
                deathValue={death?.value}
                deathLabel={
                  death?.metric === "DEATHS_CONFIRMED_FORENSIC"
                    ? t("fallecidosConfirmados")
                    : t("fallecidosReportados")
                }
              />
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
