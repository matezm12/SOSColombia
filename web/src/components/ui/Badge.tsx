// Full literal class strings per (variant, value) pair — written out rather than
// built via template interpolation so Tailwind's build-time scanner can see them.

const SEVERITY_CLASS: Record<string, string> = {
  CRITICA: "bg-severity-critica/10 text-severity-critica",
  ALTA: "bg-severity-alta/10 text-severity-alta",
  MODERADA: "bg-severity-moderada/10 text-severity-moderada",
  LEVE: "bg-severity-leve/10 text-severity-leve",
};

const TIER_CLASS: Record<number, string> = {
  1: "bg-tier-1/10 text-tier-1",
  2: "bg-tier-2/10 text-tier-2",
  3: "bg-tier-3/10 text-tier-3",
  4: "bg-tier-4/10 text-tier-4",
  5: "bg-tier-5/10 text-tier-5",
  6: "bg-tier-6/10 text-tier-6",
};

const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-status-active/10 text-status-active",
  FULL: "bg-status-full/10 text-status-full",
  CLOSED: "bg-status-closed/10 text-status-closed",
  UNCONFIRMED: "bg-status-unconfirmed/10 text-status-unconfirmed",
};

const VERIFY_CLASS: Record<string, string> = {
  VERIFIED: "bg-verify-verified/10 text-verify-verified",
  PLAUSIBLE: "bg-verify-plausible/10 text-verify-plausible",
  UNCONFIRMED: "bg-verify-unconfirmed/10 text-verify-unconfirmed",
  FLAGGED_SCAM: "bg-verify-flagged/10 text-verify-flagged",
};

const CONTRADICTION_CLASS: Record<string, string> = {
  OPEN: "bg-contradiction-open/10 text-contradiction-open",
  RESOLVED: "bg-contradiction-resolved/10 text-contradiction-resolved",
};

const NEUTRAL_CLASS = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

export type BadgeVariant =
  | "severity"
  | "tier"
  | "status"
  | "verification"
  | "contradiction"
  | "neutral";

function classFor(variant: BadgeVariant, value: string | number | undefined): string {
  switch (variant) {
    case "severity":
      return (typeof value === "string" && SEVERITY_CLASS[value]) || NEUTRAL_CLASS;
    case "tier":
      return (typeof value === "number" && TIER_CLASS[value]) || NEUTRAL_CLASS;
    case "status":
      return (typeof value === "string" && STATUS_CLASS[value]) || NEUTRAL_CLASS;
    case "verification":
      return (typeof value === "string" && VERIFY_CLASS[value]) || NEUTRAL_CLASS;
    case "contradiction":
      return (typeof value === "string" && CONTRADICTION_CLASS[value]) || NEUTRAL_CLASS;
    default:
      return NEUTRAL_CLASS;
  }
}

export function Badge({
  variant = "neutral",
  value,
  children,
}: {
  variant?: BadgeVariant;
  value?: string | number;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md px-2 py-1 text-center text-xs font-medium leading-snug ${classFor(variant, value)}`}
    >
      {children}
    </span>
  );
}
