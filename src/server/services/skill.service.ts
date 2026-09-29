import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Skill, SkillCategory } from "@/generated/prisma/client";
import { CACHE_TAGS } from "../cache-tags";
import type { SkillInput } from "@/lib/validation/admin";
import { db } from "../db";
import { ConflictError, isUniqueViolation } from "../errors";

export async function listSkills() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.skills);

  return db.skill.findMany({ orderBy: [{ category: "asc" }, { position: "asc" }] });
}

/** Compétences utilisées par au moins un projet publié (pour le filtre de /projets). */
export async function listSkillsUsedInPublishedProjects() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.skills, CACHE_TAGS.projects);

  return db.skill.findMany({
    where: { projects: { some: { published: true } } },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });
}

export function groupSkillsByCategory(skills: Skill[]) {
  const groups = new Map<SkillCategory, Skill[]>();
  for (const skill of skills) {
    const group = groups.get(skill.category) ?? [];
    group.push(skill);
    groups.set(skill.category, group);
  }
  return groups;
}

// --- Admin -----------------------------------------------------------------

export function listSkillsForAdmin() {
  return db.skill.findMany({
    include: { _count: { select: { projects: true, experiences: true } } },
    orderBy: [{ category: "asc" }, { position: "asc" }, { name: "asc" }],
  });
}

export type SkillForAdmin = Awaited<ReturnType<typeof listSkillsForAdmin>>[number];

async function withNameCheck<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueViolation(error)) throw new ConflictError("name", "Cette compétence existe déjà.");
    throw error;
  }
}

export function createSkill(input: SkillInput) {
  return withNameCheck(() => db.skill.create({ data: input }));
}

export function updateSkill(id: string, input: SkillInput) {
  return withNameCheck(() => db.skill.update({ where: { id }, data: input }));
}

/** Les liens avec les projets et expériences sont supprimés avec la compétence. */
export function deleteSkill(id: string) {
  return db.skill.delete({ where: { id } });
}
