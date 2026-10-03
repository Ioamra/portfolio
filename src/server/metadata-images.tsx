import "server-only";
import { ImageResponse } from "next/og";
import { env } from "./env";

/** Dimensions recommandées pour les aperçus (LinkedIn, Open Graph). */
export const OG_SIZE = { width: 1200, height: 630 };

// Couleurs du thème sombre (équivalents hexadécimaux des tokens oklch de globals.css).
const COLORS = {
  background: "#0a0a0a",
  primary: "#8aa8f0",
  foreground: "#fafafa",
  muted: "#a3a3a3",
};

type OgImageProps = {
  /** Petit libellé au-dessus du titre. */
  eyebrow: string;
  title: string;
  subtitle: string;
};

/**
 * Image d'aperçu commune au site : fond sombre, barre et titre dans la couleur d'accent,
 * domaine en pied.
 * Rendu par Satori : chaque bloc à plusieurs enfants doit être en display: flex. Satori ne
 * gère ni les motifs de fond répétés ni le gras sans fichier de police : on s'en tient
 * à des aplats et à la graisse normale.
 */
export function renderOgImage({ eyebrow, title, subtitle }: OgImageProps) {
  const domain = new URL(env.SITE_URL).host;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: COLORS.background,
        borderLeft: `16px solid ${COLORS.primary}`,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: COLORS.primary,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 30 ? 72 : 96,
            lineHeight: 1.05,
            color: COLORS.primary,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 36, lineHeight: 1.3, color: COLORS.foreground }}>
          {subtitle}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: COLORS.muted }}>{domain}</div>
    </div>,
    OG_SIZE,
  );
}

/** « Ioamra Monchau » → « IM » */
function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** Icône du site : initiales blanches sur fond de la couleur d'accent. */
export function renderIcon(fullName: string, size: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2d5bd1",
        color: "#ffffff",
        fontSize: size * 0.46,
        letterSpacing: -size * 0.02,
        borderRadius: size * 0.22,
        fontFamily: "sans-serif",
      }}
    >
      {initials(fullName)}
    </div>,
    { width: size, height: size },
  );
}
