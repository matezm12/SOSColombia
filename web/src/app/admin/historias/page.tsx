import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentVolunteer } from "@/lib/volunteer";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClass } from "@/components/ui/Button";
import { deleteStory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHistoriasPage() {
  const me = await getCurrentVolunteer();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) redirect("/admin");

  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "desc" },
    include: { municipio: { select: { name: true } }, campaign: { select: { title: true } } },
  });

  return (
    <PageShell width="wide" title="Historias">
      <p className="-mt-2 text-zinc-500 dark:text-zinc-500">
        Historias largas sobre campañas y esfuerzos comunitarios específicos.
      </p>

      <div className="mt-6">
        <Link href="/admin/historias/new" className={buttonClass()}>
          + Nueva historia
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {stories.map((s) => (
          <Card key={s.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-black dark:text-zinc-50">{s.titleEs}</span>
                {(s.municipio || s.campaign) && (
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {s.municipio?.name}
                    {s.municipio && s.campaign && " · "}
                    {s.campaign?.title}
                  </span>
                )}
              </div>
              <span
                className={
                  s.status === "PUBLISHED"
                    ? "text-sm text-emerald-600 dark:text-emerald-400"
                    : "text-sm text-zinc-400"
                }
              >
                {s.status === "PUBLISHED" ? "Publicada" : "Borrador"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Link
                href={`/admin/historias/${s.id}`}
                className="text-sm font-medium text-black underline dark:text-zinc-50"
              >
                Editar
              </Link>
              <form action={deleteStory}>
                <input type="hidden" name="id" value={s.id} />
                <button
                  type="submit"
                  className="text-sm text-severity-critica hover:underline"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </Card>
        ))}
        {stories.length === 0 && <EmptyState>Ninguna historia todavía.</EmptyState>}
      </div>
    </PageShell>
  );
}
