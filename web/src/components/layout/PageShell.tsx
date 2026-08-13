import Link from "next/link";

const WIDTH_CLASS: Record<"narrow" | "default" | "wide", string> = {
  narrow: "max-w-xl",
  default: "max-w-4xl",
  wide: "max-w-5xl",
};

export function PageShell({
  width = "default",
  eyebrow,
  title,
  lede,
  backHref,
  backLabel = "Volver",
  children,
}: {
  width?: "narrow" | "default" | "wide";
  eyebrow?: string;
  title?: string;
  lede?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className={`mx-auto w-full ${WIDTH_CLASS[width]} flex-1 px-6 py-16`}>
        {backHref && (
          <Link
            href={backHref}
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ← {backLabel}
          </Link>
        )}
        {(eyebrow || title || lede) && (
          <div className={backHref ? "mt-2" : undefined}>
            {eyebrow && (
              <p className="text-sm font-medium uppercase tracking-wide text-brand">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                {title}
              </h1>
            )}
            {lede && (
              <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">{lede}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
