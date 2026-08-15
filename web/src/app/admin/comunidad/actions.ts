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

  const post = await prisma.socialPost.create({
    data: {
      platform: pending.platform,
      permalink: pending.permalink,
      authorHandle: pending.authorHandle,
      municipioId: pending.municipioId,
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
