/**
 * The `<h2>` string every page's top-level section used to copy-paste by
 * hand (`text-lg font-semibold ...`, mt-10 spacing) — consistent today by
 * convention only, with nothing stopping a future page from drifting. One
 * component, one place to change.
 */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-lg font-semibold text-black dark:text-zinc-50">
      {children}
    </h2>
  );
}
