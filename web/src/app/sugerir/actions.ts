"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitAidPoint(formData: FormData) {
  const municipioId = String(formData.get("municipioId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!municipioId || !kind || !name) {
    throw new Error("Ciudad, tipo y nombre son obligatorios.");
  }

  await prisma.pendingAidPoint.create({
    data: {
      municipioId,
      kind: kind as never,
      name,
      address: emptyToNull(formData.get("address")),
      phone: emptyToNull(formData.get("phone")),
      needsText: emptyToNull(formData.get("needsText")),
      sourceUrl: emptyToNull(formData.get("sourceUrl")),
      submitterNote: emptyToNull(formData.get("submitterNote")),
      submitterContact: emptyToNull(formData.get("submitterContact")),
      origin: "COMMUNITY",
      status: "PENDING",
    },
  });

  redirect("/sugerir/gracias");
}

function emptyToNull(value: FormDataEntryValue | null): string | undefined {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : undefined;
}
