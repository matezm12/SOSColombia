# Lean research protocol: aid-point / centro-de-ayuda address lookups

Applies to any future seed-passN / apply-researched-addresses pass that
researches a real address for an AidPoint or allied resource. Goal: cut
token spend, mainly by killing screenshot usage.

If a pass pulls a photo or video with an identifiable person (not just
an address), read `scripts/social-discovery/CONSENT-POLICY.md` first.

## Order of operations (stop at first hit)

1. **Check `PENDING-AID-POINT-ADDRESSES.md` category first.** Category C
   (no fixed location by design) and previously-reverted bad matches
   (see `aid-point-map-rollout` memory) are not worth re-researching.
   Category B (social-only) is known low-yield — only re-run if the user
   flags a specific point, not as a blanket sweep.
2. **WebSearch snippet only.** Address/phone/barrio is often already in
   the search-result snippet. If the snippet answers it, stop — do not
   fetch the page.
3. **WebFetch (text), never Chrome screenshot.** If the snippet isn't
   enough, fetch the page as text. `computer`/screenshot tools cost
   image tokens for what is a text-extraction job — never use them for
   this.
4. **Social platform → oEmbed/JSON endpoint, not rendered page:**
   - Instagram/Facebook: public oEmbed endpoint returns caption text as
     JSON, no image render needed.
   - TikTok: oEmbed endpoint, same idea.
   - X/Twitter: syndication endpoint text, not the rendered timeline.
   Only fall back to `claude-in-chrome` rendering if the platform blocks
   oEmbed/WebFetch entirely (login wall, JS-only render).
5. **Structured output only.** Any agent/fork doing this research must
   return `{found, name, address, barrio, lat, lng, source_url,
   confidence}` — not prose, not a narrated search process. Force it via
   a schema (Workflow `agent(..., {schema})`) or an explicit "reply with
   only this JSON" instruction for a plain fork/agent call.

## Batching

Prefer one Workflow `pipeline()` of small schema-bound agents over N
sequential forks — each fork re-pays full context; pipeline stages don't.
Cap the fleet to what the point count actually needs, and `log()` any
point skipped as low-yield rather than silently dropping it.
