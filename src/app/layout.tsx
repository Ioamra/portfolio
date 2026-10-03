import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { excerpt } from "@/lib/format";
import { env } from "@/server/env";
import { getProfile } from "@/server/services/profile.service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const siteName = `${profile.fullName} — ${profile.headline}`;

  return {
    // Base des URL absolues (Open Graph, canonical, sitemap).
    metadataBase: new URL(env.SITE_URL),
    title: { default: siteName, template: `%s | ${profile.fullName}` },
    description: excerpt(profile.bio),
    authors: [{ name: profile.fullName, url: env.SITE_URL }],
    // Aperçu lors d'un partage (LinkedIn, messageries…). L'image vient de opengraph-image.tsx.
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: profile.fullName,
      title: siteName,
      description: excerpt(profile.bio),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning : next-themes ajoute la classe du thème avant l'hydratation.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Le site a son propre thème sombre : on demande à l'extension Dark Reader de ne pas
            modifier le DOM (sinon erreurs d'hydratation et couleurs dégradées). */}
        <meta name="darkreader-lock" />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
