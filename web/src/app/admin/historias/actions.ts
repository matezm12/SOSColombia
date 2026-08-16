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
  redirect("/admin/historias");
}

export async function deleteStory(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.story.delete({ where: { id } });

  revalidatePath("/admin/historias");
  revalidatePath("/historias");
}
