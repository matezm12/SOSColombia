import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentVolunteer } from "@/lib/volunteer";
import { PageShell } from "@/components/layout/PageShell";
import { StoryForm } from "../StoryForm";
import { createStory } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const me = await getCurrentVolunteer();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) redirect("/admin");

  const [municipios, campaigns] = await Promise.all([
    prisma.municipio.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.crowdfundingCampaign.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <PageShell width="wide" title="Nueva historia">
      <div className="mt-6">
        <StoryForm municipios={municipios} campaigns={campaigns} action={createStory} />
      </div>
    </PageShell>
  );
}
