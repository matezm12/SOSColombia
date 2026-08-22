# Photo and social-content consent policy

Applies to any script or pass that pulls photos, video, or identifiable
people from social platforms into the site: `discover.py`, the
`seed-pass*.ts` scripts in `web/prisma/`, and the thumbnail backfill in
`scripts/thumbnails/`. Modeled on ICRC's and UNHCR's public content
guidelines. This is a hard constraint, not a style note.

## The rule

Before an image or video with an identifiable person goes live on the
public site (a story cover, a StoryCard thumbnail, an embedded post):

1. **Consent exists, or the person is not identifiable.** Consent can be
   the poster's own public account posting their own image (implicit,
   the standard case for aid-activity content), or a documented note
   from whoever collected the content. If neither applies and the person
   is identifiable, do not publish. Crop, blur, or choose a different
   image instead.
2. **Minors and people in acute distress get stricter treatment.** Do
   not publish an identifiable photo of a minor, or of someone in
   visible distress or injury, sourced from a scrape rather than their
   own account, even if the post is public. Prefer a map pin, icon, or
   stat callout over that image.
3. **Bias toward capacity, not damage.** When choosing between two
   available images for the same story or location, prefer one that
   shows aid being delivered, people rebuilding, or volunteers working,
   over a "hero" shot of destruction or grief.
4. **Credit the source.** Any image pulled from a linked campaign or
   social post (not a first-party photo) gets a visible credit line in
   the UI, not just an internal citation. See `resolveStoryImage` in
   `web/src/lib/stories.ts` and the credit caption in `StoryCard.tsx`
   and `historias/[slug]/page.tsx`.

## Captions

When a caption or note accompanies a photo, use the two-sentence
convention: first sentence states who, where, and when (first name only
for a minor or vulnerable adult, general location, date); second
sentence gives factual context. No adjectives written to maximize pity
("devastated", "desperate"). Neutral, accurate color treatment only,
never a stylized or desaturated "crisis" grade on a real photo of a real
person.

## Why this matters for this project specifically

Most of this app's photo content enters through `discover.py`'s
Instagram/TikTok/X sweeps and the `seed-pass*.ts` scripts that turn
those results into `PendingSocialPost` and `Story` rows. That pipeline
never obtains direct consent from anyone pictured, it only confirms the
post is public. This policy is the check that sits between "publicly
posted" and "published on SOSColombia".
