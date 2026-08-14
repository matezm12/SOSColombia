/** The small-caps `<h3>` used for a subgroup within a section (e.g. an aid-point kind, a metric name). Same rationale as SectionHeading. */
export function SubsectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </h3>
  );
}
