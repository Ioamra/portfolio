import "server-only";
import { db } from "../db";

/** Le profil est une ligne unique (id = 1), créée par le seed. */
export const PROFILE_ID = 1;

export function getProfile() {
  return db.profile.findUniqueOrThrow({ where: { id: PROFILE_ID } });
}
