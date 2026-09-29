import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ExperienceType, Prisma } from "@/generated/prisma/client";
import type { ExperienceInput } from "@/lib/validation/admin";
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
    // Fin la plus récente d'abord (en cours = en tête), puis début le plus récent.
    orderBy: [{ endDate: { sort: "desc", nulls: "first" } }, { startDate: "desc" }],
  });
}

// --- Admin -----------------------------------------------------------------

export function listExperiencesForAdmin() {
  return db.experience.findMany({
    include: experienceInclude,
    orderBy: [
      { type: "asc" },
      { endDate: { sort: "desc", nulls: "first" } },
      { startDate: "desc" },
    ],
  });
}

export function getExperienceForAdmin(id: string) {
  return db.experience.findUnique({
    where: { id },
    include: { skills: { select: { id: true } } },
  });
}

export type ExperienceForAdmin = NonNullable<Awaited<ReturnType<typeof getExperienceForAdmin>>>;

export function createExperience({ skillIds, ...fields }: ExperienceInput) {
  return db.experience.create({
    data: { ...fields, skills: { connect: skillIds.map((id) => ({ id })) } },
  });
}

export function updateExperience(id: string, { skillIds, ...fields }: ExperienceInput) {
  return db.experience.update({
    where: { id },
    data: { ...fields, skills: { set: skillIds.map((id) => ({ id })) } },
  });
}

export function deleteExperience(id: string) {
  return db.experience.delete({ where: { id } });
}
