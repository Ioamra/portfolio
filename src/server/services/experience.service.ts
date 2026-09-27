import "server-only";
import type { ExperienceType, Prisma } from "@/generated/prisma/client";
import { db } from "../db";

const experienceInclude = {
  skills: { select: { id: true, name: true }, orderBy: { position: "asc" } },
} satisfies Prisma.ExperienceInclude;

export type ExperienceWithSkills = Prisma.ExperienceGetPayload<{
  include: typeof experienceInclude;
}>;

/** Expériences et formations, de la plus récente à la plus ancienne. */
export function listExperiences(type?: ExperienceType) {
  return db.experience.findMany({
    where: type ? { type } : undefined,
    include: experienceInclude,
    orderBy: { startDate: "desc" },
  });
}
