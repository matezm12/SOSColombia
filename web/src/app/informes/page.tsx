import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { GovReportCard } from "@/components/data/GovReportCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function InformesPage() {
  const reports = await prisma.govReport.findMany({ orderBy: { date: "desc" } });

  return (
    <PageShell
      backHref="/"
      title="Informes oficiales"
      lede="Decretos, balances y comunicados oficiales — registro cronológico, con la fuente y el nivel de confiabilidad de cada uno."
    >
      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <GovReportCard key={r.id} report={r} />
        ))}
        {reports.length === 0 && <EmptyState>Sin informes registrados todavía.</EmptyState>}
      </div>
    </PageShell>
  );
}
