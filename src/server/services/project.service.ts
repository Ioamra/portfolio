import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { ProjectInput } from "@/lib/validation/admin";
import { CACHE_TAGS } from "../cache-tags";
import { db } from "../db";
import { ConflictError, isUniqueViolation } from "../errors";
import { deleteStored } from "../uploads";

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

export async function listPublishedProjectsForSitemap() {
  "use cache";
  tagProjects();

  return db.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: publishedOrder,
  });
}

// --- Admin (sans cache : l'admin voit l'état réel, y compris les brouillons) ---

export function listProjectsForAdmin() {
  return db.project.findMany({
    include: {
      skills: { select: { name: true }, orderBy: { position: "asc" } },
      _count: { select: { images: true } },
    },
    orderBy: publishedOrder,
  });
}

export function getProjectForAdmin(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      skills: { select: { id: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export type ProjectForAdmin = NonNullable<Awaited<ReturnType<typeof getProjectForAdmin>>>;

function toProjectData({ skillIds, ...fields }: ProjectInput) {
  return { fields, skills: skillIds.map((id) => ({ id })) };
}

async function withSlugCheck<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (isUniqueViolation(error)) throw new ConflictError("slug", "Ce slug est déjà utilisé.");
    throw error;
  }
}

export function createProject(input: ProjectInput) {
  const { fields, skills } = toProjectData(input);
  return withSlugCheck(() =>
    db.project.create({ data: { ...fields, skills: { connect: skills } } }),
  );
}

export function updateProject(id: string, input: ProjectInput) {
  const { fields, skills } = toProjectData(input);
  return withSlugCheck(() =>
    db.project.update({ where: { id }, data: { ...fields, skills: { set: skills } } }),
  );
}

export async function deleteProject(id: string) {
  // Les lignes project_images partent en cascade ; on supprime aussi les fichiers.
  await db.project.delete({ where: { id } });
  await deleteStored(`projects/${id}`);
}

export async function addProjectImage(projectId: string, path: string, alt: string) {
  const last = await db.projectImage.findFirst({
    where: { projectId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return db.projectImage.create({
    data: { projectId, path, alt, position: (last?.position ?? -1) + 1 },
  });
}

export function updateProjectImageAlt(imageId: string, alt: string) {
  return db.projectImage.update({ where: { id: imageId }, data: { alt } });
}

/** Déplace une image d'un cran ; la première image sert de couverture. */
export async function moveProjectImage(imageId: string, direction: "up" | "down") {
  const image = await db.projectImage.findUniqueOrThrow({ where: { id: imageId } });
  const images = await db.projectImage.findMany({
    where: { projectId: image.projectId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  const from = images.findIndex(({ id }) => id === imageId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= images.length) return;
  [images[from], images[to]] = [images[to], images[from]];

  // Positions renumérotées 0..n dans une transaction : l'ordre reste cohérent.
  await db.$transaction(
    images.map(({ id }, position) => db.projectImage.update({ where: { id }, data: { position } })),
  );
}

export async function deleteProjectImage(imageId: string) {
  const image = await db.projectImage.delete({ where: { id: imageId } });
  await deleteStored(image.path);
  return image;
}
