// The fix for "cards have no outbound links" — one component, used everywhere
// a card needs to point at its source/permalink/donation page.

import { ExternalLinkIcon } from "@/components/ui/icons";

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
      className={`inline-flex items-center gap-1 text-link underline decoration-link/30 underline-offset-2 hover:decoration-link ${className}`}
    >
      {children}
      <ExternalLinkIcon className="h-3 w-3" />
    </a>
  );
}
