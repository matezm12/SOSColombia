import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CampaignCard } from "@/components/data/CampaignCard";
import { AidPointCard } from "@/components/data/AidPointCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function DonarPage() {
  const [campaigns, monetaryPoints] = await Promise.all([
    prisma.crowdfundingCampaign.findMany({
      orderBy: { verificationStatus: "asc" },
      include: { municipios: { select: { name: true, divipolaCode: true } } },
    }),
    prisma.aidPoint.findMany({
      where: { kind: "MONETARY_DONATION" },
      include: { source: true, municipio: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  return (
    <PageShell
      backHref="/"
      title="Cómo donar"
      lede="Organizaciones y campañas verificadas por este proyecto. Cada una lleva un nivel de confianza — verifica tú mismo antes de donar, especialmente en campañas individuales."
    >
      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
          Antes de donar
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-500">
          <li>&ldquo;SOS Chocó&rdquo; no es una sola organización — es un lema que usan al menos 5 actores distintos (Manos Visibles, Fundación Plan, FECOER, entre otros). Verifica a cuál organización específica va tu donación antes de confiar en un enlace con ese nombre.</li>
          <li>&ldquo;Rescatistas LATAM&rdquo; fue investigado y no se encontró evidencia de que exista como organización real. No dones a través de canales con ese nombre.</li>
          <li>Desconfía de: enlaces compartidos solo por WhatsApp/SMS sin otro rastro, perfiles nuevos y anónimos, presión de urgencia, y &ldquo;listas exclusivas de víctimas&rdquo;.</li>
        </ul>
      </Card>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          ¿Donas desde fuera de Colombia? Los canales locales de esta página requieren cuenta bancaria colombiana para algunos casos.
        </p>
        <Link
          href="/donar/internacional"
          className="shrink-0 rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Ver donaciones internacionales →
        </Link>
      </Card>

      <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
        Organizaciones verificadas
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verified.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
        {verified.length === 0 && <EmptyState>Ninguna todavía.</EmptyState>}
      </div>

      {monetaryPoints.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Canales locales e institucionales
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {monetaryPoints.map((p) => (
              <div key={p.id}>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
                  {p.municipio.name}
                </p>
                <AidPointCard point={p} />
              </div>
            ))}
          </div>
        </>
      )}

      {individual.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Campañas individuales
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
            Recaudadores individuales, no instituciones — revisa el nivel de
            confianza de cada una antes de donar.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {individual.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}

      {flagged.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
            Riesgo de fraude
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {flagged.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
