"use client";

// Dernier recours : erreur dans le layout racine lui-même (base inaccessible…).
// Remplace tout le document, d'où <html> et <body>, et des styles en ligne sans dépendance.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Site momentanément indisponible</h1>
          <p style={{ color: "#a3a3a3", marginBottom: 24 }}>Merci de réessayer dans un instant.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #404040",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
