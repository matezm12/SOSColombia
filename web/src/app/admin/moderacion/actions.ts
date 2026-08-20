"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { upsertSource } from "@/lib/sources";
import { requireScope } from "@/lib/volunteer";
import { deriveSourceName } from "@/lib/sourceName";

// Matches prisma/seed-veredas-pass1.ts's slugify — same normalization, so a
// vereda created here and one created by a future seed pass never diverge
// into two different slugs for the same real name.
function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function approveSubmission(formData: FormData) {
  const volunteer = await requireScope("moderacion");
  if (!volunteer) return;

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
      deriveSourceName(pending.sourceUrl) ??
      (isAutomated ? "Fuente automática sin nombre identificado" : "Aporte comunitario sin fuente adicional"),
    tier: isAutomated ? 1 : 4,
  });

  const resolvedName = pending.name === "Detección automática — revisar"
    ? pending.sourceOrg ?? deriveSourceName(pending.sourceUrl) ?? pending.name
    : pending.name;

  const veredaId = String(formData.get("veredaId") ?? "");
  const veredaNameNew = String(formData.get("veredaNameNew") ?? "").trim();
  let resolvedVeredaId: string | undefined = veredaId || undefined;
  if (!resolvedVeredaId && veredaNameNew) {
    const slug = slugify(veredaNameNew);
    const vereda = await prisma.vereda.upsert({
      where: { municipioId_slug: { municipioId: pending.municipioId, slug } },
      update: {},
      create: { municipioId: pending.municipioId, name: veredaNameNew, slug, sourceId: source.id },
    });
    resolvedVeredaId = vereda.id;
  }

  const aidPoint = await prisma.aidPoint.create({
    data: {
      municipioId: pending.municipioId,
      veredaId: resolvedVeredaId,
      kind: pending.kind,
      name: resolvedName,
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
      reviewedByVolunteerId: volunteer.id,
      promotedAidPointId: aidPoint.id,
    },
  });

  revalidatePath("/admin/moderacion");
}

export async function rejectSubmission(formData: FormData) {
  const volunteer = await requireScope("moderacion");
  if (!volunteer) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pendingAidPoint.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedByVolunteerId: volunteer.id },
  });

  revalidatePath("/admin/moderacion");
}
