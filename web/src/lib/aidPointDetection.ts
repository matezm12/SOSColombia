import type { AidPointKind } from "@prisma/client";

// Shared keyword-detection logic — pulled out of api/cron/gov-news-check/route.ts
// so api/cron/discovery (Google News RSS sweep) reuses the exact same, already-
// tuned matching (including the earthquake-context co-occurrence requirement)
// instead of re-deriving it.

// Only these two kinds have a clean keyword signal in press coverage — no
// reliable wording found for health/vet/blood-donation/monetary-donation
// points in this kind of text.
export const KIND_KEYWORDS: Partial<Record<AidPointKind, RegExp>> = {
  ALBERGUE: /albergue|refugio temporal/gi,
  ACOPIO: /punto de acopio|centro de acopio|punto de ayuda/gi,
};
export const EARTHQUAKE_CONTEXT = /terremoto|sismo|damnificad/i;
const CONTEXT_WINDOW = 400; // chars either side of a kind-keyword hit, to require earthquake co-occurrence
const SNIPPET_WINDOW = 200; // chars either side, for the stored/emailed snippet

export interface Finding {
  kind: AidPointKind;
  snippet: string;
}

// Requires EARTHQUAKE_CONTEXT to co-occur within CONTEXT_WINDOW chars of a
// kind-keyword hit — confirmed necessary by testing (gov-news-check's
// original finding): an ungated match on "albergue"/"acopio" alone pulls in
// unrelated coverage (homeless shelters, generic donation drives) that has
// nothing to do with this earthquake.
export function findCandidates(text: string): Finding[] {
  const found: Finding[] = [];
  const seenSnippets = new Set<string>();

  for (const [kind, pattern] of Object.entries(KIND_KEYWORDS) as Array<[AidPointKind, RegExp | undefined]>) {
    if (!pattern) continue;
    for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const idx = match.index ?? 0;
      const contextStart = Math.max(0, idx - CONTEXT_WINDOW);
      const contextEnd = Math.min(text.length, idx + CONTEXT_WINDOW);
      const context = text.slice(contextStart, contextEnd);
      if (!EARTHQUAKE_CONTEXT.test(context)) continue;

      const snippetStart = Math.max(0, idx - SNIPPET_WINDOW);
      const snippetEnd = Math.min(text.length, idx + SNIPPET_WINDOW);
      const snippet = text.slice(snippetStart, snippetEnd).trim();

      if (seenSnippets.has(snippet)) continue;
      seenSnippets.add(snippet);
      found.push({ kind, snippet });
    }
  }

  return found;
}
