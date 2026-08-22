import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentVolunteer } from "@/lib/volunteer";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  createVolunteer,
  updateVolunteerScope,
  setVolunteerActive,
  resetVolunteerPassword,
} from "./actions";

// Always show live accounts/counts — this is a low-traffic admin-only page,
// no reason to cache it.
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export default async function VolunteersPage() {
  const me = await getCurrentVolunteer();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) redirect("/admin");

  const volunteers = await prisma.volunteer.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { reviewedAidPoints: true, reviewedSocialPosts: true, reviewedTollRecords: true },
      },
    },
  });

  return (
    <PageShell width="wide" title="Voluntarios">
      <p className="-mt-2 text-zinc-500 dark:text-zinc-500">
        Cuentas de acceso a /admin — cada acción de moderación queda atribuida a quien la hizo.
      </p>

      <SectionHeading first>Cuentas ({volunteers.length})</SectionHeading>
      <div className="mt-4 space-y-4">
        {volunteers.map((v) => {
          const totalReviewed =
            v._count.reviewedAidPoints + v._count.reviewedSocialPosts + v._count.reviewedTollRecords;
          return (
            <Card key={v.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-black dark:text-zinc-50">{v.name}</span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-500">@{v.username}</span>
                </div>
                <span
                  className={
                    v.active
                      ? "text-sm text-emerald-600 dark:text-emerald-400"
                      : "text-sm text-zinc-400"
                  }
                >
                  {v.active ? "Activa" : "Desactivada"}
                </span>
              </div>

              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {totalReviewed} revisiones — {v._count.reviewedAidPoints} puntos de ayuda,{" "}
                {v._count.reviewedSocialPosts} comunidad, {v._count.reviewedTollRecords} boletines
                {v.lastLoginAt && (
                  <> · último acceso {v.lastLoginAt.toLocaleDateString("es-CO")}</>
                )}
              </p>

              <form action={updateVolunteerScope} className="mt-3 flex flex-wrap items-center gap-4">
                <input type="hidden" name="id" value={v.id} />
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" name="canModeracion" defaultChecked={v.canModeracion} />
                  Moderación
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" name="canComunidad" defaultChecked={v.canComunidad} />
                  Comunidad
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" name="canBoletines" defaultChecked={v.canBoletines} />
                  Boletines
                </label>
                <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" name="isAdmin" defaultChecked={v.isAdmin} />
                  Administrador
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Guardar permisos
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <form action={setVolunteerActive}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="active" value={(!v.active).toString()} />
                  <button
                    type="submit"
                    className={
                      v.active
                        ? "rounded-md bg-severity-critica/10 px-3 py-1 text-sm font-medium text-severity-critica hover:bg-severity-critica/20"
                        : "rounded-md bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                    }
                  >
                    {v.active ? "Desactivar" : "Activar"}
                  </button>
                </form>

                <form action={resetVolunteerPassword} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={v.id} />
                  <input
                    name="password"
                    type="text"
                    placeholder="Nueva contraseña"
                    className={`${inputClass} w-40`}
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Restablecer contraseña
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionHeading>Crear voluntario</SectionHeading>
      <Card className="mt-4">
        <form action={createVolunteer} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Nombre *</span>
            <input name="name" required className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Usuario *</span>
            <input name="username" required className={inputClass} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Contraseña inicial *</span>
            <input name="password" type="text" required className={inputClass} />
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="canModeracion" />
              Moderación
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="canComunidad" />
              Comunidad
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="canBoletines" />
              Boletines
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="isAdmin" />
              Administrador
            </label>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Crear cuenta</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
