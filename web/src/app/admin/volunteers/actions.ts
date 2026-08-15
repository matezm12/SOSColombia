"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/session";
import { getCurrentVolunteer } from "@/lib/volunteer";

async function requireAdmin() {
  const volunteer = await getCurrentVolunteer();
  if (!volunteer || !volunteer.isAdmin) throw new Error("Not authorized.");
  return volunteer;
}

export async function createVolunteer(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !username || !password) return;

  const existing = await prisma.volunteer.findUnique({ where: { username } });
  if (existing) return; // username taken — silent no-op, same discipline as approveSubmission's invalid-id bail

  await prisma.volunteer.create({
    data: {
      name,
      username,
      passwordHash: hashPassword(password),
      canModeracion: formData.get("canModeracion") === "on",
      canComunidad: formData.get("canComunidad") === "on",
      canBoletines: formData.get("canBoletines") === "on",
      isAdmin: formData.get("isAdmin") === "on",
    },
  });

  revalidatePath("/admin/volunteers");
}

export async function updateVolunteerScope(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.volunteer.update({
    where: { id },
    data: {
      canModeracion: formData.get("canModeracion") === "on",
      canComunidad: formData.get("canComunidad") === "on",
      canBoletines: formData.get("canBoletines") === "on",
      isAdmin: formData.get("isAdmin") === "on",
    },
  });

  revalidatePath("/admin/volunteers");
}

export async function setVolunteerActive(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  await prisma.volunteer.update({ where: { id }, data: { active } });
  revalidatePath("/admin/volunteers");
}

export async function resetVolunteerPassword(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || !password) return;

  await prisma.volunteer.update({
    where: { id },
    data: { passwordHash: hashPassword(password) },
  });

  revalidatePath("/admin/volunteers");
}
