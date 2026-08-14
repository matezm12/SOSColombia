"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitCommunityPost(formData: FormData) {
  const platform = String(formData.get("platform") ?? "");
  const permalink = String(formData.get("permalink") ?? "").trim();
  const category = String(formData.get("category") ?? "");

  if (!platform || !permalink || !category) {
    throw new Error("Plataforma, enlace y categoría son obligatorios.");
  }
  if (!/^https?:\/\//.test(permalink)) {
    throw new Error("El enlace debe ser una URL completa (https://...).");
  }

  await prisma.pendingSocialPost.create({
    data: {
      platform: platform as never,
      permalink,
      category: category as never,
      municipioId: emptyToNull(formData.get("municipioId")) ?? null,
      authorHandle: emptyToNull(formData.get("authorHandle")),
      placeName: emptyToNull(formData.get("placeName")),
      submitterNote: emptyToNull(formData.get("submitterNote")),
      submitterContact: emptyToNull(formData.get("submitterContact")),
      origin: "COMMUNITY",
      status: "PENDING",
    },
  });

  redirect("/comunidad/sugerir/gracias");
}

function emptyToNull(value: FormDataEntryValue | null): string | undefined {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : undefined;
}
