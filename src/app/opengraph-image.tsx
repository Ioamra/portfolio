import { OG_SIZE, renderOgImage } from "@/server/metadata-images";
import { getProfile } from "@/server/services/profile.service";

// Image d'aperçu par défaut du site (accueil et pages sans image propre).
export const alt = "Portfolio de développeur full-stack";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const profile = await getProfile();
  return renderOgImage({
    eyebrow: "Portfolio",
    title: profile.fullName,
    subtitle: profile.headline,
  });
}
