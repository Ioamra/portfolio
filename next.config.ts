import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modèle de cache de Next 16 : les données sont mises en cache explicitement avec
  // "use cache" et invalidées par tag (voir src/server/cache-tags.ts).
  cacheComponents: true,
  experimental: {
    serverActions: {
      // Envoi d'images et du CV depuis l'admin (5 Mo max par fichier + marge multipart).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
