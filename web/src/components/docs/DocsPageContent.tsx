import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/docs/page";
import { docsSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { buildAlternates, buildOpenGraph, buildTwitter, absoluteUrl } from "@/lib/seo";

type Lang = "es" | "en";
type SlugParams = { slug?: string[] };

// Shared between src/app/docs/[[...slug]] (es) and src/app/en/docs/[[...slug]]
// (en) -- each route's page.tsx is a thin wrapper around these factories so
// the actual render/metadata logic (and the SEO-helper calls) exist once.
// See lib/source.ts for why es/en are two literal route trees instead of a
// single dynamic [lang] segment.

// Same custom domain as every other local SITE_URL const on the site (see
// historias/[slug]/page.tsx's comment) -- only needed here for JSON-LD's
// absolute publisher/website URLs, everything else goes through absoluteUrl().
const SITE_URL = "https://www.soscolombia.xyz";

// Only the "api" folder has a title distinct from its slug right now (see
// content/docs/api/meta.json / meta.en.json) -- hand-mapped rather than
// walking the page tree, since the docs section is only ever one folder
// deep. Add an entry here if a second folder shows up.
const FOLDER_TITLES: Record<string, Record<Lang, string>> = {
  api: { es: "Datos y API", en: "Data & API" },
};

function buildBreadcrumbItems(lang: Lang, slug: string[] | undefined, pageTitle: string) {
  const items = [
    { name: lang === "es" ? "Inicio" : "Home", url: absoluteUrl("", lang) },
    { name: lang === "es" ? "Documentación" : "Docs", url: absoluteUrl("/docs", lang) },
  ];
  const segs = slug ?? [];
  // The docs landing page (segs.length === 0) IS the "Documentación"/"Docs"
  // node above -- pushing it again would duplicate that same URL under a
  // slightly different name, which BreadcrumbList isn't meant to have.
  if (segs.length === 0) return items;
  for (let i = 0; i < segs.length - 1; i++) {
    const folderSlug = segs[i];
    items.push({
      name: FOLDER_TITLES[folderSlug]?.[lang] ?? folderSlug,
      url: absoluteUrl(`/docs/${segs.slice(0, i + 1).join("/")}`, lang),
    });
  }
  items.push({ name: pageTitle, url: absoluteUrl(`/docs/${segs.join("/")}`, lang) });
  return items;
}

export async function DocsPageBody({ lang, params }: { lang: Lang; params: Promise<SlugParams> }) {
  const { slug } = await params;
  const page = docsSource.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const pageUrl = absoluteUrl(`/docs${slug?.length ? `/${slug.join("/")}` : ""}`, lang);
  const breadcrumbItems = buildBreadcrumbItems(lang, slug, page.data.title);

  // schema.org/TechArticle -- same raw-object + inline-<script> pattern as
  // every other JSON-LD on the site (see historias/[slug]/page.tsx), no
  // separate library. No datePublished/dateModified: unlike Story, docs
  // pages don't track authorship dates, and fabricating one would be worse
  // than omitting it.
  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    inLanguage: lang === "en" ? "en-US" : "es-CO",
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isPartOf: { "@type": "WebSite", name: "SOSColombia", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "SOSColombia",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image` },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </>
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
