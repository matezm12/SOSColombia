"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireScope } from "@/lib/volunteer";

export async function approveCommunityPost(formData: FormData) {
  const volunteer = await requireScope("comunidad");
  if (!volunteer) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pending = await prisma.pendingSocialPost.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  // Auto-link to a Vereda only on an unambiguous name match within this
  // post's own municipio — never guessed across cities, never a new Vereda
  // created from social-post text alone (too noisy a source for that).
  let veredaId: string | undefined;
  if (pending.municipioId && pending.placeName) {
    const veredas = await prisma.vereda.findMany({ where: { municipioId: pending.municipioId } });
    const matches = veredas.filter((v) => pending.placeName!.toLowerCase().includes(v.name.toLowerCase()));
    if (matches.length === 1) veredaId = matches[0].id;
  }

  const post = await prisma.socialPost.create({
    data: {
      platform: pending.platform,
      permalink: pending.permalink,
      authorHandle: pending.authorHandle,
      municipioId: pending.municipioId,
      veredaId,
      category: pending.category,
    },
  });

  await prisma.pendingSocialPost.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedByVolunteerId: volunteer.id,
      promotedSocialPostId: post.id,
    },
  });

  revalidatePath("/admin/comunidad");
  revalidatePath("/comunidad");
}

export async function rejectCommunityPost(formData: FormData) {
  const volunteer = await requireScope("comunidad");
  if (!volunteer) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pendingSocialPost.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedByVolunteerId: volunteer.id },
  });

  revalidatePath("/admin/comunidad");
}
