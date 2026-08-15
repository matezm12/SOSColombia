import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { getCurrentVolunteer } from "@/lib/volunteer";

const SECTIONS = [
  { href: "/admin/moderacion", label: "Moderación — puntos de ayuda", flag: "canModeracion" as const },
  { href: "/admin/comunidad", label: "Moderación — comunidad", flag: "canComunidad" as const },
  { href: "/admin/boletines", label: "Boletines", flag: "canBoletines" as const },
];

export default async function AdminHomePage() {
  const volunteer = await getCurrentVolunteer();
  if (!volunteer) redirect("/admin/login");

  const accessibleSections = SECTIONS.filter((s) => volunteer.isAdmin || volunteer[s.flag]);

  return (
    <PageShell title={`Hola, ${volunteer.name}`}>
      <p className="-mt-2 text-zinc-500 dark:text-zinc-500">
        Panel de voluntarios de SOSColombia.
      </p>

      <div className="mt-6 space-y-3">
        {accessibleSections.map((s) => (
          <Card key={s.href}>
            <Link href={s.href} className="font-medium text-black hover:underline dark:text-zinc-50">
              {s.label}
            </Link>
          </Card>
        ))}
        {volunteer.isAdmin && (
          <Card>
            <Link
              href="/admin/volunteers"
              className="font-medium text-black hover:underline dark:text-zinc-50"
            >
              Gestionar voluntarios
            </Link>
          </Card>
        )}
        {accessibleSections.length === 0 && !volunteer.isAdmin && (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Tu cuenta todavía no tiene acceso a ninguna sección. Pide a un administrador que te
            asigne permisos.
          </p>
        )}
      </div>
    </PageShell>
  );
}
