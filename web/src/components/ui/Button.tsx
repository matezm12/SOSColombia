import { Link } from "@/i18n/navigation";

// Centralizes what was previously the same button string, hand-copied with
// four slightly different spellings across 17 call sites (px-4 py-2, px-4
// py-2.5, px-3 py-1.5, plus the rounded-full filter-chip shape).
//
// `primary` (brand red) is deliberately opt-in, not the default. The design
// research is explicit that every humanitarian org studied uses its one
// accent scarcely, on real CTAs, not on every filled button. So most of the
// 17 sites keep the original black/white "neutral" look, and only the
// homepage's actual "Buscar ayuda" CTA passes variant="primary".
type ButtonVariant = "primary" | "secondary" | "neutral";
type ButtonSize = "sm" | "md";

const BASE = "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap";

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary:
    "border border-zinc-200 text-black hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900",
  neutral: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
};

type CommonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type LinkButtonProps = CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className"> & { href: string };

type NativeButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };

export function Button({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: LinkButtonProps | NativeButtonProps) {
  const classes = `${BASE} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`;

  if (props.href) {
    const { href, ...linkProps } = props as LinkButtonProps;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as NativeButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

// For the rare case that needs the button look on next/link's plain `Link`
// rather than the locale-aware one above. Admin routes aren't under
// `[locale]`, so `@/i18n/navigation`'s Link (which resolves through the
// routing config) isn't the right tool there.
export function buttonClass(variant: ButtonVariant = "neutral", size: ButtonSize = "md", className = ""): string {
  return `${BASE} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`;
}

// Filter/toggle pills (ayuda kind filter, community feed, admin live-posts
// list, international campaign filters) aren't CTAs. They stay black/white
// rather than brand red, same as before. This just gives the five repeated
// ternaries one source instead of five.
export function chipClass(active: boolean): string {
  return active
    ? "bg-black text-white dark:bg-white dark:text-black"
    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700";
}
