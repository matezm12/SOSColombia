"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TollMetric } from "@prisma/client";

const VALID_METRICS = new Set<string>([
  "DEATHS_REPORTED_OFFICIAL",
  "DEATHS_CONFIRMED_FORENSIC",
  "INJURED",
  "MISSING_OFFICIAL",
  "MISSING_CROWDSOURCED",
  "DAMNIFICADOS_PERSONAS",
  "DAMNIFICADOS_FAMILIAS",
  "VIVIENDAS_DESTRUIDAS",
  "VIVIENDAS_AVERIADAS",
  "EDIFICIOS_COLAPSADOS",
  "CENTROS_EDUCATIVOS_AFECTADOS",
  "CENTROS_COMUNITARIOS_AFECTADOS",
  "CENTROS_SALUD_AFECTADOS",
]);

// Unlike PendingAidPoint (where every field is already filled in by the submitter),
// a PendingTollRecord starts as a bare detection stub — the moderator supplies the
// actual figures here, after reading the bulletin themselves, which is what this
// form on /admin/boletines is for.
export async function approveTollRecord(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const metric = String(formData.get("metric") ?? "");
  const value = Number(formData.get("value"));
  const asOfRaw = String(formData.get("asOf") ?? "");
  const tier = Number(formData.get("tier") ?? 2);
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const municipioId = String(formData.get("municipioId") ?? "").trim() || null;
  const departmentId = String(formData.get("departmentId") ?? "").trim() || null;

  if (!id || !VALID_METRICS.has(metric) || !Number.isFinite(value) || !asOfRaw) return;

  const pending = await prisma.pendingTollRecord.findUnique({ where: { id } });
  if (!pending || pending.status !== "PENDING") return;

  const source = await prisma.source.create({
    data: {
      url: pending.sourceUrl ?? "detección automática, sin enlace",
      org: pending.sourceOrg ?? "Detección automática (revisada por moderación)",
      tier: Number.isFinite(tier) ? tier : 2,
      status: "LIVE",
      lastFetchedAt: new Date(),
    },
  });

  const tollRecord = await prisma.tollRecord.create({
    data: {
      municipioId,
      departmentId,
      metric: metric as TollMetric,
      value,
      unit,
      sourceId: source.id,
      tier: Number.isFinite(tier) ? tier : 2,
      asOf: new Date(asOfRaw),
      notes: pending.submitterNote,
    },
  });

  await prisma.pendingTollRecord.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      promotedTollRecordId: tollRecord.id,
    },
  });

  revalidatePath("/admin/boletines");
}

export async function rejectTollRecord(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.pendingTollRecord.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });

  revalidatePath("/admin/boletines");
}
