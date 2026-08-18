/**
 * Small hand-rolled icon set — same stroke-based SVG convention already
 * established in ThemeToggle.tsx (no icon-library dependency for three
 * icons). Replaces bare Unicode glyphs (←, ↗, ×) that stood alone as the
 * entire meaning of an element — a different case from a "→" suffixed onto
 * translated button/link text, which is left as-is (splitting that out
 * would mean restructuring every affected translation string for a purely
 * cosmetic change).
 */
function iconProps(className: string) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Extracted from SiteFooter.tsx's inline markup (same SVG, now shared with
// SocialEmbed's Instagram source badge) rather than duplicated a second time.
export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
