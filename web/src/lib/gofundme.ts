// URL-driven rather than relying on whoever enters a record to also
// remember to flag it — a link is a GoFundMe embed candidate purely
// because its host says so. Used by both CampaignCard (as a fallback if
// `platform` is ever wrong) and AidPointCard (monetary-donation aid
// points have no platform field at all, and were rendering GoFundMe
// links as a plain "ver fuente" link with no embed until this existed).
//
// Deliberately its own plain module, not exported from GoFundMeEmbed.tsx:
// that file is "use client", and a server component (CampaignCard,
// AidPointCard) can't call a plain function out of a client module.
export function isGoFundMeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname.replace(/^www\./, "") === "gofundme.com";
  } catch {
    return false;
  }
}
