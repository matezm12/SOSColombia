import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Locale-aware counterpart to the root app/opengraph-image.tsx (which stays
// Spanish-only and serves as the fallback for routes outside [locale] --
// /admin, 404s). A regular API route rather than the opengraph-image file
// convention: that convention's default export only receives route `params`,
// not arbitrary query params, and nesting it as [locale]/opengraph-image.tsx
// would generate a URL like /es/opengraph-image -- which next-intl's "as-
// needed" routing (es is the default, unprefixed locale) would redirect back
// to /opengraph-image, landing on the OLD Spanish-only root file instead of
// this one. Plain query param sidesteps all of that.
export const runtime = "nodejs";

const wordmarkPath = path.join(process.cwd(), "public", "brand", "soscolombia-wordmark.png");
const wordmarkBase64 = readFileSync(wordmarkPath).toString("base64");
const wordmarkSrc = `data:image/png;base64,${wordmarkBase64}`;
// Real file is 1600x368 (see the crop script this was generated from).
const WORDMARK_ASPECT = 368 / 1600;

const COPY = {
  es: {
    line1: "Terremoto de Colombia —",
    line2: "10 de agosto de 2026",
    tagline: "Cifras oficiales, puntos de ayuda y cómo donar — cada dato con su fuente.",
  },
  en: {
    line1: "Colombia Earthquake —",
    line2: "August 10, 2026",
    tagline: "Official figures, aid points, and how to donate — every number with its source.",
  },
} as const;

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "es";
  const t = COPY[locale];
  const wordmarkWidth = 760;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "70px",
          background: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={wordmarkSrc}
          width={wordmarkWidth}
          height={Math.round(wordmarkWidth * WORDMARK_ASPECT)}
          alt="SOSColombia"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 52,
            fontWeight: 700,
            color: "#18181b",
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex" }}>
            <span>{t.line1}</span>
          </div>
          <div style={{ display: "flex" }}>{t.line2}</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#52525b",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          {t.tagline}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
