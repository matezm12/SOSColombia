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
