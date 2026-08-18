"use client";

import { useEffect, useRef, useState } from "react";
import { useLocaleFromPathname } from "@/i18n/useLocaleFromPathname";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";

// Renders from SiteHeader, outside the [locale] segment's
// NextIntlClientProvider (see i18n/useLocaleFromPathname.ts) -- so no
// next-intl useTranslations here, and no next-intl <Link> either (its
// locale-prefixing needs the same context). Plain <a href> with the locale
// prefix built manually via withLocale(), same approach LanguageSwitcher
// already uses for the same reason.
const COPY = {
  es: {
    trigger: "Buscar",
    placeholder: "Buscar ciudades, veredas, puntos de ayuda…",
    hint: "Escribe para buscar ciudades, veredas, puntos de ayuda, historias, campañas y más.",
    noResults: "No encontramos nada para tu búsqueda.",
    close: "Cerrar búsqueda",
    groups: {
      municipios: "Ciudades",
      veredas: "Veredas",
      aidPoints: "Puntos de ayuda",
      stories: "Historias",
      campaigns: "Campañas",
      resources: "Recursos aliados",
      reports: "Informes oficiales",
    },
  },
  en: {
    trigger: "Search",
    placeholder: "Search cities, veredas, aid points…",
    hint: "Type to search cities, veredas, aid points, stories, campaigns and more.",
    noResults: "We couldn't find anything for your search.",
    close: "Close search",
    groups: {
      municipios: "Cities",
      veredas: "Veredas",
      aidPoints: "Aid points",
      stories: "Stories",
      campaigns: "Campaigns",
      resources: "Allied resources",
      reports: "Official reports",
    },
  },
} as const;

type GroupKey = keyof typeof COPY.es.groups;
type ResultItem = { id: string; primary: string; secondary?: string; href: string };
type ResultGroup = { key: GroupKey; items: ResultItem[] };

type ApiResponse = {
  municipios: { id: string; name: string; divipolaCode: string }[];
  veredas: { id: string; name: string; slug: string; municipioDivipolaCode: string; municipioName: string }[];
  aidPoints: {
    id: string;
    name: string;
    needsText: string | null;
    municipioDivipolaCode: string;
    municipioName: string;
  }[];
  stories: { id: string; slug: string; title: string; lede: string }[];
  campaigns: {
    id: string;
    title: string;
    orgOrPerson: string;
    municipioDivipolaCode: string | null;
    municipioName: string | null;
  }[];
  resources: { id: string; name: string; description: string }[];
  reports: { id: string; title: string; org: string }[];
};

function buildGroups(data: ApiResponse, withLocale: (path: string) => string): ResultGroup[] {
  return (
    [
      {
        key: "municipios",
        items: data.municipios.map((m) => ({
          id: m.id,
          primary: m.name,
          href: withLocale(`/ciudad/${m.divipolaCode}`),
        })),
      },
      {
        key: "veredas",
        items: data.veredas.map((v) => ({
          id: v.id,
          primary: v.name,
          secondary: v.municipioName,
          href: withLocale(`/ciudad/${v.municipioDivipolaCode}/${v.slug}`),
        })),
      },
      {
        key: "aidPoints",
        items: data.aidPoints.map((p) => ({
          id: p.id,
          primary: p.name,
          secondary: p.municipioName,
          href: withLocale(`/ciudad/${p.municipioDivipolaCode}#${p.id}`),
        })),
      },
      {
        key: "stories",
        items: data.stories.map((s) => ({
          id: s.id,
          primary: s.title,
          secondary: s.lede,
          href: withLocale(`/historias/${s.slug}`),
        })),
      },
      {
        key: "campaigns",
        items: data.campaigns.map((c) => ({
          id: c.id,
          primary: c.title,
          secondary: c.orgOrPerson,
          href: c.municipioDivipolaCode
            ? withLocale(`/ciudad/${c.municipioDivipolaCode}#${c.id}`)
            : withLocale(`/donar#${c.id}`),
        })),
      },
      {
        key: "resources",
        items: data.resources.map((r) => ({
          id: r.id,
          primary: r.name,
          secondary: r.description,
          href: withLocale(`/recursos#${r.id}`),
        })),
      },
      {
        key: "reports",
        items: data.reports.map((r) => ({
          id: r.id,
          primary: r.title,
          secondary: r.org,
          href: withLocale(`/informes#${r.id}`),
        })),
      },
    ] satisfies ResultGroup[]
  ).filter((g) => g.items.length > 0);
}

