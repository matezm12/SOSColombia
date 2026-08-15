"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/session";
import { createSession } from "@/lib/volunteer";

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Guard against open-redirect (protocol-relative or off-site targets) —
  // only ever redirect back into /admin/*.
  if (value.startsWith("/admin") && !value.startsWith("//")) return value;
  return "/admin";
}

export async function loginVolunteer(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const failUrl = `/admin/login?error=1&next=${encodeURIComponent(next)}`;

  if (!username || !password) {
    redirect(failUrl);
  }

  const volunteer = await prisma.volunteer.findUnique({ where: { username } });
  if (!volunteer || !volunteer.active || !verifyPassword(password, volunteer.passwordHash)) {
    redirect(failUrl);
  }

  await createSession(volunteer);
  await prisma.volunteer.update({
    where: { id: volunteer.id },
    data: { lastLoginAt: new Date() },
  });

  redirect(next);
}
