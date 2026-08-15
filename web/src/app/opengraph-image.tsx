import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SOSColombia — Terremoto 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The user's own IG wordmark (cropped/downscaled from the source asset,
// see public/brand/soscolombia-wordmark.png), read + inlined as a data URI
// — Satori (what ImageResponse renders through) can't resolve a plain
// "/brand/..." public-folder path at render time, only remote URLs or
// data URIs, so this is the standard way to embed a local static image.
const wordmarkPath = path.join(process.cwd(), "public", "brand", "soscolombia-wordmark.png");
const wordmarkBase64 = readFileSync(wordmarkPath).toString("base64");
const wordmarkSrc = `data:image/png;base64,${wordmarkBase64}`;
// Real file is 1600x368 (see the crop script this was generated from).
const WORDMARK_ASPECT = 368 / 1600;

export default function OpengraphImage() {
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
            <span>Terremoto&nbsp;de&nbsp;Colombia —</span>
          </div>
          <div style={{ display: "flex" }}>10 de agosto de 2026</div>
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
          Cifras oficiales, puntos de ayuda y cómo donar — cada dato con su fuente.
        </div>
      </div>
    ),
    { ...size },
  );
}
