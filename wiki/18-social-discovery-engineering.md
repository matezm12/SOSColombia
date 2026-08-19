# Social Discovery Engineering — Automated, Anonymous Pipeline Research (2026-08-18)

Distinct from `wiki/15-social-media-methodology.md`, which documents Stage-1 **manual** research using the user's own logged-in sessions via browser automation. This file documents a Stage-2 engineering research pass: can an **unattended, anonymous** (not logged in) automated job discover and enrich social posts, for a future cron job feeding the existing `PendingAidPoint`/`PendingSocialPost` moderation queue — the same "detect, never silently auto-write" discipline as the other 4 cron jobs (see `10-app-architecture.md`).

**Status: research only. Nothing here is built into the live app yet.** All findings below were verified live via Scrapling (Python, stealth/Patchright-based browser — same tool the live thumbnail pipeline already uses, `scripts/thumbnails/backfill.py`) against real, current platform responses, not assumed from documentation. Every endpoint/technique below was actually called and its real response inspected, with one exception noted explicitly (the general "non-social discovery layer" design, which is proposed but untested).

## Why this matters

The existing 4 cron jobs' tier-3 mechanism (`gov-news-check`) only polls a hand-maintained list of ~8 city press pages (5 actually work). Community submissions require someone to already know about a place. Neither scales past what's manually curated. This research asks: can the same "detect → stage in moderation queue → human confirms" pattern extend to social platforms, where a lot of real aid-point/need information actually gets posted first?

## Non-social discovery layer (proposed, not yet tested)

A separate, lower-risk idea, not covered by the live probes below: a new cron job sweeping Google News RSS (`news.google.com/rss/search?q=<keyword>+<city>`, free/keyless/structured) per tracked city × keyword, plus generalizing `aggregator-check`'s hardcoded single site into a config-driven list of aggregator adapters. New URLs found would land as `Source` rows (`status: NEEDS_RECHECK`) for one-time human tier classification before being trusted at the same cadence as a real tier-2/3 source.

## Social platform findings — confirmed live, per platform

### TikTok — both discovery and enrichment work well

- **Discovery**: `tiktok.com/tag/<hashtag>` loads with no login wall (200, no redirect). The real paginated video-list API (`api/challenge/item_list`, `count=30`, cursor-paginated) fires successfully — confirmed by real subsequent video file (`mime_type=video_mp4`) fetches. Reading its JSON response body directly via Scrapling's `capture_xhr` failed (Chrome/CDP evicts the response body from its buffer before Playwright can read it — a Scrapling 0.4.14 limitation, not a TikTok block; narrowing the regex filter didn't help). **Working approach: skip XHR capture, just `wait=9000` and read the final rendered DOM** — same "grab what's rendered" pattern the thumbnail pipeline already uses for Instagram permalinks. Pulled **55 real video URLs** from real accounts (CNN, CBS News, several Colombian local/news accounts) for `#terremotocolombia` in one sweep.
- **Enrichment**: an individual video page (`tiktok.com/@user/video/<id>`) embeds a full `__UNIVERSAL_DATA_FOR_REHYDRATION__` JSON blob containing a `webapp.video-detail` scope with everything: full `desc` (caption), `createTime`, `author.verified`, full `stats`/`statsV2` (diggCount, shareCount, commentCount, playCount, collectCount), and structured `challenges`/`textExtra` (real hashtag objects with IDs and titles). No DOM regex needed for this step — one clean JSON parse.
- **yt-dlp for TikTok enrichment**: tested against two real, freshly-discovered TikTok URLs — failed both times ("Unexpected response from webpage request"), already on yt-dlp's latest release (2026.07.04) at test time. A live, current break in yt-dlp's TikTok extractor, not a stale-version issue. Use the video-page hydration-blob approach above instead; it's better data anyway (structured hashtags, verified flag).

### Instagram — hashtag/search permanently walled, but profile + location pages are not

Confirmed pattern, precise at both the HTML-page and the underlying API level (tested each with real requests, not assumed):

