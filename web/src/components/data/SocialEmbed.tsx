"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLinkIcon } from "../ui/icons";

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
    tiktokEmbed?: { lib?: { render?: () => void } };
  }
}

const SCRIPTS: Record<string, string> = {
  INSTAGRAM: "https://www.instagram.com/embed.js",
  X: "https://platform.twitter.com/widgets.js",
  TIKTOK: "https://www.tiktok.com/embed.js",
};

// How long we wait for a widget script to load AND for it to actually turn
// our placeholder blockquote into a real embed before giving up. Widget
// scripts are commonly blocked outright by ad blockers/privacy extensions
// (platform.twitter.com/widgets.js especially) — without this, a blocked
// script left the old version hanging forever on an empty box.
const EMBED_TIMEOUT_MS = 8000;

// Module-level cache, one promise per script src, shared by every SocialEmbed
// instance on the page. The previous version detected an in-flight script via
// a DOM query + 'load' listener, which had a real race: two instances
// mounting before the first script tag committed to the DOM could each
// insert their own duplicate <script>. A plain in-memory cache is both
// simpler and removes the race entirely.
const scriptPromises = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const cached = scriptPromises.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${src}`)),
      { once: true },
    );
    document.body.appendChild(script);
  });
  // A failed load shouldn't poison every future mount — let the next
  // instance retry instead of caching a permanently-rejected promise.
  promise.catch(() => scriptPromises.delete(src));
  scriptPromises.set(src, promise);
  return promise;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// Instagram/X/TikTok's process functions all re-scan the WHOLE document for
// unprocessed blockquotes, not just the one that just mounted — so when a
// page has many embeds of the same platform (comunidad's feed, a busy city
// page), every instance calling process() independently the moment it mounts
// fires off a burst of redundant, near-simultaneous calls. That burst is a
// real, observed contributor to Instagram's anonymous-embed rate limiting
// hitting mid-session. Collapse same-platform requests arriving within one
// tick into a single trailing call instead.
const pendingProcess = new Map<string, ReturnType<typeof setTimeout>>();
const PROCESS_DEBOUNCE_MS = 400;

function scheduleProcess(platform: string, run: () => void) {
  const existing = pendingProcess.get(platform);
  if (existing) clearTimeout(existing);
  pendingProcess.set(
    platform,
    setTimeout(() => {
      pendingProcess.delete(platform);
      run();
    }, PROCESS_DEBOUNCE_MS),
  );
}

type Status = "loading" | "ready" | "error";

export function SocialEmbed({
  platform,
  permalink,
  locale = "es",
}: {
  platform: "X" | "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
  permalink: string;
  locale?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [inView, setInView] = useState(false);

  // Defer starting any network/script work until the card is actually about
  // to be visible. Community/city pages can carry a dozen+ embeds on one
  // page load — loading and processing every widget immediately, including
  // ones far below the fold, is both wasted work and exactly the kind of
  // burst of anonymous requests that trips Instagram's rate limiting.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(wrapper);
    // Safety net, not the primary path: if intersection never fires for any
    // reason (an unusual browser/embedding context, observer support
    // quirks), don't leave the card stuck on a spinner forever - fall back
    // to loading it anyway after a few seconds.
    const fallback = setTimeout(() => setInView(true), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    // No explicit setStatus("loading") here — `status` already initializes
    // to "loading", and each instance is mounted once per post (keyed by
    // post.id upstream), so platform/permalink never actually change under
    // an already-mounted instance in this codebase's usage.

    async function render() {
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";

      if (platform === "FACEBOOK") {
        // Facebook's Page Plugin iframe is public and needs no app ID for a
        // basic post embed, unlike its oEmbed *API*. Cross-origin iframes
        // fire 'load' even when Facebook itself renders an internal error
        // page inside — we can't see through that — but 'error' plus a
        // timeout still catches the common failure mode (the iframe request
        // itself gets blocked by an extension or never returns).
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(permalink)}&show_text=true&width=500`;
        iframe.width = "100%";
        iframe.height = "600";
        iframe.style.border = "none";
        iframe.style.overflow = "hidden";
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "true");
        let settled = false;
        iframe.addEventListener(
          "load",
          () => {
            settled = true;
            if (!cancelled) setStatus("ready");
          },
          { once: true },
        );
        iframe.addEventListener(
          "error",
          () => {
            settled = true;
            if (!cancelled) setStatus("error");
          },
          { once: true },
        );
        container.appendChild(iframe);
        pollTimer = setTimeout(() => {
          if (!settled && !cancelled) setStatus("error");
        }, EMBED_TIMEOUT_MS);
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
        // TikTok's embed.js resolves the video via data-video-id — confirmed against
        // TikTok's own oembed endpoint (tiktok.com/oembed?url=...), whose returned HTML
        // always sets this plus an author-link <a> inside <section>. Without
        // data-video-id specifically, the widget renders "video unavailable" — the
        // cite attribute alone isn't enough for it to resolve which video to load.
        const match = permalink.match(/tiktok\.com\/(@[\w.-]+)\/video\/(\d+)/);
        const section = document.createElement("section");
        if (match) {
          const [, handle, videoId] = match;
          blockquote.setAttribute("data-video-id", videoId);
          const a = document.createElement("a");
          a.target = "_blank";
          a.title = handle;
          a.href = `https://www.tiktok.com/${handle}?refer=embed`;
          a.textContent = handle;
          section.appendChild(a);
        }
        blockquote.appendChild(section);
      }
      container.appendChild(blockquote);

      const scriptSrc = SCRIPTS[platform];
      if (!scriptSrc) {
        setStatus("error");
        return;
      }

      try {
        await withTimeout(loadScriptOnce(scriptSrc), EMBED_TIMEOUT_MS);
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) return;

      if (platform === "INSTAGRAM") scheduleProcess("INSTAGRAM", () => window.instgrm?.Embeds?.process?.());
      if (platform === "X") scheduleProcess("X", () => window.twttr?.widgets?.load?.());
      // Wrong assumption in an earlier version of this file: TikTok's
      // embed.js does NOT self-process blockquotes added to the DOM after
      // its own initial load — confirmed live, a fresh blockquote just sits
      // there forever (no id, no iframe) until `render()` is called
      // explicitly. It only auto-scans once, at script-load time, same
      // category of thing as Instagram/X needing an explicit process call.
      if (platform === "TIKTOK") scheduleProcess("TIKTOK", () => window.tiktokEmbed?.lib?.render?.());

      // None of the three scripts expose a "this specific blockquote is
      // done" callback — they rewrite the DOM asynchronously on their own
      // schedule, and "an iframe exists" isn't enough of a signal on its
      // own: confirmed live that Instagram still creates the iframe for a
      // permalink it can't actually embed (e.g. embedding disabled on that
      // post) — the iframe points at Instagram's own "Sorry, this page
      // isn't available" error page and never grows past ~2px tall. A
      // successful embed always gets an explicit non-trivial height set on
      // it (checked against a real render: ~600-750px). Require both the
      // iframe and real height, not just presence.
      const isRendered = () => {
        const current = containerRef.current;
        if (!current) return false;
        if (platform === "INSTAGRAM") {
          if (current.querySelector("blockquote")?.getAttribute("data-instgrm-rendered") === "true") return true;
          const iframe = current.querySelector('iframe[src*="instagram.com"]');
          return !!iframe && iframe.getBoundingClientRect().height > 50;
        }
        if (platform === "X") {
          return !!current.querySelector('iframe[id^="twitter-widget"]');
        }
        // TikTok gives no equivalent rendered-flag; fall back to iframe presence.
        return !!current.querySelector("iframe");
      };

      // Instagram's own resize step (what isRendered() waits on) has been
      // observed taking meaningfully longer than the other two platforms'
      // — confirmed live, the exact same permalink rendered fine on one
      // load and still hadn't resized by 8s on another. Give it more room
      // before giving up; X/TikTok stay on the tighter budget. The
      // PROCESS_DEBOUNCE_MS delay before process() even fires is on top of
      // this, so the deadline is measured from here, not from mount.
      const pollTimeoutMs = platform === "INSTAGRAM" ? 20000 : EMBED_TIMEOUT_MS;
      const deadline = Date.now() + PROCESS_DEBOUNCE_MS + pollTimeoutMs;
      const poll = () => {
        if (cancelled) return;
        if (isRendered()) {
          setStatus("ready");
          return;
        }
        if (Date.now() > deadline) {
          setStatus("error");
          return;
        }
        pollTimer = setTimeout(poll, 300);
      };
      poll();
    }

    render();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [inView, platform, permalink]);

  return (
    <div ref={wrapperRef} className="min-h-[120px]">
      {status === "loading" && (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      )}
      {status === "error" && (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {locale === "en" ? "This post couldn't be loaded here." : "No se pudo cargar esta publicación aquí."}
          </p>
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:decoration-blue-400"
          >
            {locale === "en" ? "View original" : "Ver publicación original"}
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>
      )}
      <div
        ref={containerRef}
        className={
          status === "ready"
            ? "overflow-x-auto rounded-lg border border-zinc-200 p-1 dark:border-zinc-700"
            : "hidden"
        }
      />
    </div>
  );
}
