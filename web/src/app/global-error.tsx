"use client";

import { useEffect } from "react";

// Only rendered if the root layout itself throws (catastrophic, very rare) —
// it replaces the ENTIRE tree including <html>/<body>, so it can't rely on
// NextIntlClientProvider, SiteHeader/Footer, or any other context from
// [locale]/layout.tsx. Kept deliberately plain and bilingual-by-hardcoding
// rather than routed, since there's no locale context left to read from.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- only surfacing for Vercel's function logs, no analytics wired up for client error events yet
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Algo salió mal / Something went wrong
        </h1>
        <p style={{ color: "#71717a", maxWidth: "28rem" }}>
          Hubo un error inesperado. Intentá de nuevo o volvé más tarde.
          <br />
          There was an unexpected error. Try again or come back later.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "0.375rem",
            background: "black",
            color: "white",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Reintentar / Retry
        </button>
      </body>
    </html>
  );
}
