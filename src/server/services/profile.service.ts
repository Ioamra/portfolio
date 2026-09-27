import "server-only";
import { cacheLife, cacheTag } from "next/cache";
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
