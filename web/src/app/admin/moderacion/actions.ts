"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approveSubmission(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pending = await prisma.pendingAidPoint.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  const source = await prisma.source.create({
    data: {
      url: pending.sourceUrl ?? "sugerencia comunitaria, sin enlace",
      org: "Sugerencia comunitaria (revisada por moderación)",
      tier: 4,
      status: "LIVE",
      lastFetchedAt: new Date(),
    },
  });

  const aidPoint = await prisma.aidPoint.create({
    data: {
      municipioId: pending.municipioId,
      kind: pending.kind,
      name: pending.name,
      address: pending.address,
      phone: pending.phone,
      needsText: pending.needsText,
      accessRestriction: pending.accessRestriction,
      status: "ACTIVE",
      sourceId: source.id,
      lastVerifiedAt: new Date(),
    },
  });

  await prisma.pendingAidPoint.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      promotedAidPointId: aidPoint.id,
    },
  });

  revalidatePath("/admin/moderacion");
}

export async function rejectSubmission(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pendingAidPoint.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  revalidatePath("/admin/moderacion");
}
