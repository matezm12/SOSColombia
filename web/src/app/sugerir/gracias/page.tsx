import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

export default function GraciasPage() {
  return (
    <PageShell width="narrow">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          ¡Gracias!
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Recibimos tu sugerencia. La revisamos antes de publicarla — si
          dejaste tu contacto y tenemos alguna pregunta, te escribimos.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  );
}
