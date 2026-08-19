"""
Anonymous social-media discovery + enrichment sweep, feeding the SAME
"detect, never silently auto-write" moderation queue the 4 TypeScript cron
jobs already use (PendingAidPoint/PendingSocialPost, /admin/moderacion and
/admin/comunidad) -- nothing here ever publishes without a human clicking
approve. See wiki/18-social-discovery-engineering.md for the full live-
verified research this is built from, and the approved plan at
.claude/plans/calm-mixing-curry.md for the design rationale.

Three platforms, each with a discovery step (find candidate permalinks,
cheap) and an enrichment step (fetch full caption/stats/timestamp for a
candidate, expensive -- this is the part that actually burns rate-limit
budget, which is why dedup happens BEFORE enrichment, not after):

  TikTok -- discovery: tiktok.com/tag/<hashtag>, wait 9s, regex the
    rendered DOM for /@user/video/<id> links (Scrapling's capture_xhr
    can't reliably read this page's own JSON API response -- a confirmed
    library limitation, not a TikTok block, see the wiki doc).
    enrichment: the video page's own __UNIVERSAL_DATA_FOR_REHYDRATION__
    hydration blob (webapp.video-detail scope) -- one clean JSON parse,
    no further scraping.

  Instagram -- discovery: known-account polling via web_profile_info
    (also fully enriches those posts in the same call), known-location-page
    sweeps (permalinks only), and a DuckDuckGo site:instagram.com search
    bypass (permalinks only, since hashtag search is walled on Instagram
    itself, at both the page and API level -- confirmed dead end).
    enrichment (location/DDG-sourced candidates only, profile-sourced ones
    already have full data from discovery): yt-dlp first (confirmed working
    for known Instagram permalinks, unlike TikTok where its extractor is
    currently broken), falling back to the same og:title-parsing trick
    scripts/thumbnails/backfill.py already proved for a real gap found
    live: yt-dlp's Instagram extractor only handles video/reel posts
    ("There is no video in this post" on a plain photo post) -- a lot of
    real aid-point flyers ARE photo posts, so this fallback matters.

  X -- discovery: a known profile page's rendered DOM (x.com/<handle>).
    enrichment: cdn.syndication.twimg.com/tweet-result (the `token` query
    param isn't actually validated -- a known quirk other OSS tools rely
    on too).

  Facebook is a confirmed dead end (soft login wall even for known public
  pages) -- not attempted here.

TARGETS below is a deliberately short, hand-curated, human-reviewed list --
NOT a database table. Adding a target (an account/location worth sweeping)
is a trust decision, and that belongs in code review, not a runtime write a
human never sees before it takes effect. When a run opportunistically finds
a new location tag or handle worth considering, it goes in the summary
email as a suggestion, not an automatic addition here.

Usage: DATABASE_URL=... [RESEND_API_KEY=... CRON_ALERT_EMAIL=...] python scripts/social-discovery/discover.py
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass
from typing import Any

import psycopg2
from scrapling.fetchers import StealthyFetcher

# ── Curated targets (edit this list, don't auto-grow it -- see module docstring) ──

TARGETS = {
    # Verified live in wiki/18-social-discovery-engineering.md's research pass --
    # a real relief org actively posting aid-point/need updates.
    "instagram_profiles": ["globalshaperspereira"],
    # {id, slug} pulled from a real geotagged post (globalshaperspereira above),
    # not guessed -- Instagram has no anonymous way to search for a location id.
    "instagram_locations": [{"id": "532059080", "slug": "pereira-risaralda", "name": "Pereira Risaralda"}],
    # Verified live: 55 real video URLs from real accounts (CNN, CBS News,
    # several Colombian local/news accounts) for this exact tag.
    "tiktok_hashtags": ["terremotocolombia"],
    # No X handle has been verified as an actual, relevant, real earthquake-
    # relief account yet (the wiki's X test used @BBCBreaking purely as a
    # mechanism check) -- empty on purpose rather than guessing one. Add real
    # handles here after reviewing them, same as the two lists above.
    "x_profiles": [],
}

# Generic disaster-relief search terms, not city-specific -- DDG is the
# open-discovery mechanism, city matching happens later via scoring.
DDG_SEARCH_QUERIES = ["terremoto Colombia albergue", "terremoto Colombia centro de acopio"]

IG_APP_ID_HEADER = {"x-ig-app-id": "936619743392459", "accept": "*/*"}
FETCH_TIMEOUT_MS = 60_000

MAX_STAGED = 20
SCORE_FLOOR = 4  # out of 10 -- below this, drop the candidate, don't stage it
# Separate, tighter cap for candidates whose enrichment failed entirely
# (confirmed live: possible at real scale, e.g. Instagram degrading hard
# from some IPs) -- these carry no auto-extracted caption/score, so they're
# lower value than a real scored finding and must never crowd out the ones
# that did enrich successfully.
MAX_STAGED_UNENRICHED = 5

KEYWORD_WEIGHTS = {
    "albergue": 3,
    "refugio temporal": 3,
    "centro de acopio": 3,
    "punto de acopio": 3,
    "punto de ayuda": 2,
    "necesitamos": 2,
    "urge": 2,
    "se necesita": 2,
    "falta": 1,
}
EARTHQUAKE_CONTEXT_RE = re.compile(r"terremoto|sismo|damnificad", re.IGNORECASE)
NEED_RE = re.compile(r"necesitamos|urge|se necesita|falta", re.IGNORECASE)
AID_POINT_RE = re.compile(r"albergue|refugio temporal|acopio|punto de ayuda", re.IGNORECASE)
ALBERGUE_RE = re.compile(r"albergue|refugio temporal", re.IGNORECASE)
ACOPIO_RE = re.compile(r"acopio|punto de ayuda", re.IGNORECASE)


def log(msg: str) -> None:
    # Captions are full of emoji/accented text, and Windows' console defaults
    # to a non-UTF-8 codepage (confirmed live: a real caption crashed a plain
    # print() here with UnicodeEncodeError) -- GitHub Actions' Linux runners
    # don't hit this, but a manual local run shouldn't die mid-sweep over a
    # logging line. Fall back to a lossy-but-safe re-encode rather than
    # crash the whole run.
    try:
        print(msg, file=sys.stderr, flush=True)
    except UnicodeEncodeError:
        encoding = sys.stderr.encoding or "ascii"
        print(msg.encode(encoding, errors="replace").decode(encoding), file=sys.stderr, flush=True)


def normalize(text: str) -> str:
    """Lowercase, strip accents -- for keyword/city-name matching regardless
    of accent usage (a caption might write "Pereira" or "Perèira", a DB
    municipio name is always accented correctly)."""
    decomposed = unicodedata.normalize("NFD", text or "")
    without_accents = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    return without_accents.lower()


def unwrap_json_response(html: str) -> Any:
    """A JSON API response fetched by direct browser navigation (Instagram,
    X's syndication endpoint) arrives wrapped in a minimal
    <html><body><p>{...}</p></body></html> shell -- normal browser behavior
    for a raw non-HTML response, not an error. Strip it before json.loads."""
    match = re.search(r"<p>(.*)</p>", html, re.DOTALL)
    text = match.group(1) if match else html
    return json.loads(text)


# ── Data shapes ─────────────────────────────────────────────────────────────


@dataclass
class Candidate:
    platform: str  # SocialPlatform enum value: TIKTOK | INSTAGRAM | X
    permalink: str
    author_handle: str | None = None
    # Already-enriched candidates (profile-sourced Instagram, since
    # web_profile_info returns full post data in the same call) skip the
    # separate enrichment step.
    enriched: dict[str, Any] | None = None
    # Set by discover_instagram_locations -- lets a candidate still resolve
    # a real municipio even if enrichment fails completely and there's no
    # caption to match against (we already know which TARGETS location page
    # it came from).
    place_hint: str | None = None


# ── TikTok ───────────────────────────────────────────────────────────────────


def discover_tiktok(hashtags: list[str]) -> list[Candidate]:
    candidates = []
    for tag in hashtags:
        url = f"https://www.tiktok.com/tag/{tag}"
        try:
            page = StealthyFetcher.fetch(url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, wait=9000)
            html = page.html_content
            links = set(re.findall(r'href="(https://www\.tiktok\.com/@[\w.\-]+/video/\d+)"', html))
            for link in links:
                candidates.append(Candidate(platform="TIKTOK", permalink=link))
            log(f"tiktok #{tag}: {len(links)} candidate(s)")
        except Exception as err:  # one bad hashtag shouldn't kill the whole platform
            log(f"tiktok #{tag} discovery failed: {err}")
    return candidates


def enrich_tiktok(permalink: str) -> dict[str, Any] | None:
    try:
        page = StealthyFetcher.fetch(permalink, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, wait=6000)
        html = page.html_content
        match = re.search(
            r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', html, re.DOTALL
        )
        if not match:
            return None
        data = json.loads(match.group(1))
        scope = data.get("__DEFAULT_SCOPE__", {})
        detail_key = next((k for k in scope if "video-detail" in k), None)
        if not detail_key:
            return None
        item = scope[detail_key].get("itemInfo", {}).get("itemStruct", {})
        author = item.get("author", {}) or {}
        stats = item.get("statsV2") or item.get("stats") or {}
        hashtags = [c.get("title") for c in (item.get("challenges") or []) if c.get("title")]
        return {
            "caption": item.get("desc") or "",
            "created_at": item.get("createTime"),
            "author_handle": author.get("uniqueId"),
            "verified": bool(author.get("verified")),
            "likes": int(stats.get("diggCount") or 0),
            "comments": int(stats.get("commentCount") or 0),
            "location_name": None,
            "hashtags": hashtags,
        }
    except Exception as err:
        log(f"tiktok enrichment failed for {permalink}: {err}")
        return None


# ── Instagram ────────────────────────────────────────────────────────────────


def discover_instagram_profiles(usernames: list[str]) -> tuple[list[Candidate], list[dict]]:
    """Returns (candidates, newly-seen locations) -- profile-sourced
    candidates already carry full enrichment data (web_profile_info returns
    the post data directly), no separate enrichment step needed."""
    candidates: list[Candidate] = []
    seen_locations: list[dict] = []
    for username in usernames:
        url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={username}"
        try:
            page = StealthyFetcher.fetch(
                url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, extra_headers=IG_APP_ID_HEADER
            )
            data = unwrap_json_response(page.html_content)
            user = (data.get("data") or {}).get("user") or {}
            edges = (user.get("edge_owner_to_timeline_media") or {}).get("edges", [])
            for edge in edges:
                node = edge.get("node", {})
                shortcode = node.get("shortcode")
                if not shortcode:
                    continue
                caption_edges = (node.get("edge_media_to_caption") or {}).get("edges", [])
                caption = caption_edges[0]["node"]["text"] if caption_edges else ""
                likes = (node.get("edge_liked_by") or node.get("edge_media_preview_like") or {}).get("count", 0)
                comments = (node.get("edge_media_to_comment") or {}).get("count", 0)
                loc = node.get("location")
                if loc and loc.get("id"):
                    seen_locations.append(loc)
                candidates.append(
                    Candidate(
                        platform="INSTAGRAM",
                        permalink=f"https://www.instagram.com/p/{shortcode}/",
                        author_handle=username,
                        enriched={
                            "caption": caption,
                            "created_at": node.get("taken_at_timestamp"),
                            "author_handle": username,
                            "verified": False,
                            "likes": likes,
                            "comments": comments,
                            "location_name": loc.get("name") if loc else None,
                            "hashtags": [],
                        },
                    )
                )
            log(f"instagram @{username}: {len(edges)} post(s)")
        except Exception as err:
            log(f"instagram @{username} discovery failed: {err}")
    return candidates, seen_locations


def discover_instagram_locations(locations: list[dict]) -> list[Candidate]:
    """Permalink-only -- the location page's DOM isn't gated the way the
    location API is, but it doesn't hand back full post JSON per item like
    web_profile_info does, so these need a separate enrichment pass."""
    candidates = []
    for loc in locations:
        url = f"https://www.instagram.com/explore/locations/{loc['id']}/{loc['slug']}/"
        try:
            page = StealthyFetcher.fetch(url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, wait=6000)
            html = page.html_content
            shortcodes = set(re.findall(r"/(?:p|reel)/([\w-]{5,})", html))
            for sc in shortcodes:
                candidates.append(
                    Candidate(platform="INSTAGRAM", permalink=f"https://www.instagram.com/p/{sc}/", place_hint=loc["name"])
                )
            log(f"instagram location {loc['name']}: {len(shortcodes)} candidate(s)")
        except Exception as err:
            log(f"instagram location {loc['name']} discovery failed: {err}")
    return candidates


def discover_instagram_ddg(queries: list[str]) -> list[Candidate]:
    """DuckDuckGo's HTML search endpoint as a bypass for Instagram's own
    (walled) hashtag/keyword search -- see the wiki doc for why this works
    (DDG already indexed the content, we're never touching instagram.com's
    own search surface). Permalink-only, needs enrichment."""
    candidates = []
    for query in queries:
        search_url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote('site:instagram.com ' + query)}"
        try:
            page = StealthyFetcher.fetch(
                search_url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, wait=3000
            )
            html = page.html_content
            found = 0
            for encoded in re.findall(r'uddg=([^&"]+)', html):
                target = urllib.parse.unquote(encoded).split("?")[0]
                if "instagram.com/p/" in target or "instagram.com/reel/" in target:
                    candidates.append(Candidate(platform="INSTAGRAM", permalink=target))
                    found += 1
            log(f'instagram DDG "{query}": {found} candidate(s)')
        except Exception as err:
            log(f'instagram DDG "{query}" failed: {err}')
    return candidates


def enrich_instagram_via_ytdlp(permalink: str) -> dict[str, Any] | None:
    """yt-dlp is confirmed working for known Instagram permalinks (unlike
    TikTok, where its extractor is currently broken) -- see the wiki doc.
    Only handles video/reel posts (confirmed live: a plain photo post fails
    with "There is no video in this post") -- see enrich_instagram_fallback
    for the photo-post path."""
    try:
        result = subprocess.run(
            ["yt-dlp", "--dump-json", "--skip-download", "--no-warnings", permalink],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode != 0:
            log(f"instagram yt-dlp enrichment failed for {permalink}: {result.stderr.strip()[:200]}")
            return None
        # Confirmed live: yt-dlp's stdout can carry more than one line of
        # content past the JSON object even with --no-warnings (a real
        # `json.loads` "Extra data" failure on real output) -- take the
        # first non-empty line rather than the whole buffer.
        first_line = next((line for line in result.stdout.splitlines() if line.strip()), "")
        if not first_line:
            return None
        data = json.loads(first_line)
        return {
            "caption": data.get("description") or "",
            "created_at": data.get("timestamp"),
            "author_handle": data.get("uploader_id") or data.get("channel"),
            "verified": False,
            "likes": int(data.get("like_count") or 0),
            "comments": int(data.get("comment_count") or 0),
            "location_name": None,
            "hashtags": [],
        }
    except Exception as err:
        log(f"instagram yt-dlp enrichment failed for {permalink}: {err}")
        return None


def enrich_instagram_fallback(permalink: str) -> dict[str, Any] | None:
    """Fallback for whatever yt-dlp can't handle (mainly plain photo posts)
    -- reuses the exact og:title parsing scripts/thumbnails/backfill.py
    already proved live: an Instagram permalink's og:title is formatted
    '<Author> on Instagram: "<caption>"'."""
    try:
        page = StealthyFetcher.fetch(permalink, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False)
        title_tags = page.css('meta[property="og:title"]')
        if not title_tags:
            # Confirmed live (2026-08-19, real GitHub Actions run): this
            # path can return a real 200 with unusable content specifically
            # from GHA's IP -- the exact same permalinks worked cleanly
            # fetched from a different machine seconds later. Likely IP-
            # reputation-based degradation (a known risk for datacenter IPs
            # against Instagram specifically), not a code bug -- logging
            # explicitly here (previously silent) so it's diagnosable
            # without re-running and cross-referencing timestamps by hand.
            log(f"instagram og:title fallback: no og:title tag for {permalink} (status {getattr(page, 'status', '?')})")
            return None
        title = title_tags[0].attrib.get("content") or ""
        match = re.match(r'^(.*?) on Instagram: "([\s\S]*)"$', title)
        if not match:
            log(f"instagram og:title fallback: title didn't match expected format for {permalink}: {title!r}")
            return None
        return {
            "caption": match.group(2),
            "created_at": None,
            "author_handle": match.group(1),
            "verified": False,
            "likes": 0,
            "comments": 0,
            "location_name": None,
            "hashtags": [],
        }
    except Exception as err:
        log(f"instagram og:title fallback failed for {permalink}: {err}")
        return None


def enrich_instagram(permalink: str) -> dict[str, Any] | None:
    return enrich_instagram_via_ytdlp(permalink) or enrich_instagram_fallback(permalink)


# ── X ────────────────────────────────────────────────────────────────────────


def discover_x(handles: list[str]) -> list[Candidate]:
    candidates = []
    for handle in handles:
        url = f"https://x.com/{handle}"
        try:
            page = StealthyFetcher.fetch(url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False, wait=5000)
            html = page.html_content
            tweet_ids = set(re.findall(rf"/{re.escape(handle)}/status/(\d+)", html))
            for tweet_id in tweet_ids:
                candidates.append(
                    Candidate(platform="X", permalink=f"https://x.com/{handle}/status/{tweet_id}", author_handle=handle)
                )
            log(f"x @{handle}: {len(tweet_ids)} candidate(s)")
        except Exception as err:
            log(f"x @{handle} discovery failed: {err}")
    return candidates


def enrich_x(permalink: str) -> dict[str, Any] | None:
    tweet_id = permalink.rstrip("/").rsplit("/", 1)[-1]
    url = f"https://cdn.syndication.twimg.com/tweet-result?id={tweet_id}&token=a"
    try:
        page = StealthyFetcher.fetch(url, headless=True, timeout=FETCH_TIMEOUT_MS, network_idle=False)
        data = unwrap_json_response(page.html_content)
        if not data or "text" not in data:
            return None
        user = data.get("user", {}) or {}
        return {
            "caption": data.get("text") or "",
            "created_at": data.get("created_at"),
            "author_handle": user.get("screen_name"),
            "verified": bool(user.get("is_blue_verified")),
            "likes": int(data.get("favorite_count") or 0),
            "comments": 0,  # not provided by this endpoint
            "location_name": None,
            "hashtags": [],
        }
    except Exception as err:
        log(f"x enrichment failed for {permalink}: {err}")
        return None


# ── Scoring ──────────────────────────────────────────────────────────────────


def guess_category(text: str) -> str:
    t = normalize(text)
    if NEED_RE.search(t):
        return "NEED"
    if AID_POINT_RE.search(t):
        return "AID_POINT"
    return "HUMAN_INTEREST"


def guess_kind(text: str) -> str | None:
    t = normalize(text)
    if ALBERGUE_RE.search(t):
        return "ALBERGUE"
    if ACOPIO_RE.search(t):
        return "ACOPIO"
    return None


def match_municipio(text: str, location_name: str, municipios: list[tuple[str, str]]) -> tuple[str, str] | None:
    """municipios: list of (id, name). Returns the matching (id, name), or
    None. Matches against caption text OR the platform's own location tag."""
    haystack = normalize(f"{text} {location_name or ''}")
    for municipio_id, name in municipios:
        if normalize(name) in haystack:
            return municipio_id, name
    return None


def score_candidate(
    caption: str,
    location_name: str | None,
    author_handle: str | None,
    known_handles: set[str],
    municipio_match: tuple[str, str] | None,
    corroborated: bool,
) -> int:
    """Deterministic 0-10 score, no LLM -- keyword weight + city match +
    earthquake-context gate + known-account trust bonus + corroboration
    against existing data. Pure function, no I/O -- see test_discover.py."""
    text = normalize(caption or "")
    is_known_handle = bool(author_handle and normalize(author_handle) in known_handles)
    score = 0.0

    for keyword, weight in KEYWORD_WEIGHTS.items():
        if keyword in text:
            score += weight

    if municipio_match is not None:
        score += 2

    if not EARTHQUAKE_CONTEXT_RE.search(text):
        # Heavily penalize zero earthquake-context signal on an unknown
        # account (a real risk of unrelated content slipping through) --
        # but go lighter on a TARGETS-listed handle, confirmed live that a
        # real, on-topic post from a vetted relief org can legitimately
        # skip re-stating "terremoto" every time (internal logistics
        # language, not news-style writing) and shouldn't get buried by
        # the same penalty a random unknown post earns.
        score -= 1 if is_known_handle else 3

    if is_known_handle:
        score += 2

    if corroborated:
        score += 2

    return max(0, min(10, round(score)))


# ── Dedup + corroboration (DB) ────────────────────────────────────────────────


def filter_new_candidates(cur, candidates: list[Candidate]) -> list[Candidate]:
    """Batched dedup BEFORE enrichment -- discovery is cheap, enrichment is
    the expensive step that actually burns rate-limit budget, so check
    what's already known first and only enrich what's left. Matches
    gov-news-check's own discipline: dedup against ALL statuses, not just
    PENDING, so a moderator's rejection never re-stages."""
    permalinks = [c.permalink for c in candidates]
    if not permalinks:
        return []
    cur.execute(
        """
        SELECT permalink FROM "PendingSocialPost" WHERE permalink = ANY(%s)
        UNION
        SELECT permalink FROM "SocialPost" WHERE permalink = ANY(%s)
        """,
        (permalinks, permalinks),
    )
    known = {row[0] for row in cur.fetchall()}
    fresh = [c for c in candidates if c.permalink not in known]
    log(f"dedup: {len(candidates)} candidate(s) -> {len(fresh)} new")
    return fresh


def is_corroborated(cur, municipio_id: str | None, kind: str | None) -> bool:
    """Light corroboration signal: does an already-APPROVED aid point of the
    same kind already exist in that city? Suggests this post is describing
    something real rather than a one-off unverifiable claim. One query per
    surviving candidate -- fine at this scale (a background job, the real
    cost is the browser waits, not this)."""
    if not municipio_id or not kind:
        return False
    cur.execute('SELECT 1 FROM "AidPoint" WHERE "municipioId" = %s AND kind = %s LIMIT 1', (municipio_id, kind))
    return cur.fetchone() is not None


def already_has_pending_aid_point(cur, source_url: str) -> bool:
    cur.execute('SELECT 1 FROM "PendingAidPoint" WHERE "sourceUrl" = %s LIMIT 1', (source_url,))
    return cur.fetchone() is not None


# ── Staging ──────────────────────────────────────────────────────────────────


def resolve_category(enriched: dict) -> str:
    if enriched.get("verified"):
        return "OFFICIAL"
    return guess_category(enriched.get("caption") or "")


def stage_social_post(cur, candidate: Candidate, enriched: dict, score: int, category: str, municipio_id: str | None, place_name: str | None) -> None:
    caption_excerpt = (enriched.get("caption") or "").strip()[:350]
    submitter_note = f"[score {score}/10] {caption_excerpt}".strip()

    cur.execute(
        """
        INSERT INTO "PendingSocialPost"
            (id, platform, permalink, "authorHandle", category, "municipioId", "placeName", "submitterNote", origin, status, "createdAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'AUTOMATION_SWEEP', 'PENDING', now())
        """,
        (
            str(uuid.uuid4()),
            candidate.platform,
            candidate.permalink,
            enriched.get("author_handle") or candidate.author_handle,
            category,
            municipio_id,
            place_name,
            submitter_note,
        ),
    )


def stage_bare_social_post(cur, candidate: Candidate, municipio_id: str | None, place_name: str | None) -> None:
    """A candidate whose caption we couldn't fetch at all -- still worth a
    row so a moderator can review the real post directly, rather than us
    silently finding nothing. HUMAN_INTEREST is the safest default category
    (no caption to classify from); no companion aid-point, since guess_kind()
    needs caption text too."""
    cur.execute(
        """
        INSERT INTO "PendingSocialPost"
            (id, platform, permalink, "authorHandle", category, "municipioId", "placeName", "submitterNote", origin, status, "createdAt")
        VALUES (%s, %s, %s, %s, 'HUMAN_INTEREST', %s, %s, %s, 'AUTOMATION_SWEEP', 'PENDING', now())
        """,
        (
            str(uuid.uuid4()),
            candidate.platform,
            candidate.permalink,
            candidate.author_handle,
            municipio_id,
            place_name,
            "[enrichment failed — review manually]",
        ),
    )


def stage_companion_aid_point(cur, candidate: Candidate, enriched: dict, score: int, municipio_id: str, kind: str) -> bool:
    """A post can simultaneously be a community post worth reviewing AND
    describe a specific real aid point -- when it clearly reads as one
    (kind keyword matched) and resolves to a known city, also stage a
    PendingAidPoint pointing at the same permalink, same discipline as
    api/cron/discovery's companion staging. Returns True if staged."""
    if already_has_pending_aid_point(cur, candidate.permalink):
        return False

    caption_excerpt = (enriched.get("caption") or "").strip()[:350]
    handle = enriched.get("author_handle") or candidate.author_handle or "?"
    org_label = f"{candidate.platform.title()} — @{handle}"

    cur.execute(
        """
        INSERT INTO "PendingAidPoint"
            (id, "municipioId", kind, name, "sourceUrl", "sourceOrg", "submitterNote", origin, status, "createdAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'AUTOMATION_SWEEP', 'PENDING', now())
        """,
        (
            str(uuid.uuid4()),
            municipio_id,
            kind,
            "Detección automática — revisar",
            candidate.permalink,
            org_label,
            f"[score {score}/10] {caption_excerpt}".strip(),
        ),
    )
    return True


# ── Alerting ─────────────────────────────────────────────────────────────────


def notify_ops(subject: str, html: str) -> None:
    """Duplicates web/src/lib/notify.ts's Resend call in Python (stdlib
    only, no new dependency) rather than adding a Next.js relay endpoint
    just to reuse it -- same no-op-if-unset behavior."""
    api_key = os.environ.get("RESEND_API_KEY")
    to = os.environ.get("CRON_ALERT_EMAIL")
    if not api_key or not to:
        log("notify_ops: RESEND_API_KEY or CRON_ALERT_EMAIL not set, skipping alert.")
        return

    payload = json.dumps(
        {"from": "SOSColombia <onboarding@resend.dev>", "to": to, "subject": subject, "html": html}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=15)
    except urllib.error.URLError as err:
        log(f"notify_ops: Resend send failed: {err}")


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)

    conn = psycopg2.connect(database_url)
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute('SELECT id, name FROM "Municipio"')
    municipios = cur.fetchall()

    known_handles = {normalize(h) for h in TARGETS["instagram_profiles"] + TARGETS["x_profiles"]}

    # ── Discovery (cheap) ──
    all_candidates: list[Candidate] = []
    new_locations: list[dict] = []

    try:
        all_candidates += discover_tiktok(TARGETS["tiktok_hashtags"])
    except Exception as err:
        log(f"tiktok platform failed: {err}")

    try:
        ig_profile_candidates, seen_locations = discover_instagram_profiles(TARGETS["instagram_profiles"])
        all_candidates += ig_profile_candidates
        known_location_ids = {loc["id"] for loc in TARGETS["instagram_locations"]}
        new_locations = [loc for loc in seen_locations if loc["id"] not in known_location_ids]
        all_candidates += discover_instagram_locations(TARGETS["instagram_locations"])
        all_candidates += discover_instagram_ddg(DDG_SEARCH_QUERIES)
    except Exception as err:
        log(f"instagram platform failed: {err}")

    try:
        all_candidates += discover_x(TARGETS["x_profiles"])
    except Exception as err:
        log(f"x platform failed: {err}")

    # Dedup by permalink WITHIN this run before anything else -- confirmed
    # live that a single DDG search can return the same post more than once
    # (different result snippets, same URL), and filter_new_candidates below
    # only checks against the DB, not against duplicates inside this same
    # candidate list, so without this a repeated permalink would sail
    # through DB-dedup (neither copy is known yet) and get staged twice.
    seen_permalinks: set[str] = set()
    deduped_candidates = []
    for c in all_candidates:
        if c.permalink in seen_permalinks:
            continue
        seen_permalinks.add(c.permalink)
        deduped_candidates.append(c)
    all_candidates = deduped_candidates

    log(f"total discovered: {len(all_candidates)}")

    # ── Dedup BEFORE enrichment ──
    fresh_candidates = filter_new_candidates(cur, all_candidates)

    # ── Enrichment (expensive) ──
    scored: list[tuple[Candidate, dict, int, tuple[str, str] | None]] = []
    unenriched: list[tuple[Candidate, tuple[str, str] | None]] = []
    for candidate in fresh_candidates:
        enriched = candidate.enriched
        if enriched is None:
            if candidate.platform == "TIKTOK":
                enriched = enrich_tiktok(candidate.permalink)
            elif candidate.platform == "INSTAGRAM":
                enriched = enrich_instagram(candidate.permalink)
            elif candidate.platform == "X":
                enriched = enrich_x(candidate.permalink)
        if not enriched or not (enriched.get("caption") or "").strip():
            # Enrichment failed entirely -- confirmed live this can happen
            # at real scale (Instagram degrading hard from some IPs, e.g.
            # GitHub Actions', even though discovery still finds real
            # permalinks). Still stage a bare placeholder rather than
            # silently dropping it -- a moderator reviewing the real post
            # directly is strictly better than us finding nothing at all.
            # Uses whatever location hint discovery already knows (e.g.
            # which TARGETS location page this came from) even with no
            # caption to match a city against.
            municipio_match = match_municipio("", candidate.place_hint, municipios) if candidate.place_hint else None
            unenriched.append((candidate, municipio_match))
            continue

        municipio_match = match_municipio(enriched["caption"], enriched.get("location_name"), municipios)
        kind = guess_kind(enriched["caption"])
        corroborated = is_corroborated(cur, municipio_match[0] if municipio_match else None, kind)
        score = score_candidate(
            enriched["caption"],
            enriched.get("location_name"),
            enriched.get("author_handle") or candidate.author_handle,
            known_handles,
            municipio_match,
            corroborated,
        )
        if score < SCORE_FLOOR:
            continue
        scored.append((candidate, enriched, score, municipio_match))

    # ── Cap to top N, best first -- scored and unenriched capped separately ──
    scored.sort(key=lambda t: t[2], reverse=True)
    to_stage = scored[:MAX_STAGED]
    dropped = len(scored) - len(to_stage)
    log(f"scored above floor: {len(scored)}, staging top {len(to_stage)} (dropped {dropped} more)")

    to_stage_unenriched = unenriched[:MAX_STAGED_UNENRICHED]
    dropped_unenriched = len(unenriched) - len(to_stage_unenriched)
    log(
        f"enrichment failed entirely: {len(unenriched)}, staging {len(to_stage_unenriched)} as bare placeholders "
        f"(dropped {dropped_unenriched} more)"
    )

    staged_social = 0
    staged_aid_points = 0
    for candidate, municipio_match in to_stage_unenriched:
        municipio_id, place_name = municipio_match if municipio_match else (None, None)
        stage_bare_social_post(cur, candidate, municipio_id, place_name)
        staged_social += 1

    for candidate, enriched, score, municipio_match in to_stage:
        municipio_id, place_name = municipio_match if municipio_match else (None, None)
        category = resolve_category(enriched)
        stage_social_post(cur, candidate, enriched, score, category, municipio_id, place_name)
        staged_social += 1

        # Only stage the companion aid-point when the post actually reads as
        # one (category AID_POINT) -- confirmed live that guess_kind() alone
        # is too loose: a NEED post about volunteers running low on supplies
        # for animals housed "en los albergues" matched the ALBERGUE keyword
        # even though it isn't announcing a new shelter location.
        kind = guess_kind(enriched["caption"])
        if category == "AID_POINT" and kind and municipio_id:
            if stage_companion_aid_point(cur, candidate, enriched, score, municipio_id, kind):
                staged_aid_points += 1

    conn.commit()
    cur.close()
    conn.close()

    log(
        f"staged {staged_social} PendingSocialPost "
        f"({len(to_stage_unenriched)} bare placeholder(s)), {staged_aid_points} companion PendingAidPoint"
    )

    if staged_social > 0 or new_locations:
        scored_rows = "".join(
            f"<li>{c.platform} — @{e.get('author_handle') or c.author_handle or '?'} "
            f"(score {s}/10): <a href='{c.permalink}'>{c.permalink}</a></li>"
            for c, e, s, _m in to_stage
        )
        bare_rows = "".join(
            f"<li>{c.platform} — @{c.author_handle or '?'} (enrichment failed, review manually): "
            f"<a href='{c.permalink}'>{c.permalink}</a></li>"
            for c, _m in to_stage_unenriched
        )
        rows = scored_rows + bare_rows
        location_suggestions = "".join(
            f"<li>Instagram location: {loc.get('name')} (id {loc.get('id')}, slug {loc.get('slug')}) "
            f"— add to TARGETS['instagram_locations'] if useful</li>"
            for loc in new_locations
        )
        await_note = (
            f"<h4>New locations seen (not yet added to TARGETS)</h4><ul>{location_suggestions}</ul>"
            if new_locations
            else ""
        )
        notify_ops(
            "SOSColombia: social discovery sweep found new candidates",
            f"<p>The social-discovery sweep staged {staged_social} post(s) "
            f"({staged_aid_points} also as aid-point candidates) at /admin/comunidad and /admin/moderacion.</p>"
            f"<ul>{rows}</ul>{await_note}"
            f"<p>Nothing was published automatically — review each one before approving.</p>",
        )


if __name__ == "__main__":
    main()
