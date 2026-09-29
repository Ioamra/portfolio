import type { ExperienceType, ProjectKind, SkillCategory } from "@/generated/prisma/enums";

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  LANGUAGE: "Langages",
  BACKEND: "Back-end",
  FRONTEND: "Front-end",
  DATABASE: "Base de données",
  DEVOPS: "DevOps",
  TOOLS: "Tests & outils",
};

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  PROFESSIONAL: "Professionnel",
  PERSONAL: "Personnel",
  ACADEMIC: "Académique",
};

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  WORK: "Expériences",
  EDUCATION: "Formations",
};
