// Shown automatically by Next.js while any [locale] page's async data fetch
// is in flight — pages here use a short ISR revalidation window (see each
// page's own `revalidate` export) rather than full static generation, and
// none has a Suspense boundary of its own, so without this the tab was just
// blank/frozen during a cache-miss request. One generic skeleton rather than
// a bespoke one per route:
// most pages share the same PageShell(title+lede) -> card-grid shape, and a
// close-enough placeholder beats the maintenance cost of five near-identical
// ones.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-8 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-4 w-full max-w-2xl rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-1/2 max-w-xl rounded bg-zinc-200 dark:bg-zinc-800" />

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
