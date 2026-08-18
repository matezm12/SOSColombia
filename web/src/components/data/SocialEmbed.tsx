"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLinkIcon, InstagramIcon } from "../ui/icons";

// Renders a public social post from just its permalink, no API keys/tokens —
// same reasoning as GoFundMeEmbed.tsx: use each platform's own public
// client-side widget script instead of a server-side oEmbed call, for
// X/TikTok/Facebook. Instagram is the exception (see `cachedOembed` below):
// its anonymous embed.js widget throttles hard under real traffic (confirmed
// live — the exact bug that started this design), and neither Meta's own
// oEmbed API (gated behind App Review we don't have) nor a third-party
// wrapper (Iframely — confirmed live it just re-wraps the same throttled
// embed.js under the hood) gets around that. So Instagram never attempts a
// live client-side embed at all anymore: it renders a pre-scraped thumbnail
// snapshot (see scripts/thumbnails/backfill.py, which scrapes each post's
// public og:image/og:title once and caches it — daily via
// .github/workflows/thumbnails.yml) or, until that catches a new post, a
// plain "View original" link. See `cachedOembed` below.
declare global {
  interface Window {
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
    tiktokEmbed?: { lib?: { render?: () => void } };
  }
}

const SCRIPTS: Record<string, string> = {
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

// X/TikTok's process functions both re-scan the WHOLE document for
// unprocessed blockquotes, not just the one that just mounted — so when a
// page has many embeds of the same platform, every instance calling
// process() independently the moment it mounts fires off a burst of
// redundant, near-simultaneous calls. Collapse same-platform requests
// arriving within one tick into a single trailing call instead.
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

// Shape we store in SocialPost.oembedHtml for Instagram posts: raw
// {thumbnail_url, title, alt} scraped by scripts/thumbnails/backfill.py,
// stringified as-is rather than picked apart into separate columns — it's a
// snapshot of scraped data, not modeled data, so there's nothing to normalize.
function parseCachedThumbnail(
  raw: string | null | undefined,
): { thumbnailUrl: string; title?: string; alt?: string } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (typeof data.thumbnail_url !== "string") return null;
    return {
      thumbnailUrl: data.thumbnail_url,
      title: typeof data.title === "string" ? data.title : undefined,
      alt: typeof data.alt === "string" ? data.alt : undefined,
    };
  } catch {
    return null;
  }
}

// Instagram's og:title is always `{author} on Instagram: "{caption}"` for a
// real post — split apart to actually display, instead of leaving it as
// inert alt text on the image (which it still is, as a fallback, when this
// doesn't match — profile-link "posts" like /somehandle/ have a different
// title shape with no caption to extract).
function splitAuthorCaption(title: string | undefined): { author?: string; caption?: string } {
  if (!title) return {};
  const match = title.match(/^(.*?) on Instagram: "([\s\S]*)"$/);
  if (!match) return {};
  return { author: match[1], caption: match[2] };
}

export function SocialEmbed({
  platform,
  permalink,
  locale = "es",
  cachedOembed,
}: {
  platform: "X" | "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
  permalink: string;
  locale?: string;
  // Scraped thumbnail snapshot (Instagram only — see parseCachedThumbnail).
  // Instagram never attempts a live client-side embed regardless of whether
  // this is set — see the file header comment for why. When set, renders a
  // static photo card; when not (not yet scraped), renders the same "View
  // original" link the error state below shows, immediately, no attempt.
  cachedOembed?: string | null;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [inView, setInView] = useState(false);
  const thumbnail = platform === "INSTAGRAM" ? parseCachedThumbnail(cachedOembed) : null;

  // Defer starting any network/script work until the card is actually about
  // to be visible. Community/city pages can carry a dozen+ embeds on one
  // page load — loading and processing every widget immediately, including
  // ones far below the fold, is wasted work for anything off-screen.
  useEffect(() => {
    if (platform === "INSTAGRAM") return;
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
    // platform is stable for the lifetime of a mounted instance (see the
    // second effect's comment) — listed for lint correctness, not because
    // it's expected to change and re-run this.
  }, [platform]);

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
      if (platform === "X") {
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

      if (platform === "X") scheduleProcess("X", () => window.twttr?.widgets?.load?.());
      // Wrong assumption in an earlier version of this file: TikTok's
      // embed.js does NOT self-process blockquotes added to the DOM after
      // its own initial load — confirmed live, a fresh blockquote just sits
      // there forever (no id, no iframe) until `render()` is called
      // explicitly. It only auto-scans once, at script-load time, same
      // category of thing as X needing an explicit process call.
      if (platform === "TIKTOK") scheduleProcess("TIKTOK", () => window.tiktokEmbed?.lib?.render?.());

      // None of the three scripts expose a "this specific blockquote is
      // done" callback — they rewrite the DOM asynchronously on their own
      // schedule, and "an iframe exists" isn't enough of a signal on its
      // own — a successful embed always gets an explicit non-trivial height
      // set on it, so require both the iframe and real height, not just
      // presence.
      const isRendered = () => {
        const current = containerRef.current;
        if (!current) return false;
        if (platform === "X") {
          return !!current.querySelector('iframe[id^="twitter-widget"]');
        }
        // TikTok gives no equivalent rendered-flag; fall back to iframe presence.
        return !!current.querySelector("iframe");
      };

      const deadline = Date.now() + PROCESS_DEBOUNCE_MS + EMBED_TIMEOUT_MS;
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

  if (platform === "INSTAGRAM") {
    if (thumbnail) {
      const { author, caption } = splitAuthorCaption(thumbnail.title);
      return (
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700"
        >
          <div className="relative bg-zinc-100 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimizable Instagram CDN photo */}
            <img
              src={thumbnail.thumbnailUrl}
              // Instagram's own alt (often AI-generated) beats the raw
              // caption as accessibility text — that's a full paragraph in
              // the worst case, this is an actual image description. Falls
              // back to the caption/title only when Instagram supplied no
              // alt at all (seen live: video/reel posts, some profile links).
              alt={thumbnail.alt ?? caption ?? thumbnail.title ?? ""}
              className="max-h-[420px] w-full object-contain"
              loading="lazy"
            />
            {/* Source badge — with the live embed retired, nothing else on
                the card visually marks this as Instagram content anymore. */}
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <InstagramIcon className="h-4 w-4" />
            </span>
          </div>
          {(author || caption) && (
            <div className="p-3">
              {author && <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{author}</p>}
              {caption && (
                <p className="mt-1 line-clamp-6 whitespace-pre-line text-xs text-zinc-500 dark:text-zinc-500">
                  {caption}
                </p>
              )}
            </div>
          )}
        </a>
      );
    }
    // Not yet scraped — see scripts/thumbnails/backfill.py. Never attempts
    // a live embed for Instagram, so this is the immediate, only state
    // until the next daily run catches it, not a timeout/error outcome.
    return <FallbackCard permalink={permalink} locale={locale} />;
  }

  return (
    <div ref={wrapperRef} className="min-h-[120px]">
      {status === "loading" && (
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
        </div>
      )}
      {status === "error" && <FallbackCard permalink={permalink} locale={locale} />}
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

function FallbackCard({ permalink, locale }: { permalink: string; locale: string }) {
  return (
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
  );
}
