# Social Media Methodology — X, Instagram, Facebook, TikTok

Documents the approach and reusable findings from the first live social-media pass (2026-08-14), so future passes on other cities don't re-derive the same lessons. This closes "the universal wall" flagged in wiki/research-plan-phase2.md — the platforms are no longer inaccessible, they just need this specific approach.

This file is about **manual research using the user's own logged-in sessions**. For **unattended/anonymous automated discovery** (no login, for a future cron job) see `wiki/18-social-discovery-engineering.md` — a separate research pass with materially different findings (e.g. Instagram hashtag search stays walled even anonymously, but profile and location lookups don't).

## Approach used

- Browser automation (claude-in-chrome) with the user's own logged-in sessions on X, Instagram, Facebook, TikTok. No WhatsApp/Telegram (explicitly deferred — would need group invites, not just login).
- One tab per platform, navigated directly to hashtag/search pages (not the platform's own search UI typed interactively — direct URL navigation is faster and more reliable).
- Primary technique: hashtag/keyword search on the "Top" tab (not "Latest") — surfaces the highest-engagement, most-corroborated posts first, which in practice means official accounts and viral/verified content rather than noise. "Latest" tended to surface low-signal chatter.
- Screenshots + `get_page_text` used together — `get_page_text` is fast but sometimes only grabs the first `<article>` element (X) or returns obfuscated anti-scraping text (Facebook default view); screenshots + zoom were more reliable for flyer/infographic text, which carried most of the actual actionable data (addresses, phone numbers).
- For each valuable post, clicked through to the individual post permalink (not just the search-results URL) — needed for embedding/linking from the eventual webapp (see "Embeds and permalinks" below).

## Per-platform notes

- **X (Twitter)**: Best signal-to-noise of the four. Official accounts (Alcaldía de Pereira, etc.) post frequently with detailed graphics (flyers with addresses/phones baked into the image). Hashtag pages work well; "Top" tab surfaces the right content fast. Occasional page freezes/timeouts on screenshot — retry once, usually resolves.
- **Instagram**: Hashtag pages (`instagram.com/explore/tags/{tag}/`) work well when logged in. Grid view loads as blank/dark boxes initially — wait 2-3 seconds before screenshotting. Good source for cross-verification (the same flyer often gets reposted by different accounts — useful for confirming a single source isn't an outlier). Reels/video content is harder to extract without watching (no reliable caption-text-only view).
- **Facebook**: Contrary to the Phase 2 scoping pass's finding that Facebook was "the weakest platform via `site:` search" — that was true for logged-out plain search. **Logged-in Facebook search (`facebook.com/search/top/?q=...`) was actually the single best source this pass** — official Alcaldía posts, detailed campaign posts (Colombia Un Solo Corazón) with full text visible after clicking "See more". Facebook Groups search is dominated by spam/unrelated groups (e.g. "TEMU ayuda" shopping groups) — not a useful channel for this project, don't bother searching Groups specifically.
- **TikTok**: `get_page_text` on the search-results page returns full captions for many videos at once (unusually good extraction, better than X/Instagram for bulk-scanning). Good for finding individual/small accounts posting ongoing coverage (see watchlist pattern below). Video content itself (beyond captions) not analyzed.

## Reusable search pattern (apply per city)

1. `{platform}.com/search?q={city}%20terremoto%20{albergue|ayuda|damnificados}` (X, Facebook) or `/explore/tags/{city}tenecesita/` if the city has an official hashtag (Instagram)
2. Check the official Alcaldía/Gobernación account specifically, not just generic hashtag search
3. Look for flyer-style graphics (addresses/phones are usually in the image, not the caption — need a screenshot+zoom to read them, `get_page_text` alone will miss them)
4. Cross-check any address found against a second post if possible — the same city-wide flyer often gets reposted/amplified by multiple accounts (an efficient free cross-verification)
5. Note individual/small accounts posting consistent, dated, on-the-ground content as a "watchlist" entry in that city's aid-points file (not a one-off fact) — see wiki/07-aid-points/pereira.md for the pattern

## Embeds and permalinks — answers the "can we show previews on the site" question

All four platforms support some form of public embedding, with different friction:

| Platform | Embed mechanism | Auth needed? |
|---|---|---|
| TikTok | Public oEmbed endpoint: `tiktok.com/oembed?url=...` | None — free, open |
| X | Public oEmbed: `publish.twitter.com/oembed?url=...` | None — free, open |
| Instagram | `embed.js` script + `<blockquote class="instagram-media">` for a single public post | None for single-post embed; Meta's bulk/automated oEmbed API needs a registered Facebook Developer app + token |
| Facebook | Facebook SDK Page/Post embed plugin | Needs a free registered App ID (one-time setup), no per-post token |

**Practical implication for the data model**: every social-sourced fact in the wiki should carry the post's **permalink URL**, not just a description or the search-page URL it was found on — that's the one piece needed later for an embed or preview card. This wasn't done consistently in the very first pass (Phase 2 execution); it was retrofitted for this pass's highest-value posts (see wiki/07-aid-points/pereira.md, wiki/11-crowdfunding-campaigns.md for examples with permalinks attached). **Going forward, always capture the permalink when logging a social post as a source**, not just the platform/handle/date.

## Known limitations carried forward
- WhatsApp/Telegram remain out of scope — closed platforms, need group invites not just login, explicitly deferred
- Screenshot/`get_page_text` timeouts happen periodically on all platforms (heavy media pages) — simple retry resolves it, not a systemic block
- No systematic sweep was done — this was a targeted pass on the highest-priority hashtags/cities (Pereira deepest, Cali/Manizales/Armenia/Quibdó lighter), not exhaustive
