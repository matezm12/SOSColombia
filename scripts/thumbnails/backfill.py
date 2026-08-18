"""
Fills SocialPost.oembedHtml for Instagram posts with a real thumbnail,
scraped directly from each post's public page via Scrapling's stealth
browser. Exists because Meta's own oEmbed API requires App Review we don't
have yet, and Instagram throttles the old anonymous embed.js widget under
real traffic (see web/src/components/data/SocialEmbed.tsx's header comment
for the full history).

A plain HTTP fetch of an Instagram post page gets a generic, unhydrated
shell (Instagram gates real content behind a JS-executing browser) --
confirmed live that Scrapling's StealthyFetcher gets past that and returns
the real og:image/og:title. Discovery/search pages (hashtags, explore) hit
a hard login wall even through Scrapling -- also confirmed live -- so this
only handles posts we already have a permalink for, not finding new ones.

Writes into oembedHtml as {"thumbnail_url": ..., "title": ..., "alt": ...} --
the shape SocialEmbed.tsx's parseCachedThumbnail() renders as a static photo
card.

thumbnail_url deliberately does NOT come from the og:image meta tag alone --
confirmed live that og:image is Instagram's own square link-preview CROP
(a `stp=c<x>.<y>.<w>.<h>a..._s640x640...` directive baked into the signed
CDN URL -- stripping it 403s, the crop can't be undone after the fact). The
real, uncropped photo sits elsewhere in the same rendered page as a normal
<img>, sharing the exact same underlying filename as the og:image (same CDN
path, different query/crop params) -- found by matching on that shared path
and preferring whichever copy has no forced crop/size suffix. alt comes from
that same <img>'s alt attribute (Instagram's own, often AI-generated --
still better than the multi-paragraph caption we'd otherwise have to use).

Two ways this runs, same script both times:
  - Manually, once, for the historical backlog of existing posts.
  - Daily via .github/workflows/thumbnails.yml, for whatever's new since
    the last run (community posts approved on Vercel, where Python/a
    browser aren't available, so they can't be scraped at approval time).

Idempotent: only touches rows where oembedHtml IS NULL, so safe to re-run
or run on a schedule without re-fetching (and re-costing time on) posts
that are already cached.

Usage: DATABASE_URL=... python scripts/thumbnails/backfill.py
"""

import os
import re
import sys
import json
import time
from urllib.parse import urlparse

import psycopg2
from scrapling import StealthyFetcher

FETCH_TIMEOUT_MS = 90_000
# Purely to avoid hammering Instagram in a tight loop -- there's no known
# hard rate limit on this path (unlike Meta's oEmbed API), this is just
# being a reasonable citizen between requests.
DELAY_BETWEEN_POSTS_S = 2

# Marks a CDN copy as a forced-crop/forced-size variant (Instagram's link-
# preview square, a profile-pic thumb, a related-post grid tile) rather than
# the real photo. `stp=c<x>.<y>.<w>.<h>a` is the crop rectangle specifically;
# `s<N>x<N>` is a forced square resize used by both the preview crop and
# unrelated grid thumbnails.
_CROPPED_VARIANT_RE = re.compile(r"stp=c\d|s\d+x\d+")


def _cdn_path(url: str) -> str:
    return urlparse(url).path


def scrape_thumbnail(permalink: str) -> str | None:
    page = StealthyFetcher.fetch(
        permalink, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False
    )

    # Deliberately NOT the `::attr(content)` pseudo-selector form -- confirmed
    # live it silently returns raw Selector objects instead of strings for
    # most posts when StealthyFetcher.fetch() is called repeatedly in a loop
    # within one process (fine in a single one-off call, broke ~154/154 times
    # in the real backfill run). `.attrib.get()` on the element itself is the
    # form already proven reliable across a loop.
    og_image_tags = page.css('meta[property="og:image"]')
    if not og_image_tags:
        return None
    cropped_url = og_image_tags[0].attrib.get("content")
    if not cropped_url:
        return None

    og_title_tags = page.css('meta[property="og:title"]')
    title = og_title_tags[0].attrib.get("content") if og_title_tags else None

    # Look for the same underlying image (identical CDN path, i.e. same
    # filename) rendered elsewhere on the page without the forced crop --
    # that's the actual full photo Instagram itself displays for this post.
    # Falls back to the cropped og:image (still better than nothing) for
    # video/reel posts and anything else where no such copy exists.
    thumbnail_url = cropped_url
    alt = None
    target_path = _cdn_path(cropped_url)
    for img in page.css("img"):
        src = img.attrib.get("src", "")
        if src and _cdn_path(src) == target_path and not _CROPPED_VARIANT_RE.search(src):
            thumbnail_url = src
            alt = img.attrib.get("alt")
            break

    return json.dumps({
        "thumbnail_url": str(thumbnail_url),
        "title": str(title) if title else None,
        "alt": str(alt) if alt else None,
    })


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)

    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute(
        'SELECT id, permalink FROM "SocialPost" WHERE platform = %s AND "oembedHtml" IS NULL',
        ("INSTAGRAM",),
    )
    rows = cur.fetchall()
    print(f"{len(rows)} Instagram post(s) missing a cached thumbnail.")

    cached = 0
    for post_id, permalink in rows:
        try:
            data = scrape_thumbnail(permalink)
        except Exception as err:  # a single bad post shouldn't kill the whole run
            print(f"  skip {permalink}: {err}")
            time.sleep(DELAY_BETWEEN_POSTS_S)
            continue

        if not data:
            print(f"  skip {permalink}: no og:image found")
            time.sleep(DELAY_BETWEEN_POSTS_S)
            continue

        cur.execute('UPDATE "SocialPost" SET "oembedHtml" = %s WHERE id = %s', (data, post_id))
        conn.commit()
        cached += 1
        print(f"  cached {permalink}")
        time.sleep(DELAY_BETWEEN_POSTS_S)

    print(f"Done -- cached {cached}/{len(rows)}.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
