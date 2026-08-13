import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CampaignCard } from "@/components/data/CampaignCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function DonarInternacionalPage() {
  const campaigns = await prisma.crowdfundingCampaign.findMany({
    where: { international: true },
    orderBy: { verificationStatus: "asc" },
    include: { municipios: { select: { name: true, divipolaCode: true } } },
  });

  const verified = campaigns.filter((c) => c.verificationStatus === "VERIFIED");
  const individual = campaigns.filter(
    (c) => c.verificationStatus === "PLAUSIBLE" || c.verificationStatus === "UNCONFIRMED",
  );
  const flagged = campaigns.filter((c) => c.verificationStatus === "FLAGGED_SCAM");

  return (
    <PageShell
      backHref="/donar"
      backLabel="Cómo donar"
      title="Donaciones internacionales"
      lede="Canales que puedes usar desde cualquier país — aceptan tarjeta extranjera o PayPal, sin necesidad de cuenta bancaria colombiana. Para transferencias locales en pesos y puntos por ciudad, ve a la página de donación general."
    >
      <Card className="mt-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
          Antes de donar
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-500">
          <li>Verifica el nivel de confianza de cada campaña — &ldquo;Verificado&rdquo; solo significa que confirmamos la organización, no que respaldamos su gestión de fondos.</li>
          <li>Las campañas GoFundMe con organizador individual (no institución) llevan una nota cuando encontramos algo digno de mención — léela antes de donar.</li>
          <li>Desconfía de canales compartidos solo por WhatsApp/SMS sin otro rastro y de presión de urgencia.</li>
        </ul>
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
