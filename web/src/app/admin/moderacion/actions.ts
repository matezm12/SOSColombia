"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { upsertSource } from "@/lib/sources";

export async function approveSubmission(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pending = await prisma.pendingAidPoint.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  // An automated gov-site sweep finding is a materially more reliable source
  // than an anonymous community tip — reflect that in the org label and tier
  // instead of always attributing it to "community suggestion."
  const isAutomated = pending.origin === "AUTOMATION_SWEEP";
  const source = await upsertSource({
    url: pending.sourceUrl ?? "sugerencia comunitaria, sin enlace",
    org:
      pending.sourceOrg ??
      (isAutomated
        ? "Detección automática (revisada por moderación)"
        : "Sugerencia comunitaria (revisada por moderación)"),
    tier: isAutomated ? 1 : 4,
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
