import { prisma } from "@/lib/prisma";
import { submitAidPoint } from "./actions";

const KIND_OPTIONS = [
  { value: "ALBERGUE", label: "Albergue (dónde se quedan las familias)" },
  { value: "ACOPIO", label: "Centro de acopio (dónde donar cosas)" },
  { value: "HEALTH", label: "Salud" },
  { value: "VET", label: "Veterinaria" },
  { value: "BLOOD_DONATION", label: "Donación de sangre" },
  { value: "MONETARY_DONATION", label: "Donación monetaria" },
];

export default async function SugerirPage() {
  const municipios = await prisma.municipio.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Sugerir un punto de ayuda
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          ¿Conoces un albergue, centro de acopio, o punto de ayuda que no está
          en el sitio? Cuéntanos. Cada sugerencia se revisa antes de
          publicarse — no aparece automáticamente.
        </p>

        <form action={submitAidPoint} className="mt-8 space-y-5">
          <Field label="Ciudad *">
            <select
              name="municipioId"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Selecciona una ciudad</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de punto *">
            <select
              name="kind"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">Selecciona un tipo</option>
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nombre del lugar *">
            <input
              name="name"
              required
              placeholder="Ej: Coliseo Municipal"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Dirección">
            <input
              name="address"
              placeholder="Si la sabes"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Teléfono">
            <input
              name="phone"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="¿Qué necesitan?">
            <input
              name="needsText"
              placeholder="Ej: colchonetas, agua, pañales"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Enlace de la fuente (post, noticia, página oficial)">
            <input
              name="sourceUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Contexto adicional">
            <textarea
              name="submitterNote"
              rows={3}
              placeholder="Cualquier detalle que ayude a verificarlo"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Tu contacto (opcional, no se publica)">
            <input
              name="submitterContact"
              placeholder="Email o teléfono, por si necesitamos confirmar algo"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Enviar sugerencia
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}
