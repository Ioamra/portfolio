import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ExperienceType, Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "../cache-tags";
import { db } from "../db";

const experienceInclude = {
  skills: { select: { id: true, name: true }, orderBy: { position: "asc" } },
} satisfies Prisma.ExperienceInclude;

export type ExperienceWithSkills = Prisma.ExperienceGetPayload<{
  include: typeof experienceInclude;
}>;

/** Expériences et formations, de la plus récente à la plus ancienne. */
export async function listExperiences(type?: ExperienceType) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.experiences, CACHE_TAGS.skills);

  return db.experience.findMany({
    where: type ? { type } : undefined,
    include: experienceInclude,
    orderBy: { startDate: "desc" },
  });
}
