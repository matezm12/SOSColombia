import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/docs/page";
import { docsSource } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { buildAlternates, buildOpenGraph, buildTwitter } from "@/lib/seo";

export default async function DocsPageRoute({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
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

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const path = `/docs${slug?.length ? `/${slug.join("/")}` : ""}`;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: buildAlternates(path, "es"),
    openGraph: buildOpenGraph({ title: page.data.title, description: page.data.description ?? "", path, locale: "es" }),
    twitter: buildTwitter({ title: page.data.title, description: page.data.description ?? "", locale: "es" }),
  };
}
