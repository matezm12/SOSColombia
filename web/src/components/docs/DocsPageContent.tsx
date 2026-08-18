import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/docs/page";
import { docsSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

type Lang = "es" | "en";
type SlugParams = { slug?: string[] };

// Shared between src/app/docs/[[...slug]] (es) and src/app/en/docs/[[...slug]]
// (en) -- each route's page.tsx is a thin wrapper around these factories so
// the actual render/metadata logic (and the SEO-helper calls) exist once.
// See lib/source.ts for why es/en are two literal route trees instead of a
// single dynamic [lang] segment.

export async function DocsPageBody({ lang, params }: { lang: Lang; params: Promise<SlugParams> }) {
  const { slug } = await params;
  const page = docsSource.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function makeGenerateStaticParams(lang: Lang) {
  return function generateStaticParams() {
    return docsSource
      .generateParams()
      .filter((p) => p.lang === lang)
      .map((p) => ({ slug: p.slug }));
  };
}

export function makeGenerateMetadata(lang: Lang) {
  return async function generateMetadata({ params }: { params: Promise<SlugParams> }): Promise<Metadata> {
    const { slug } = await params;
    const page = docsSource.getPage(slug, lang);
    if (!page) notFound();

    // Locale-agnostic (no /en prefix) -- buildAlternates/buildOpenGraph add
    // that themselves per locale, same as every other page on the site.
    const path = `/docs${slug?.length ? `/${slug.join("/")}` : ""}`;

    return {
      title: page.data.title,
      description: page.data.description,
      alternates: buildAlternates(path, lang),
      openGraph: buildOpenGraph({ title: page.data.title, description: page.data.description ?? "", path, locale: lang }),
      twitter: buildTwitter({ title: page.data.title, description: page.data.description ?? "", locale: lang }),
    };
  };
}
