"use client";

import { usePathname, useRouter } from "next/navigation";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type * as PageTree from "fumadocs-core/page-tree";

const LOCALES = [
  { name: "Español", locale: "es" },
  { name: "English", locale: "en" },
];

// es is unprefixed, en lives under /en/** -- matches createGetUrl's own
// output for hideLocale: "default-locale" (see lib/source.ts), which is
// also this whole site's convention everywhere else (next-intl routing.ts).
// Fumadocs' own default locale-switch handler assumes every locale is
// always prefixed (hideLocale: "never"-shaped), which would send an "es"
// click to "/es/docs/..." (a URL that doesn't exist) -- this replaces it
// with the same algorithm createGetUrl uses.
function toggleLocalePath(pathname: string, target: string): string {
  const withoutEn = pathname === "/en" ? "/" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
  return target === "es" ? withoutEn : `/en${withoutEn}`;
}

export function DocsShell({
  lang,
  tree,
  children,
}: {
  lang: "es" | "en";
  tree: PageTree.Root;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <RootProvider
      theme={{ enabled: false }}
      search={{ options: { api: "/api/docs-search" } }}
      i18n={{
        locale: lang,
        locales: LOCALES,
        onLocaleChange: (value) => router.push(toggleLocalePath(pathname, value)),
      }}
    >
      <DocsLayout
        tree={tree}
        nav={{ title: lang === "es" ? "Documentación" : "Docs", url: lang === "es" ? "/docs" : "/en/docs" }}
        themeSwitch={{ enabled: false }}
        containerProps={{ className: "flex-1" }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
