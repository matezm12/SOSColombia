// The fix for "cards have no outbound links" — one component, used everywhere
// a card needs to point at its source/permalink/donation page.

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400 ${className}`}
    >
      {children}
      <span aria-hidden="true" className="text-[0.7em]">
        ↗
      </span>
    </a>
  );
}
