import Link from "next/link";

export default function GraciasPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16 text-center">
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
      </main>
    </div>
  );
}
