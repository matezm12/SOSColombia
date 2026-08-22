import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { loginVolunteer } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <PageShell width="narrow" title="Acceso de voluntarios">
      <Card className="mt-6">
        {error && (
          <p className="mb-4 rounded-md bg-severity-critica/10 px-3 py-2 text-sm font-medium text-severity-critica">
            Usuario o contraseña incorrectos.
          </p>
        )}
        <form action={loginVolunteer} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/admin"} />
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Usuario</span>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <Button type="submit">Entrar</Button>
        </form>
      </Card>
    </PageShell>
  );
}
