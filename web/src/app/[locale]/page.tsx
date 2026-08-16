import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CityCard } from "@/components/data/CityCard";
import { AlliedResourceCard } from "@/components/data/AlliedResourceCard";
import { bestDeathMetric } from "@/lib/queries";
import { routing } from "@/i18n/routing";

// Data updates via cron (at most daily) plus occasional manual moderation,
// not per-second — a short revalidation window keeps this fresh without a
// DB round trip on every single request, which matters most exactly when
// it's least convenient: a traffic spike.
export const revalidate = 60;

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
  // at 8 (two full rows of the 4-col desktop grid — 1-col mobile stays a
  // scroll either way, so the cap only matters on wider screens) so the strip
  // stays a highlight, not a second /recursos.
  const homepageResources = [...featuredResources]
    .sort((a, b) => Number(b.municipioId != null) - Number(a.municipioId != null))
    .slice(0, 8);

  const canonicalUrl = `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}`;

  // Grounded only in data actually fetched above — degrades gracefully
  // (shorter sentence) rather than inventing an event or a municipio count
  // when either query comes back empty.
  const orgDescriptionParts = [t("orgDescriptionBase")];
  if (event?.magnitudeSgc != null && event.occurredAt) {
    orgDescriptionParts.push(
      t("orgDescriptionEvent", {
        magnitude: event.magnitudeSgc.toFixed(1),
        date: event.occurredAt.toISOString().slice(0, 10),
      })
    );
  }
  if (municipios.length > 0) {
    orgDescriptionParts.push(t("orgDescriptionMunicipios", { count: municipios.length }));
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
    logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image` },
    description: orgDescriptionParts.join(" "),
    disambiguatingDescription: t("orgDisambiguating"),
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
        <div className="mt-6 flex flex-wrap items-center gap-3">
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
          {/* Deliberately lighter weight than the two CTAs above — reading
              stories is worth surfacing here, but shouldn't visually compete
              with "find aid"/"donate", the two actions someone arriving
              right after the earthquake actually needs first. */}
          <Link
            href="/historias"
            className="text-sm font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-black hover:decoration-zinc-500 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-zinc-50 dark:hover:decoration-zinc-400"
          >
            {t("ctaHistorias")}
          </Link>
        </div>

        <SectionHeading first>{t("ciudades")}</SectionHeading>
        {/* CSS columns, not grid: a `grid` row's track height always matches
            its tallest cell (items-start only aligns content within the
            cell, it doesn't shrink the row) — a tall alertNote card next to
            a short one left dead space under the short one either way.
            Columns let each card take only its own height. */}
        <ul className="mt-4 columns-1 gap-3 sm:columns-2">
          {municipios.map((m) => {
            // Prefer the official reported death count; fall back to INMLCF's
            // forensic-confirmed count (e.g. Pereira, which only has the latter
            // seeded) rather than showing nothing — the two are never merged,
            // the card just labels whichever one it's showing.
            const death = bestDeathMetric(m.tollRecords);
            return (
              <li key={m.id} className="mb-3 break-inside-avoid">
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
                  alertNote={m.alertNote}
                  locale={locale}
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
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          {t.rich("ayudaAnimales", {
            link: (chunks) => (
              <Link href="/ayuda?tipo=VET" className="underline">
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
                <AlliedResourceCard key={r.id} resource={r} locale={locale} />
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
