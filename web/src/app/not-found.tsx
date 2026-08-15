// Handles notFound() calls that happen ABOVE the [locale] segment — namely
// [locale]/layout.tsx itself calling notFound() for an invalid locale param
// (see hasLocale check there). A layout can't render its own segment's
// not-found.tsx boundary when the layout is what triggered notFound(), so
// the applicable boundary is the parent segment: here, the true app root.
// Self-contained like global-error.tsx: no NextIntlClientProvider, no
// SiteHeader/Footer, since this renders outside [locale]'s root layout.
export default function RootNotFound() {
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
          Página no encontrada / Page not found
        </h1>
        <p style={{ color: "#71717a", maxWidth: "28rem" }}>
          La página que buscás no existe o fue movida.
          <br />
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <a
          href="/"
          style={{
            borderRadius: "0.375rem",
            background: "black",
            color: "white",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Inicio / Home
        </a>
      </body>
    </html>
  );
}
