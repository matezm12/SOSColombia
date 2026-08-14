"use client";

import { useEffect, useRef } from "react";

// Renders a public social post from just its permalink, no API keys/tokens —
// same reasoning as GoFundMeEmbed.tsx: use each platform's own public
// client-side widget script instead of a server-side oEmbed call. This
// matters specifically for Instagram/Facebook, where Meta's oEmbed *API*
// requires an app-review access token, but the public embed.js/plugin
// mechanism works for any public post with zero auth.
declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
  }
}

const SCRIPTS: Record<string, string> = {
  INSTAGRAM: "https://www.instagram.com/embed.js",
  X: "https://platform.twitter.com/widgets.js",
  TIKTOK: "https://www.tiktok.com/embed.js",
};

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      if (existing.getAttribute("data-loaded") === "true") resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    });
    document.body.appendChild(script);
  });
}

export function SocialEmbed({
  platform,
  permalink,
}: {
  platform: "X" | "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
  permalink: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    async function render() {
      if (!container) return;
      container.innerHTML = "";

      if (platform === "FACEBOOK") {
        // Facebook's Page Plugin iframe is public and needs no app ID for a
        // basic post embed, unlike its oEmbed *API*.
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(permalink)}&show_text=true&width=500`;
        iframe.width = "100%";
        iframe.height = "600";
        iframe.style.border = "none";
        iframe.style.overflow = "hidden";
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "true");
        container.appendChild(iframe);
        return;
      }

      const blockquote = document.createElement("blockquote");
      if (platform === "INSTAGRAM") {
        blockquote.className = "instagram-media";
        blockquote.setAttribute("data-instgrm-permalink", permalink);
        blockquote.setAttribute("data-instgrm-version", "14");
      } else if (platform === "X") {
        blockquote.className = "twitter-tweet";
        const a = document.createElement("a");
        a.href = permalink;
        blockquote.appendChild(a);
      } else if (platform === "TIKTOK") {
        blockquote.className = "tiktok-embed";
        blockquote.setAttribute("cite", permalink);
        const section = document.createElement("section");
        blockquote.appendChild(section);
      }
      container.appendChild(blockquote);

      const scriptSrc = SCRIPTS[platform];
      if (!scriptSrc) return;
      await loadScriptOnce(scriptSrc);
      if (cancelled) return;

      if (platform === "INSTAGRAM") window.instgrm?.Embeds?.process?.();
      if (platform === "X") window.twttr?.widgets?.load?.(container);
      // TikTok's embed.js self-processes any .tiktok-embed blockquote already
      // in the DOM on load/mutation — no explicit process call needed.
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [platform, permalink]);

  return (
    <div
      ref={containerRef}
      className="min-h-[120px] overflow-x-auto rounded-lg border border-zinc-200 p-1 dark:border-zinc-700"
    />
  );
}
