import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { submitCommunityPost } from "./actions";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

// Was hand-repeated across all 7 fields below with no shared source.
const INPUT_CLASS =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

// Short revalidation window instead of force-dynamic: this page is mostly
// a static form, no need for a DB round trip on every request.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comunidadSugerir" });
  return {
    title: t("title"),
    description: t("lede"),
    alternates: buildAlternates("/comunidad/sugerir", locale),
    openGraph: buildOpenGraph({ title: t("title"), description: t("lede"), path: "/comunidad/sugerir", locale }),
    twitter: buildTwitter({ title: t("title"), description: t("lede"), locale }),
  };
}

const PLATFORM_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "X", label: "X (Twitter)" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "TIKTOK", label: "TikTok" },
];

export default async function SugerirComunidadPage(
  props: PageProps<"/[locale]/comunidad/sugerir">
) {
  // See donar/page.tsx for why this await matters for static rendering.
  await props.params;
  const t = await getTranslations("comunidadSugerir");
  const municipios = await prisma.municipio.findMany({ orderBy: { name: "asc" } });

  const CATEGORY_OPTIONS = [
    { value: "AID_POINT", label: t("categories.aidPoint") },
    { value: "NEED", label: t("categories.need") },
    { value: "HUMAN_INTEREST", label: t("categories.humanInterest") },
    { value: "OFFICIAL", label: t("categories.official") },
  ];

  return (
    <PageShell
      width="narrow"
      backHref="/comunidad"
      title={t("title")}
      lede={t("lede")}
    >
      <form action={submitCommunityPost} className="mt-8 space-y-5">
        <Field label={t("fields.platform")}>
          <select
            name="platform"
            required
            className={INPUT_CLASS}
          >
            <option value="">{t("selectPlatform")}</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fields.permalink")}>
          <input
            name="permalink"
            type="url"
            required
            placeholder={t("placeholders.permalink")}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label={t("fields.category")}>
          <select
            name="category"
            required
            className={INPUT_CLASS}
          >
            <option value="">{t("selectCategory")}</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fields.municipio")}>
          <select
            name="municipioId"
            className={INPUT_CLASS}
          >
            <option value="">{t("noSpecificCity")}</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("fields.authorHandle")}>
          <input
            name="authorHandle"
            placeholder={t("placeholders.authorHandle")}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label={t("fields.placeName")}>
          <input
            name="placeName"
            placeholder={t("placeholders.placeName")}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label={t("fields.submitterNote")}>
          <textarea
            name="submitterNote"
            rows={3}
            placeholder={t("placeholders.submitterNote")}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label={t("fields.submitterContact")}>
          <input
            name="submitterContact"
            placeholder={t("placeholders.submitterContact")}
            className={INPUT_CLASS}
          />
        </Field>

        <Button type="submit" className="w-full">
          {t("submit")}
        </Button>
      </form>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}
