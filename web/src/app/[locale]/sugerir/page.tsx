import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { submitAidPoint } from "./actions";
import { PageShell } from "@/components/layout/PageShell";
import { buildAlternates } from "@/lib/seo";

// Short revalidation window instead of force-dynamic: the municipio list
// changes rarely, and this avoids a DB round trip on every request.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sugerir" });
  return { title: t("title"), description: t("lede"), alternates: buildAlternates("/sugerir", locale) };
}

export default async function SugerirPage(props: PageProps<"/[locale]/sugerir">) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("sugerir");
  const municipios = await prisma.municipio.findMany({
    orderBy: { name: "asc" },
  });

  const KIND_OPTIONS = [
    { value: "ALBERGUE", label: t("kinds.ALBERGUE") },
    { value: "ACOPIO", label: t("kinds.ACOPIO") },
    { value: "HEALTH", label: t("kinds.HEALTH") },
    { value: "VET", label: t("kinds.VET") },
    { value: "BLOOD_DONATION", label: t("kinds.BLOOD_DONATION") },
    { value: "MONETARY_DONATION", label: t("kinds.MONETARY_DONATION") },
  ];

  return (
    <PageShell
      width="narrow"
      title={t("title")}
      lede={t("lede")}
    >
        <form action={submitAidPoint} className="mt-8 space-y-5">
          <Field label={t("fields.ciudad")}>
            <select
              name="municipioId"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">{t("selectCiudad")}</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("fields.tipo")}>
            <select
              name="kind"
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">{t("selectTipo")}</option>
              {KIND_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("fields.nombre")}>
            <input
              name="name"
              required
              placeholder={t("placeholders.nombre")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.direccion")}>
            <input
              name="address"
              placeholder={t("placeholders.direccion")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.telefono")}>
            <input
              name="phone"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.necesita")}>
            <input
              name="needsText"
              placeholder={t("placeholders.necesita")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.fuente")}>
            <input
              name="sourceUrl"
              type="url"
              placeholder={t("placeholders.fuente")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.contexto")}>
            <textarea
              name="submitterNote"
              rows={3}
              placeholder={t("placeholders.contexto")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label={t("fields.contacto")}>
            <input
              name="submitterContact"
              placeholder={t("placeholders.contacto")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {t("submit")}
          </button>
        </form>
    </PageShell>
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
