import { renderIcon } from "@/server/metadata-images";
import { getProfile } from "@/server/services/profile.service";

// Favicon : initiales du profil.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const profile = await getProfile();
  return renderIcon(profile.fullName, size.width);
}
