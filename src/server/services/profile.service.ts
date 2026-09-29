import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ProfileInput } from "@/lib/validation/admin";
import { CACHE_TAGS } from "../cache-tags";
import { db } from "../db";

/** Le profil est une ligne unique (id = 1), créée par le seed. */
export const PROFILE_ID = 1;

export async function getProfile() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.profile);

  return db.profile.findUniqueOrThrow({ where: { id: PROFILE_ID } });
}

// --- Admin -----------------------------------------------------------------

export function getProfileForAdmin() {
  return db.profile.findUniqueOrThrow({ where: { id: PROFILE_ID } });
}

export function updateProfile(input: ProfileInput) {
  return db.profile.update({ where: { id: PROFILE_ID }, data: input });
}

export function setCvPath(cvPath: string | null) {
  return db.profile.update({ where: { id: PROFILE_ID }, data: { cvPath } });
}
