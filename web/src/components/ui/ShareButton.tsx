"use client";

import { useState } from "react";
import { ShareIcon, CheckIcon } from "./icons";

// Small top-right corner button on cards that don't have their own page —
// campaigns/resources are list items on /donar/internacional and /recursos,
// not separate routes, so "share this one" means a deep link to its anchor
// on the page it lives on, not a URL of its own.
export function ShareButton({ anchorId, label }: { anchorId: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title: label });
        return;
      } catch {
        // User cancelled the native share sheet, or the browser rejected it
        // (e.g. no permission) — fall through to the clipboard-copy path
        // rather than leaving the click with no visible result.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — nothing
      // useful to do beyond not crashing; the share icon just stays put.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Enlace copiado" : "Compartir"}
      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm backdrop-blur hover:bg-white hover:text-black dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <ShareIcon className="h-3.5 w-3.5" />}
    </button>
  );
}
