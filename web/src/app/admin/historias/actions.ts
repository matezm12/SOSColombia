"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/volunteer";

function readStoryFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    titleEs: String(formData.get("titleEs") ?? "").trim(),
    titleEn: String(formData.get("titleEn") ?? "").trim(),
    ledeEs: String(formData.get("ledeEs") ?? "").trim(),
    ledeEn: String(formData.get("ledeEn") ?? "").trim(),
    bodyEs: String(formData.get("bodyEs") ?? "").trim(),
    bodyEn: String(formData.get("bodyEn") ?? "").trim(),
    authorName: String(formData.get("authorName") ?? "").trim(),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    municipioId: String(formData.get("municipioId") ?? "").trim() || null,
    campaignId: String(formData.get("campaignId") ?? "").trim() || null,
  };
}

function isComplete(fields: ReturnType<typeof readStoryFields>): boolean {
  return Boolean(
    fields.slug &&
      fields.titleEs &&
      fields.titleEn &&
      fields.ledeEs &&
      fields.ledeEn &&
      fields.bodyEs &&
      fields.bodyEn &&
      fields.authorName,
  );
}

/**
 * A story linked to a campaign/city needs those pages' 60s ISR cache
 * (donar, donar/internacional, ciudad/[divipola]) invalidated immediately
 * too, not just /historias — otherwise the "Leer la historia completa"
 * link and the city's "Historias de esta ciudad" section can lag up to a
 * minute behind the story actually going live.
 */
async function revalidateStoryLinks(municipioId: string | null) {
  revalidatePath("/donar");
  revalidatePath("/donar/internacional");
  if (municipioId) {
    const municipio = await prisma.municipio.findUnique({
      where: { id: municipioId },
      select: { divipolaCode: true },
    });
    if (municipio) revalidatePath(`/ciudad/${municipio.divipolaCode}`);
  }
}

export async function createStory(formData: FormData) {
  await requireAdmin();

  const fields = readStoryFields(formData);
  if (!isComplete(fields)) return;

  const existing = await prisma.story.findUnique({ where: { slug: fields.slug } });
  if (existing) return; // slug taken — silent no-op, same discipline as createVolunteer's username check

  const publish = formData.get("publish") === "on";

  await prisma.story.create({
    data: {
      ...fields,
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/historias");
  revalidatePath("/historias");
  await revalidateStoryLinks(fields.municipioId);
  redirect("/admin/historias");
}

export async function updateStory(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fields = readStoryFields(formData);
  if (!id || !isComplete(fields)) return;

  const existing = await prisma.story.findUnique({ where: { id } });
  if (!existing) return;

  const slugTaken = await prisma.story.findFirst({
    where: { slug: fields.slug, NOT: { id } },
  });
  if (slugTaken) return;

  const publish = formData.get("publish") === "on";
  const nowPublishing = publish && existing.status !== "PUBLISHED";

  await prisma.story.update({
    where: { id },
    data: {
      ...fields,
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: nowPublishing ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/admin/historias");
  revalidatePath("/historias");
  revalidatePath(`/historias/${fields.slug}`);
  await revalidateStoryLinks(fields.municipioId);
  redirect("/admin/historias");
}

export async function deleteStory(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.story.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.story.delete({ where: { id } });

  revalidatePath("/admin/historias");
  revalidatePath("/historias");
  await revalidateStoryLinks(existing.municipioId);
}
