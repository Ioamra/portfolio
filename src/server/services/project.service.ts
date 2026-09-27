import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "../cache-tags";
import { db } from "../db";

const skillSelect = {
  select: { id: true, name: true, category: true },
  orderBy: { position: "asc" },
} satisfies Prisma.Project$skillsArgs;

/** Données nécessaires à une carte projet : compétences + image de couverture. */
const projectCardInclude = {
  skills: skillSelect,
  images: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ProjectInclude;

const projectDetailInclude = {
  skills: skillSelect,
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.ProjectInclude;

export type ProjectCard = Prisma.ProjectGetPayload<{ include: typeof projectCardInclude }>;
export type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

const publishedOrder = [
  { position: "asc" },
  { createdAt: "desc" },
] satisfies Prisma.ProjectOrderByWithRelationInput[];

// Les compétences liées font partie du résultat : on étiquette aussi avec "skills"
// pour qu'un renommage de compétence se répercute sur les projets.
function tagProjects() {
  cacheLife("max");
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.skills);
}

export async function listPublishedProjects() {
  "use cache";
  tagProjects();

  return db.project.findMany({
    where: { published: true },
    include: projectCardInclude,
    orderBy: publishedOrder,
  });
}

export async function listFeaturedProjects(limit = 3) {
  "use cache";
  tagProjects();

  return db.project.findMany({
    where: { published: true, featured: true },
    include: projectCardInclude,
    orderBy: publishedOrder,
    take: limit,
  });
}

export async function getPublishedProjectBySlug(slug: string) {
  "use cache";
  tagProjects();

  return db.project.findFirst({
    where: { slug, published: true },
    include: projectDetailInclude,
  });
}

export async function listPublishedProjectSlugs() {
  "use cache";
  tagProjects();

  const projects = await db.project.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return projects.map((project) => project.slug);
}