export function Search() {
  const locale = useLocaleFromPathname();
  const copy = COPY[locale];
  const withLocale = (path: string) => (locale === "en" ? `/en${path}` : path);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Global shortcut. Ignored while typing anywhere else so it doesn't
  // hijack normal typing (e.g. "/" inside another field).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "/" && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus trap entry + background scroll lock. State reset on close lives in
  // closeModal() below, run directly from the event that closes the modal,
  // not reactively here -- calling setState synchronously in an effect body
  // outside of an async continuation trips react-hooks/set-state-in-effect
  // (it's meant for syncing with external systems, not deriving state).
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
    };
  }, [open]);

  function closeModal() {
    setOpen(false);
    setQuery("");
    setData(null);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    // Same reasoning as closeModal() -- set synchronously here, in the event
    // handler that actually changed the query, rather than via an effect
    // reacting to it (react-hooks/set-state-in-effect flags any top-level
    // setState in an effect body, even one followed by real async work --
    // it wants the "starting" state change to come from the triggering
    // event, and only the async continuation's setState left in the effect).
    if (value.trim().length < 2) {
      setData(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  // Debounced, cancellable fetch -- see src/app/api/search/route.ts. Only
  // reached once handleQueryChange has already confirmed length >= 2 and
  // set loading; this effect's body only ever setStates inside the fetch's
  // own async callbacks below, never synchronously at the top.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json: ApiResponse) => {
          setData(json);
          setActiveIndex(-1);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name !== "AbortError") setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, locale]);

  const groups = data ? buildGroups(data, withLocale) : [];
  const flatItems = groups.flatMap((g) => g.items);

  // Standard command-palette keyboard model: DOM focus stays in the input
  // the whole time, arrow keys move a virtual highlight (aria-activedescendant)
  // rather than moving real focus into the results list.
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0 && flatItems[activeIndex]) {
      window.location.href = flatItems[activeIndex].href;
    }
  }

  const showHint = query.trim().length < 2;
  const showLoading = !showHint && loading && !data;
  const showNoResults = !showHint && !loading && data !== null && flatItems.length === 0;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.trigger}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.trigger}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-[10vh] max-w-xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex h-9 items-center gap-2 border-b border-zinc-100 px-3 dark:border-zinc-900">
              <SearchIcon className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={copy.placeholder}
                autoComplete="off"
                role="combobox"
                aria-expanded={flatItems.length > 0}
                aria-controls="search-results-list"
                aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                className="h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={closeModal}
                aria-label={copy.close}
                className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div id="search-results-list" role="listbox" className="max-h-[60vh] overflow-y-auto">
              {showHint && <p className="px-4 py-6 text-center text-sm text-zinc-400">{copy.hint}</p>}
              {showLoading && (
                <div className="flex justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
                </div>
              )}
              {showNoResults && (
                <p className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-500">{copy.noResults}</p>
              )}
              {groups.map((group, groupIdx) => {
                const indexOffset = groups.slice(0, groupIdx).reduce((n, g) => n + g.items.length, 0);
                return (
                  <div key={group.key}>
                    <p className="px-2 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
                      {copy.groups[group.key]}
                    </p>
                    {group.items.map((item, i) => {
                      const flatIndex = indexOffset + i;
                      const active = activeIndex === flatIndex;
                      return (
                        <a
                          key={item.id}
                          id={`search-result-${flatIndex}`}
                          role="option"
                          aria-selected={active}
                          href={item.href}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          className={`mx-1 block rounded-sm px-2 py-1.5 ${active ? "bg-zinc-50 dark:bg-zinc-900" : ""}`}
                        >
                          <span className="block truncate text-sm text-zinc-900 dark:text-zinc-50">
                            {item.primary}
                          </span>
                          {item.secondary && (
                            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-500">
                              {item.secondary}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
