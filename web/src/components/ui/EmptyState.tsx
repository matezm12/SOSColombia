/**
 * For "genuinely nothing published yet" states — deliberately worded to never
 * read as a confident zero. See wiki/10-app-architecture.md's append-only
 * discipline: an empty field means "not yet published," not "the value is 0."
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500 dark:text-zinc-500">{children}</p>;
}
