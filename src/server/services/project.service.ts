import "server-only";
import type { Prisma } from "@/generated/prisma/client";
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

export function listPublishedProjects(filter: { skillId?: string } = {}) {
  return db.project.findMany({
    where: {
      published: true,
      ...(filter.skillId && { skills: { some: { id: filter.skillId } } }),
    },
    include: projectCardInclude,
    orderBy: publishedOrder,
  });
}

export function listFeaturedProjects(limit = 3) {
  return db.project.findMany({
    where: { published: true, featured: true },
    include: projectCardInclude,
    orderBy: publishedOrder,
    take: limit,
  });
}

export function getPublishedProjectBySlug(slug: string) {
  return db.project.findFirst({
    where: { slug, published: true },
    include: projectDetailInclude,
  });
}

export async function listPublishedProjectSlugs() {
  const projects = await db.project.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return projects.map((project) => project.slug);
}
