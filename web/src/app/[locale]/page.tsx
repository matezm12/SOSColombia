import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CityCard } from "@/components/data/CityCard";
import { AlliedResourceCard } from "@/components/data/AlliedResourceCard";
import { bestDeathMetric } from "@/lib/queries";
import { routing } from "@/i18n/routing";

// This data changes constantly (new toll records, new aid points) — never let
// Next.js freeze it as static HTML at build time.
export const dynamic = "force-dynamic";

// Same custom domain as the root layout's SITE_URL — kept local instead of
// exported/shared because JSON-LD is the only thing on this page that needs
// an absolute URL.
const SITE_URL = "https://www.soscolombia.xyz";

export default async function Home(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  const t = await getTranslations("home");
  const [event, municipios, featuredResources] = await Promise.all([
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
    prisma.alliedResource.findMany({
      where: { featured: true, status: { not: "DEAD" } },
      include: { municipio: { select: { name: true, divipolaCode: true } } },
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    }),
  ]);

  // City-specific projects first (the point of this section — small, local
  // efforts like Ayudas Pereira/Cali Ayuda), then broader national ones, capped
  // at 4 so the strip stays a highlight, not a second /recursos.
  const homepageResources = [...featuredResources]
    .sort((a, b) => Number(b.municipioId != null) - Number(a.municipioId != null))
    .slice(0, 4);

  const canonicalUrl = `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}`;

  // Grounded only in data actually fetched above — degrades gracefully
  // (shorter sentence) rather than inventing an event or a municipio count
  // when either query comes back empty.
  const orgDescriptionParts = [
    "SOSColombia es un proyecto independiente de voluntariado que centraliza y verifica datos públicos sobre desastres naturales en Colombia.",
  ];
  if (event?.magnitudeSgc != null && event.occurredAt) {
    orgDescriptionParts.push(
      `Actualmente hace seguimiento al terremoto de magnitud ${event.magnitudeSgc.toFixed(1)} (SGC) ocurrido el ${event.occurredAt.toISOString().slice(0, 10)}.`
    );
  }
  if (municipios.length > 0) {
    orgDescriptionParts.push(
      `Reúne cifras oficiales, puntos de ayuda y campañas de donación verificadas para ${municipios.length} municipios afectados.`
    );
  }

  // schema.org/Organization — deliberately the generic "Organization" type
  // rather than "NGO": SOSColombia is an independent volunteer effort, not a
  // registered nonprofit entity, so "NGO" would overclaim legal status.
  // disambiguatingDescription carries that caveat explicitly for consumers
  // of the structured data.
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SOSColombia",
    url: SITE_URL,
    description: orgDescriptionParts.join(" "),
    disambiguatingDescription:
      "SOSColombia es un proyecto de voluntariado independiente que agrega y verifica datos públicos de fuentes oficiales; no es una ONG registrada ni una entidad gubernamental.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SOSColombia",
    url: canonicalUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <PageShell
        eyebrow={t("eyebrow")}
        title={t("title")}
        lede={
          event?.magnitudeSgc != null
            ? t("lede", { magnitude: event.magnitudeSgc.toFixed(1) })
            : undefined
        }
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/ayuda"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {t("ctaAyuda")}
          </Link>
          <Link
            href="/donar"
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {t("ctaDonar")}
          </Link>
        </div>

        <SectionHeading first>{t("ciudades")}</SectionHeading>
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

        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
          {t.rich("ciudadNoListada", {
            link: (chunks) => (
              <Link href="/ayuda" className="underline">
                {chunks}
              </Link>
            ),
          })}
        </p>

        {homepageResources.length > 0 && (
          <>
            <SectionHeading>{t("proyectosDestacados")}</SectionHeading>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              {t("proyectosDestacadosLede")}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {homepageResources.map((r) => (
                <AlliedResourceCard key={r.id} resource={r} />
              ))}
            </div>
            <p className="mt-3 text-sm">
              <Link href="/recursos" className="underline">
                {t("verTodosLosRecursos")}
              </Link>
            </p>
          </>
        )}
      </PageShell>
    </>
  );
}
