"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/volunteer";

export async function logoutVolunteer() {
  await clearSession();
  redirect("/admin/login");
}
