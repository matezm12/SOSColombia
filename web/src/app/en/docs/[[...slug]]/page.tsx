import { DocsPageBody, makeGenerateStaticParams, makeGenerateMetadata } from "@/components/docs/DocsPageContent";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  return <DocsPageBody lang="en" params={params} />;
}

export const generateStaticParams = makeGenerateStaticParams("en");
export const generateMetadata = makeGenerateMetadata("en");