| Surface | Page (browser nav) | Internal JSON API |
|---|---|---|
| Profile (`instagram.com/<user>/`) | not walled | `api/v1/users/web_profile_info/?username=<user>` — **works, full data** |
| Hashtag (`explore/tags/<tag>/`) | hard 302→login | `api/v1/tags/web_info/?tag_name=<tag>` — 302→login, confirmed for 3 different tags |
| Location (`explore/locations/<id>/<slug>/`) | **not walled** | `api/v1/locations/web_info/?location_id=<id>` — 302→login |
| Places search (`api/v1/fbsearch/places/?query=<q>`) | — | 302→login |

- **`web_profile_info`** (requires header `x-ig-app-id: 936619743392459` + a browser-shaped request — plain Python `requests`/`httpx` get TLS-fingerprinted and blocked per current community write-ups, a real browser via Scrapling isn't) returns a full profile + last 12 posts: real captions, `taken_at_timestamp`, `edge_liked_by`/`edge_media_to_comment` counts, **`location` object** (name + numeric `id`, e.g. `{id: "532059080", name: "Pereira Risaralda", slug: "pereira-risaralda"}`), and bio links (verified live against `globalshaperspereira`: real Google-Form donation link in bio, 716 total posts, 4156 followers). Response body arrives wrapped in `<html><body><p>{...}</p></body></html>` — strip that shell before `json.loads`.
- **Location explore pages work if you have a real location ID** — the API lookup for a location is walled the same as hashtags, and there's no anonymous way to *search* for a city's location ID (`fbsearch/places` is walled too). But the location **page** itself isn't walled, and a real ID can be harvested opportunistically from any already-known post's `location` field (see above). Verified: fetching `explore/locations/532059080/pereira-risaralda/` (using the ID pulled from a real Global Shapers Pereira post, not a guess) returned **15 real posts genuinely geotagged in Pereira**, no login wall — genuine open discovery of accounts you don't already follow, unlike profile polling.
- **Hashtag search is a confirmed, permanent dead end** — walled at both the page and the API level, 3-for-3 tags tested. Not worth revisiting.
- **DuckDuckGo HTML search as a bypass**: `html.duckduckgo.com/html/?q=site%3Ainstagram.com+<keywords>` returns real Instagram post/reel URLs (wrapped in a `duckduckgo.com/l/?uddg=<url-encoded target>` redirect — decode that param to get the real URL). Verified: 4 distinct real posts for "terremoto Colombia". Bing tried too (loaded clean, no block, but zero results for the same query — inconclusive, not a wall). Google hard-blocked immediately (429 → `google.com/sorry/`, a CAPTCHA gate) — not worth pursuing. This is also the community-standard workaround (see Sources below) — independent confirmation this isn't a missed better option.
- **Community research corroboration** (websearch, 2026-08-18): Instaloader (13.1k★, actively maintained, last commit 2026-07-26) is the most-maintained open-source IG scraper; current write-ups confirm hashtag browsing is login-gated as of 2026, anonymous JSON endpoints rate-limit within *minutes* of heavy use from one IP, and a residential IP caps around ~200 req/hour. **Real operational constraint** for any future build: poll a handful of known accounts a few times a day, not dozens hourly.

### X (Twitter) — profile pages and single-tweet lookup both work

- **Discovery**: a known profile page (`x.com/<handle>`) is not walled — verified against `x.com/BBCBreaking`, 5 real recent tweet URLs extracted from the rendered DOM, no login prompt.
- **Enrichment**: `cdn.syndication.twimg.com/tweet-result?id=<tweet_id>&token=<anything>` returns full structured JSON (real `favorite_count`, `created_at`, full `text`, `user`, and `entities.urls` with **expanded URLs** — resolves `t.co` short links automatically, useful when a tweet links to a donation form). Confirmed live against a real discovered tweet. Note: the `token` param isn't actually validated — `token=a` works — a known quirk other OSS tools (e.g. `react-tweet`) already rely on.
- **Timeline syndication** (`cdn.syndication.twimg.com/timeline/profile?screen_name=<handle>`) is real (per community research) but returned empty on first test (likely a missing required param, not a block) and the sibling `syndication.twitter.com/srv/timeline-profile/...` endpoint returned a real `429 Rate limit exceeded` JSON body on test — confirms the endpoint is live, just currently throttled from this session's IP. Worth retrying later with correct params and slower pacing; not needed anyway since DOM-scraping the profile page already gives real tweet URLs.

### Facebook — confirmed walled, multiple angles, don't build against it

Tested a known public page (`facebook.com/bbcnews`) after Instagram/X both reversed my initial assumption — result held: the classic soft-wall teaser ("See more of BBC News on Facebook — Log in or create an account") is present, and only 2 stray `pfbid` post identifiers leaked through where an active news page would show dozens. Matches the original Stage-1 finding (`wiki/15-social-media-methodology.md` notes Facebook needed a *logged-in* session even for manual research). Not worth building an anonymous pipeline against.

## Key technical lessons for whoever builds this

1. **Browser-shaped requests beat raw HTTP clients** against these internal JSON endpoints — Scrapling's Patchright-based browser isn't TLS-fingerprinted the way plain Python `requests`/`httpx` are (per community research on IG specifically; consistent with why DOM-scraping and direct-endpoint-navigation both worked here without extra header/proxy tricks).
2. **`capture_xhr` in Scrapling 0.4.14 has a real body-retrieval limitation** — the CDP response buffer gets evicted before the body can be read, for both broad and narrow regex filters. Don't rely on it for reading API response bodies; navigate directly to the JSON endpoint URL instead (works, and is simpler) or read the final rendered DOM after a fixed `wait`.
3. **Every JSON response fetched by direct navigation arrives wrapped** in a minimal `<html><body><p>{...}</p></body></html>` shell (normal browser behavior for a raw API response) — strip with a `<p>(.*)</p>` regex before `json.loads`.
4. **These are all undocumented internal endpoints, not official APIs.** Real and working as of 2026-08-18, but each platform's own ecosystem write-ups note they rotate, get rate-limited, or get patched without notice (TikTok's `X-Bogus`/`X-Gnarly`/`msToken` signed params are one example of active anti-scraping investment; yt-dlp's TikTok extractor was already broken at test time). Any real build needs the DOM-scraping fallback kept alongside each JSON shortcut, not as a replacement for it.
5. **Location-ID bootstrapping must be opportunistic, not searched** — anonymous place-search is walled on Instagram; the only honest way to grow a list of real city location IDs is harvesting them from the `location` field of posts already discovered some other way (e.g. profile polling), then adding each new ID to a lookup table for direct location-page polling.

## Open / not fully resolved

- X's timeline syndication endpoint needs correct param tuning + a rate-limit-aware retry before it can replace DOM-scraping for X discovery (not blocking — DOM-scraping already works).
- No live test yet of an Instagram single-*post* JSON endpoint (the `web_profile_info` equivalent for one known permalink) — not urgent, since `yt-dlp` already enriches known Instagram permalinks well (tested live: real caption, timestamp, likes/comments, even actual comment text, on a real project post).
- Rate-limit budgets (how many accounts, how often) are not yet designed — flagged as a real constraint from community research, not yet turned into a concrete polling schedule.

## Sources (community research, 2026-08-18)

- [The 6 Best Open-Source Instagram Scrapers (GitHub, 2026)](https://scrapfly.io/blog/posts/best-open-source-instagram-scrapers)
- [InstaLoader — Bellingcat's Online Investigation Toolkit](https://bellingcat.gitbook.io/toolkit/more/all-tools/instaloader)
- [How to Scrape Instagram in 2026](https://scrapfly.io/blog/posts/how-to-scrape-instagram)
- [Instagram Profile Data Without the Meta API: Python Guide 2026](https://www.web-data-labs.com/blog/instagram-profile-scraper-python)
- [Instagram API Deprecated Again? What to Actually Do in 2026](https://sociavault.com/blog/instagram-api-deprecated-alternative-2026)
- Twitter/X syndication API background: Hacker News thread on `syndication.twitter.com/srv/timeline-profile/`, X Developer Community threads on `cdn.syndication.twimg.com/widgets/timelines/`
