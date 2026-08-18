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

Writes into oembedHtml as {"thumbnail_url": ..., "title": ...} -- the exact
shape SocialEmbed.tsx's parseCachedOembed() already renders as a static
photo card, so no frontend change is needed when this fills a row in.

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
import sys
import json
import time

import psycopg2
from scrapling import StealthyFetcher

FETCH_TIMEOUT_MS = 90_000
# Purely to avoid hammering Instagram in a tight loop -- there's no known
# hard rate limit on this path (unlike Meta's oEmbed API), this is just
# being a reasonable citizen between requests.
DELAY_BETWEEN_POSTS_S = 2


def scrape_thumbnail(permalink: str) -> str | None:
    page = StealthyFetcher.fetch(
        permalink, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False
    )

    images = page.css('meta[property="og:image"]::attr(content)')
    if not images:
        return None
    thumbnail_url = images[0]

    titles = page.css('meta[property="og:title"]::attr(content)')
    title = titles[0] if titles else None

    return json.dumps({"thumbnail_url": thumbnail_url, "title": title})


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
