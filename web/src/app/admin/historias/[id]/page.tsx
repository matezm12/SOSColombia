import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentVolunteer } from "@/lib/volunteer";
import { PageShell } from "@/components/layout/PageShell";
import { StoryForm } from "../StoryForm";
import { updateStory } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentVolunteer();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) redirect("/admin");

  const { id } = await params;

  const [story, municipios, campaigns] = await Promise.all([
    prisma.story.findUnique({ where: { id } }),
    prisma.municipio.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.crowdfundingCampaign.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  if (!story) notFound();

  return (
    <PageShell width="wide" title="Editar historia">
      <div className="mt-6">
        <StoryForm story={story} municipios={municipios} campaigns={campaigns} action={updateStory} />
      </div>
    </PageShell>
  );
}
