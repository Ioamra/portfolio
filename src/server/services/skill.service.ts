import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Skill, SkillCategory } from "@/generated/prisma/client";
import { CACHE_TAGS } from "../cache-tags";
import { db } from "../db";

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
