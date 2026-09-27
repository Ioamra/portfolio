import "server-only";
import type { Skill, SkillCategory } from "@/generated/prisma/client";
import { db } from "../db";

export function listSkills() {
  return db.skill.findMany({ orderBy: [{ category: "asc" }, { position: "asc" }] });
}

/** Compétences utilisées par au moins un projet publié (pour le filtre de /projets). */
export function listSkillsUsedInPublishedProjects() {
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
