import { OG_SIZE, renderOgImage } from "@/server/metadata-images";
import { getProfile } from "@/server/services/profile.service";
import {
  getPublishedProjectBySlug,
  listPublishedProjectSlugs,
} from "@/server/services/project.service";

// Image d'aperçu propre à chaque projet.
export const alt = "Aperçu du projet";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await listPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, profile] = await Promise.all([getPublishedProjectBySlug(slug), getProfile()]);

  return renderOgImage({
    eyebrow: `Projet · ${profile.fullName}`,
    title: project?.title ?? "Projet",
    subtitle: project?.summary ?? profile.headline,
  });
}
