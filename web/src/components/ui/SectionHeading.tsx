/**
 * The `<h2>` string every page's top-level section used to copy-paste by
 * hand (`text-lg font-semibold ...`, mt-10 spacing) — consistent today by
 * convention only, with nothing stopping a future page from drifting. One
 * component, one place to change.
 *
 * Also carries the section-hierarchy divider: on a page stacking several
 * data sections (tolls, aid points, campaigns...) they used to be told
 * apart only by the heading text itself, no visual break — a subtle rule
 * now separates one section from the next. Pass `first` on a page's very
 * first section so it doesn't get a stray line sitting right under the
 * lede.
 */
export function SectionHeading({
  children,
  first = false,
}: {
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <h2
      className={
        first
          ? "mt-10 text-lg font-semibold text-black dark:text-zinc-50"
          : "mt-10 border-t border-zinc-100 pt-6 text-lg font-semibold text-black dark:border-zinc-900 dark:text-zinc-50"
      }
    >
      {children}
    </h2>
  );
}
