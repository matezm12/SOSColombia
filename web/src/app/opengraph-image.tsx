import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "SOSColombia — Terremoto 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#f87171",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          SOSCOLOMBIA
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 24 }}>
          Terremoto de Colombia
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
          10 de agosto de 2026
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginTop: 32 }}>
          Cifras oficiales, puntos de ayuda y cómo donar — cada dato con su fuente.
        </div>
      </div>
    ),
    { ...size },
  );
}
