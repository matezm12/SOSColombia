"use client";

import { useEffect, useRef, useState } from "react";

// GoFundMe's own official widget mechanism (an iframe at
// `{campaignUrl}/widget/{size}`, resized live via a `gfm-embed-widget-resize`
// postMessage) — but built by hand instead of loading their embed.js. That
// script only wires itself up on `DOMContentLoaded`, which has always
// already fired by the time a Next.js page hydrates and injects it, so it
// silently never runs. Reimplemented the same public mechanism (confirmed
// by reading the script's source) driven by a mount effect instead, which
// doesn't have that race.
const WIDGET_HEIGHT: Record<"small" | "medium" | "large", number> = {
  small: 70,
  medium: 200,
  large: 500,
};

export function GoFundMeEmbed({
  url,
  size = "medium",
}: {
  url: string;
  size?: "small" | "medium" | "large";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  // Lazy-gate on scroll position first: this iframe is a real cross-origin
  // GoFundMe widget, not a lightweight embed, and pages with several
  // campaigns (/ciudad/[divipola]) were mounting 5+ of these unconditionally
  // on load regardless of viewport position (confirmed via Lighthouse:
  // 5MB+ page weight, 0.81 performance score, driven almost entirely by
  // this). rootMargin gives it a head start so it's ready by the time a
  // user actually scrolls to it, without loading everything up front.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const container = containerRef.current;
    if (!container) return;

    const parsed = new URL(`${url}/widget/${size}`);
    parsed.searchParams.set("utm_content", window.location.hostname);
    parsed.searchParams.set("utm_medium", "referral");
    parsed.searchParams.set("utm_source", "widget");

    const iframe = document.createElement("iframe");
    iframe.className = "gfm-embed-iframe";
    iframe.width = "100%";
    iframe.height = String(WIDGET_HEIGHT[size]);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.src = `${parsed}#:~:tcm-regime=GDPR&tcm-prompt=Hidden`;
    container.appendChild(iframe);

    function onResize(event: MessageEvent) {
      if (
        event.source === iframe.contentWindow &&
        event.data?.type === "gfm-embed-widget-resize" &&
        typeof event.data.offsetHeight === "number"
      ) {
        iframe.height = String(event.data.offsetHeight);
      }
    }
    window.addEventListener("message", onResize);

    return () => {
      window.removeEventListener("message", onResize);
      container.removeChild(iframe);
    };
  }, [url, size, visible]);

  return (
    <div
      ref={containerRef}
      // p-1 insets the iframe from the rounded border so its square corners
      // don't visibly poke out, and stops the white widget from running
      // edge-to-edge inside a near-black dark-mode card. overflow-x-auto
      // (not overflow-hidden) is deliberate — it's the safety net for
      // phones narrower than the widget's fixed ~300px width.
      className="overflow-x-auto rounded-lg border border-zinc-200 p-1 dark:border-zinc-700"
    />
  );
}
