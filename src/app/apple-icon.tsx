import { renderIcon } from "@/server/metadata-images";
import { getProfile } from "@/server/services/profile.service";

// Icône « ajout à l'écran d'accueil » (iOS).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const profile = await getProfile();
  return renderIcon(profile.fullName, size.width);
}
