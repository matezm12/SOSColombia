import { prisma } from "@/lib/prisma";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { TIER_LABEL, SOURCE_STATUS_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FuentesPage() {
  const sources = await prisma.source.findMany({
    include: { _count: { select: { tollRecords: true, aidPoints: true } } },
    orderBy: [{ tier: "asc" }, { org: "asc" }],
  });

  return (
    <PageShell
      width="wide"
      backHref="/"
      title="Fuentes"
      lede="Cada dato en este sitio viene de una fuente citada aquí, con su nivel de confiabilidad. Nivel 1 es la fuente oficial más directa; nivel 6 son redes sociales sin verificar."
    >
      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2 font-medium">Organización</th>
              <th className="px-4 py-2 font-medium">Nivel</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Datos derivados</th>
              <th className="px-4 py-2 font-medium">Verificada</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                  {s.url?.startsWith("http") ? (
                    <ExternalLink href={s.url}>{s.org}</ExternalLink>
                  ) : (
                    s.org
                  )}
                </td>
                <td className="px-4 py-2">
                  <Badge variant="tier" value={s.tier}>{TIER_LABEL[s.tier] ?? `nivel ${s.tier}`}</Badge>
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  {SOURCE_STATUS_LABEL[s.status] ?? s.status}
                </td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-500">
                  {s._count.tollRecords + s._count.aidPoints} registros
                </td>
                <td className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-600">
                  {s.lastFetchedAt ? formatDate(s.lastFetchedAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
