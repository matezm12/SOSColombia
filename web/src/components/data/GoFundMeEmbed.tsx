"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
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
  }, [url, size]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800"
    />
  );
}
