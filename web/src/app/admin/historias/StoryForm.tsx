import type { Story } from "@prisma/client";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const textareaClass = `${inputClass} min-h-40`;

export function StoryForm({
  story,
  municipios,
  campaigns,
  action,
}: {
  story?: Story;
  municipios: { id: string; name: string }[];
  campaigns: { id: string; title: string }[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-6">
      {story && <input type="hidden" name="id" value={story.id} />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Slug (URL) *</span>
          <input
            name="slug"
            required
            defaultValue={story?.slug}
            placeholder="ana-maria-cali-trillizas"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Imagen de portada (URL)</span>
          <input name="coverImageUrl" defaultValue={story?.coverImageUrl ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Autor *</span>
          <input
            name="authorName"
            required
            defaultValue={story?.authorName ?? "Equipo SOSColombia"}
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Ciudad (opcional)</span>
          <select name="municipioId" defaultValue={story?.municipioId ?? ""} className={inputClass}>
            <option value="">— ninguna —</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Campaña (opcional)</span>
          <select name="campaignId" defaultValue={story?.campaignId ?? ""} className={inputClass}>
            <option value="">— ninguna —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Español</h3>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Título *</span>
            <input name="titleEs" required defaultValue={story?.titleEs} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Resumen (1-2 frases) *</span>
            <input name="ledeEs" required defaultValue={story?.ledeEs} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">
              Texto completo * (párrafos separados por línea en blanco)
            </span>
            <textarea name="bodyEs" required defaultValue={story?.bodyEs} className={textareaClass} />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">English</h3>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Title *</span>
            <input name="titleEn" required defaultValue={story?.titleEn} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Summary (1-2 sentences) *</span>
            <input name="ledeEn" required defaultValue={story?.ledeEn} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-700 dark:text-zinc-300">
              Full text * (paragraphs separated by a blank line)
            </span>
            <textarea name="bodyEn" required defaultValue={story?.bodyEn} className={textareaClass} />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" name="publish" defaultChecked={story?.status === "PUBLISHED"} />
        Publicada (visible en /historias)
      </label>

      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Guardar
      </button>
    </form>
  );
}
