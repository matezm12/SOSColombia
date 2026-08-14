import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for next/link, next/navigation.
// Use these instead of next/link's Link everywhere a URL should carry the
// current locale prefix automatically.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
